import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import type { ServerEnv } from '../../config/env.js';
import { writeAuditLog, type AuditContext } from '../audit/audit.service.js';
import { Tenant } from '../auth/tenant.model.js';
import { AccountingConnection } from './accounting-connection.model.js';
import type { IPayrollPeriodDocument } from './payroll-period.model.js';
import { PayrollPeriod } from './payroll-period.model.js';
import { formatDateOnly, roundMoney } from './payroll.utils.js';
import {
  XeroClientError,
  buildXeroAuthorizationUrl,
  createXeroManualJournal,
  exchangeXeroCode,
  fetchXeroConnections,
  isXeroConfigured,
  refreshXeroToken,
} from './xero.client.js';

const DEFAULT_XERO_EXPENSE_ACCOUNT = '477';
const DEFAULT_XERO_PAYABLE_ACCOUNT = '804';
const OAUTH_STATE_EXPIRY = '10m';

interface OAuthStatePayload {
  tenantId: string;
  userId: string;
  type: 'xero_oauth';
}

export class AccountingServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'AccountingServiceError';
  }
}

export interface AccountingConnectionStatus {
  provider: 'xero';
  configured: boolean;
  connected: boolean;
  organisationName?: string;
  connectedAt?: string;
  expenseAccountCode: string;
  payableAccountCode: string;
}

export interface PayrollSyncResult {
  periodId: string;
  provider: 'xero';
  externalReference: string;
  syncedAt: string;
}

const signOAuthState = (env: ServerEnv, tenantId: string, userId: string): string => {
  const payload: OAuthStatePayload = { tenantId, userId, type: 'xero_oauth' };
  return jwt.sign(payload, env.adminJwtSecret, { expiresIn: OAUTH_STATE_EXPIRY });
};

const verifyOAuthState = (env: ServerEnv, state: string): OAuthStatePayload => {
  const payload = jwt.verify(state, env.adminJwtSecret) as OAuthStatePayload;
  if (payload.type !== 'xero_oauth') {
    throw new AccountingServiceError('Invalid OAuth state', 400);
  }
  return payload;
};

const getAccountCodes = async (
  tenantId: string
): Promise<{ expenseAccountCode: string; payableAccountCode: string }> => {
  const tenant = await Tenant.findById(tenantId).select(
    'xeroExpenseAccountCode xeroPayableAccountCode'
  );

  return {
    expenseAccountCode: tenant?.xeroExpenseAccountCode ?? DEFAULT_XERO_EXPENSE_ACCOUNT,
    payableAccountCode: tenant?.xeroPayableAccountCode ?? DEFAULT_XERO_PAYABLE_ACCOUNT,
  };
};

const ensureFreshConnection = async (
  env: ServerEnv,
  connection: InstanceType<typeof AccountingConnection>
): Promise<InstanceType<typeof AccountingConnection>> => {
  const bufferMs = 60_000;
  if (connection.expiresAt.getTime() > Date.now() + bufferMs) {
    return connection;
  }

  const tokens = await refreshXeroToken(env, connection.refreshToken);
  connection.accessToken = tokens.accessToken;
  connection.refreshToken = tokens.refreshToken;
  connection.expiresAt = tokens.expiresAt;
  await connection.save();
  return connection;
};

export const getAccountingConnectionStatus = async (
  env: ServerEnv,
  tenantId: string
): Promise<AccountingConnectionStatus> => {
  const accountCodes = await getAccountCodes(tenantId);
  const connection = await AccountingConnection.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    provider: 'xero',
  });

  return {
    provider: 'xero',
    configured: isXeroConfigured(env),
    connected: Boolean(connection),
    organisationName: connection?.externalTenantName,
    connectedAt: connection?.connectedAt.toISOString(),
    expenseAccountCode: accountCodes.expenseAccountCode,
    payableAccountCode: accountCodes.payableAccountCode,
  };
};

export const getXeroConnectUrl = (
  env: ServerEnv,
  tenantId: string,
  userId: string
): string => {
  const state = signOAuthState(env, tenantId, userId);
  return buildXeroAuthorizationUrl(env, state);
};

export const completeXeroOAuth = async (
  env: ServerEnv,
  code: string,
  state: string
): Promise<{ tenantId: string }> => {
  const { tenantId, userId } = verifyOAuthState(env, state);
  const tokens = await exchangeXeroCode(env, code);
  const connections = await fetchXeroConnections(tokens.accessToken);

  if (connections.length === 0) {
    throw new AccountingServiceError('No Xero organisations found for this account', 400);
  }

  const organisation = connections[0];

  await AccountingConnection.findOneAndUpdate(
    { tenantId: new mongoose.Types.ObjectId(tenantId), provider: 'xero' },
    {
      tenantId: new mongoose.Types.ObjectId(tenantId),
      provider: 'xero',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      externalTenantId: organisation.tenantId,
      externalTenantName: organisation.tenantName,
      connectedAt: new Date(),
      connectedBy: new mongoose.Types.ObjectId(userId),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return { tenantId };
};

export const disconnectAccounting = async (tenantId: string): Promise<void> => {
  await AccountingConnection.deleteOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    provider: 'xero',
  });
};

const periodAuditSnapshot = (period: IPayrollPeriodDocument): Record<string, unknown> => ({
  periodStart: formatDateOnly(period.periodStart),
  periodEnd: formatDateOnly(period.periodEnd),
  status: period.status,
  employeeCount: period.employeeSummaries.length,
  totalGross: roundMoney(
    period.employeeSummaries.reduce((sum, row) => sum + row.grossEstimate, 0)
  ),
});

export const syncPayrollPeriodToXero = async (
  env: ServerEnv,
  tenantId: string,
  periodId: string,
  userId: string,
  auditContext?: AuditContext
): Promise<PayrollSyncResult> => {
  if (!mongoose.isValidObjectId(periodId)) {
    throw new AccountingServiceError('Invalid payroll period id', 400);
  }

  if (!isXeroConfigured(env)) {
    throw new AccountingServiceError('Xero integration is not configured on the server', 503);
  }

  const connection = await AccountingConnection.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    provider: 'xero',
  });

  if (!connection) {
    throw new AccountingServiceError('Connect Xero in payroll settings before syncing', 409);
  }

  const period = await PayrollPeriod.findOne({
    _id: periodId,
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!period) {
    throw new AccountingServiceError('Payroll period not found', 404);
  }

  if (period.status === 'draft') {
    throw new AccountingServiceError('Generate payroll before syncing to Xero', 409);
  }

  if (period.employeeSummaries.length === 0) {
    throw new AccountingServiceError('Payroll period has no employee summaries to sync', 409);
  }

  const { expenseAccountCode, payableAccountCode } = await getAccountCodes(tenantId);
  const freshConnection = await ensureFreshConnection(env, connection);

  const periodStart = formatDateOnly(period.periodStart);
  const periodEnd = formatDateOnly(period.periodEnd);
  const narration = `Payroll ${periodStart} to ${periodEnd}`;

  const employeeLines = period.employeeSummaries
    .filter((summary) => summary.grossEstimate > 0)
    .map((summary) => ({
      Description: `${summary.employeeName} — payroll`,
      LineAmount: summary.grossEstimate,
      AccountCode: expenseAccountCode,
      TaxType: 'NONE' as const,
    }));

  const totalGross = roundMoney(
    period.employeeSummaries.reduce((sum, row) => sum + row.grossEstimate, 0)
  );

  if (totalGross <= 0) {
    throw new AccountingServiceError('Payroll period has no gross amounts to sync', 409);
  }

  const journalLines = [
    ...employeeLines,
    {
      Description: 'Payroll payable',
      LineAmount: -totalGross,
      AccountCode: payableAccountCode,
      TaxType: 'NONE' as const,
    },
  ];

  const journalId = await createXeroManualJournal(
    freshConnection.accessToken,
    freshConnection.externalTenantId,
    {
      narration,
      date: periodEnd,
      lines: journalLines,
    }
  );

  const syncedAt = new Date();
  const before = periodAuditSnapshot(period);

  if (period.status === 'generated') {
    period.status = 'exported';
    period.exportedAt = syncedAt;
    period.exportedBy = new mongoose.Types.ObjectId(userId);
  }

  period.accountingProvider = 'xero';
  period.accountingReference = journalId;
  period.accountingSyncedAt = syncedAt;
  period.accountingSyncedBy = new mongoose.Types.ObjectId(userId);
  await period.save();

  await writeAuditLog({
    tenantId,
    userId,
    action: 'update',
    entityType: 'PayrollPeriod',
    entityId: period._id.toString(),
    before,
    after: {
      ...periodAuditSnapshot(period),
      accountingProvider: 'xero',
      accountingReference: journalId,
    },
    context: auditContext,
  });

  return {
    periodId: period._id.toString(),
    provider: 'xero',
    externalReference: journalId,
    syncedAt: syncedAt.toISOString(),
  };
};

export const mapAccountingError = (error: unknown): AccountingServiceError | null => {
  if (error instanceof AccountingServiceError) {
    return error;
  }
  if (error instanceof XeroClientError) {
    return new AccountingServiceError(error.message, error.statusCode);
  }
  if (error instanceof jwt.JsonWebTokenError) {
    return new AccountingServiceError('Invalid or expired OAuth state', 400);
  }
  return null;
};
