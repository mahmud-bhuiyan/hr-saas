import mongoose from 'mongoose';
import type { ServerEnv } from '../../config/env.js';
import type { UserRole } from '../../types/index.js';
import { hasPermission } from '../../utils/permissions.js';
import { writeAuditLog, type AuditContext } from '../audit/audit.service.js';
import { User } from '../admin/user.model.js';
import { Employee, type IEmployeeDocument } from '../employees/employee.model.js';
import { resolveEmployeeForUser, LeaveServiceError } from '../leave/leave.service.js';
import {
  sendExpenseApprovedEmail,
  sendExpenseDeclinedEmail,
  sendExpenseSubmittedEmail,
} from '../notifications/email.service.js';
import { createInAppNotification } from '../notifications/notification.service.js';
import {
  buildExpenseFileKey,
  createPresignedDownloadUrl,
  createPresignedUploadUrl,
  verifyObjectExists,
} from '../documents/s3.service.js';
import {
  Expense,
  type IExpenseDocument,
  type ExpenseStatus,
} from './expense.model.js';
import type {
  CreateExpenseInput,
  ExportExpensesQuery,
  ListExpensesQuery,
  PatchExpenseInput,
  PresignExpenseInput,
} from './expense.validation.js';

export class ExpenseServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'ExpenseServiceError';
  }
}

interface AccessContext {
  userId: string;
  userEmail: string;
  role: UserRole;
}

export interface ExpenseEmployeeSummary {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface ExpensePublic {
  id: string;
  employeeId: string;
  employee?: ExpenseEmployeeSummary;
  category: IExpenseDocument['category'];
  amount: number;
  currency: string;
  date: string;
  description: string;
  receiptFileName: string;
  mimeType: string;
  fileSize: number;
  status: ExpenseStatus;
  approverId?: string;
  approvedAt?: string;
  declineReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedExpenses {
  expenses: ExpensePublic[];
  total: number;
  page: number;
  limit: number;
}

export interface PresignExpenseResult {
  uploadUrl: string;
  fileKey: string;
}

export interface ExpenseReceiptDownloadResult {
  downloadUrl: string;
  fileName: string;
}

const canApproveAll = (role: UserRole): boolean => hasPermission(role, 'expense:approve');

const canApproveTeam = (role: UserRole): boolean => hasPermission(role, 'expense:approve:team');

const canReadOwn = (role: UserRole): boolean => hasPermission(role, 'expense:read:own');

const canExport = (role: UserRole): boolean => hasPermission(role, 'expense:export');

const formatDateString = (date: Date): string => date.toISOString().slice(0, 10);

const parseDateString = (value: string): Date => {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new ExpenseServiceError('Invalid date', 400);
  }
  return date;
};

const toEmployeeSummary = (employee: IEmployeeDocument): ExpenseEmployeeSummary => ({
  id: employee._id.toString(),
  firstName: employee.firstName,
  lastName: employee.lastName,
  email: employee.email,
});

const expenseAuditSnapshot = (expense: IExpenseDocument): Record<string, unknown> => ({
  employeeId: expense.employeeId.toString(),
  category: expense.category,
  amount: expense.amount,
  currency: expense.currency,
  date: formatDateString(expense.date),
  description: expense.description,
  status: expense.status,
  receiptFileName: expense.receiptFileName,
});

const toExpensePublic = async (
  expense: IExpenseDocument,
  includeEmployee = false
): Promise<ExpensePublic> => {
  let employee: ExpenseEmployeeSummary | undefined;

  if (includeEmployee) {
    const record = await Employee.findById(expense.employeeId);
    if (record) {
      employee = toEmployeeSummary(record);
    }
  }

  return {
    id: expense._id.toString(),
    employeeId: expense.employeeId.toString(),
    employee,
    category: expense.category,
    amount: expense.amount,
    currency: expense.currency,
    date: formatDateString(expense.date),
    description: expense.description,
    receiptFileName: expense.receiptFileName,
    mimeType: expense.mimeType,
    fileSize: expense.fileSize,
    status: expense.status,
    approverId: expense.approverId?.toString(),
    approvedAt: expense.approvedAt?.toISOString(),
    declineReason: expense.declineReason ?? undefined,
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString(),
  };
};

const assertFileKeyForTenant = (tenantId: string, fileKey: string): void => {
  const prefix = `${tenantId}/expenses/`;
  if (!fileKey.startsWith(prefix)) {
    throw new ExpenseServiceError('Invalid receipt file key for tenant', 400);
  }
};

const getTeamEmployeeIds = async (
  tenantId: string,
  access: AccessContext
): Promise<mongoose.Types.ObjectId[] | null> => {
  if (canApproveAll(access.role)) {
    return null;
  }

  const manager = await resolveEmployeeForUser(tenantId, access.userId, access.userEmail);
  const reports = await Employee.find({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    managerId: manager._id,
    status: 'active',
  }).select('_id');

  return reports.map((report) => report._id);
};

const findApproverRecipientEmail = async (
  tenantId: string,
  employee: IEmployeeDocument
): Promise<string | null> => {
  if (employee.managerId) {
    const manager = await Employee.findOne({
      _id: employee.managerId,
      tenantId: new mongoose.Types.ObjectId(tenantId),
    });
    if (manager?.email) {
      return manager.email;
    }
  }

  const hrUser = await User.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    role: { $in: ['hr_manager', 'company_admin'] },
  }).sort({ createdAt: 1 });

  return hrUser?.email ?? null;
};

const findApproverUserIds = async (
  tenantId: string,
  employee: IEmployeeDocument
): Promise<string[]> => {
  if (employee.managerId) {
    const manager = await Employee.findOne({
      _id: employee.managerId,
      tenantId: new mongoose.Types.ObjectId(tenantId),
    });
    if (manager?.userId) {
      return [manager.userId.toString()];
    }
  }

  const hrUsers = await User.find({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    role: { $in: ['hr_manager', 'company_admin'] },
    isActive: true,
  }).select('_id');

  return hrUsers.map((user) => user._id.toString());
};

const assertCanAccessExpense = async (
  tenantId: string,
  expense: IExpenseDocument,
  access: AccessContext
): Promise<void> => {
  if (canApproveAll(access.role)) {
    return;
  }

  if (canApproveTeam(access.role)) {
    const teamIds = await getTeamEmployeeIds(tenantId, access);
    if (teamIds?.some((id) => id.toString() === expense.employeeId.toString())) {
      return;
    }
  }

  if (canReadOwn(access.role)) {
    const employee = await resolveEmployeeForUser(tenantId, access.userId, access.userEmail);
    if (expense.employeeId.toString() === employee._id.toString()) {
      return;
    }
  }

  throw new ExpenseServiceError('Forbidden', 403);
};

const assertCanApproveExpense = async (
  tenantId: string,
  expense: IExpenseDocument,
  access: AccessContext
): Promise<void> => {
  if (expense.status !== 'pending') {
    throw new ExpenseServiceError('Only pending expenses can be approved or declined', 400);
  }

  if (canApproveAll(access.role)) {
    return;
  }

  if (canApproveTeam(access.role)) {
    const teamIds = await getTeamEmployeeIds(tenantId, access);
    if (teamIds?.some((id) => id.toString() === expense.employeeId.toString())) {
      return;
    }
  }

  throw new ExpenseServiceError('Forbidden', 403);
};

const assertOwnPendingExpense = async (
  tenantId: string,
  expense: IExpenseDocument,
  access: AccessContext
): Promise<IEmployeeDocument> => {
  const employee = await resolveEmployeeForUser(tenantId, access.userId, access.userEmail);

  if (expense.employeeId.toString() !== employee._id.toString()) {
    throw new ExpenseServiceError('Forbidden', 403);
  }

  if (expense.status !== 'pending') {
    throw new ExpenseServiceError('Only pending expenses can be edited', 400);
  }

  return employee;
};

export const mapExpenseError = (error: unknown): unknown => {
  if (error instanceof LeaveServiceError) {
    return new ExpenseServiceError(error.message, error.statusCode);
  }
  return error;
};

export const presignExpenseUpload = async (
  env: ServerEnv,
  tenantId: string,
  input: PresignExpenseInput,
  access: AccessContext
): Promise<PresignExpenseResult> => {
  await resolveEmployeeForUser(tenantId, access.userId, access.userEmail);

  const fileKey = buildExpenseFileKey(tenantId, input.fileName);
  const uploadUrl = await createPresignedUploadUrl(env, fileKey, input.mimeType);

  return { uploadUrl, fileKey };
};

export const createExpense = async (
  env: ServerEnv,
  tenantId: string,
  input: CreateExpenseInput,
  access: AccessContext,
  audit?: AuditContext
): Promise<ExpensePublic> => {
  assertFileKeyForTenant(tenantId, input.receiptFileKey);

  const employee = await resolveEmployeeForUser(tenantId, access.userId, access.userEmail);

  const exists = await verifyObjectExists(env, input.receiptFileKey);
  if (!exists) {
    throw new ExpenseServiceError(
      'Receipt not found in storage. Upload the file before submitting the expense.',
      400
    );
  }

  const expense = await Expense.create({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    employeeId: employee._id,
    category: input.category,
    amount: input.amount,
    currency: input.currency,
    date: parseDateString(input.date),
    description: input.description,
    receiptFileKey: input.receiptFileKey,
    receiptFileName: input.receiptFileName,
    mimeType: input.mimeType,
    fileSize: input.fileSize,
    status: 'pending',
  });

  const recipientEmail = await findApproverRecipientEmail(tenantId, employee);
  if (recipientEmail) {
    void sendExpenseSubmittedEmail(env, {
      to: recipientEmail,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      category: input.category,
      amount: input.amount,
      currency: input.currency,
      date: input.date,
      description: input.description,
    });
  }

  const approverUserIds = await findApproverUserIds(tenantId, employee);
  for (const approverUserId of approverUserIds) {
    void createInAppNotification({
      tenantId,
      userId: approverUserId,
      type: 'expense_submitted',
      title: 'Expense submitted',
      body: `${employee.firstName} ${employee.lastName} submitted a ${input.currency} ${input.amount.toFixed(2)} ${input.category} expense.`,
      metadata: { expenseId: expense._id.toString(), employeeId: employee._id.toString() },
    });
  }

  void writeAuditLog({
    tenantId,
    userId: access.userId,
    action: 'create',
    entityType: 'Expense',
    entityId: expense._id.toString(),
    after: expenseAuditSnapshot(expense),
    context: audit,
  });

  return toExpensePublic(expense);
};

export const listExpenses = async (
  tenantId: string,
  query: ListExpensesQuery,
  access: AccessContext
): Promise<PaginatedExpenses> => {
  const filter: Record<string, unknown> = {
    tenantId: new mongoose.Types.ObjectId(tenantId),
  };

  if (query.scope === 'approval') {
    if (!canApproveAll(access.role) && !canApproveTeam(access.role)) {
      throw new ExpenseServiceError('Forbidden', 403);
    }

    filter.status = query.status ?? 'pending';
    const teamIds = await getTeamEmployeeIds(tenantId, access);
    if (teamIds) {
      if (teamIds.length === 0) {
        return { expenses: [], total: 0, page: query.page, limit: query.limit };
      }
      filter.employeeId = { $in: teamIds };
    }
  } else {
    if (!canReadOwn(access.role)) {
      throw new ExpenseServiceError('Forbidden', 403);
    }

    const employee = await resolveEmployeeForUser(tenantId, access.userId, access.userEmail);
    filter.employeeId = employee._id;

    if (query.status) {
      filter.status = query.status;
    }
  }

  const skip = (query.page - 1) * query.limit;
  const [docs, total] = await Promise.all([
    Expense.find(filter).sort({ date: -1, createdAt: -1 }).skip(skip).limit(query.limit),
    Expense.countDocuments(filter),
  ]);

  return {
    expenses: await Promise.all(
      docs.map((doc) => toExpensePublic(doc, query.scope === 'approval'))
    ),
    total,
    page: query.page,
    limit: query.limit,
  };
};

export const getExpenseById = async (
  tenantId: string,
  expenseId: string,
  access: AccessContext
): Promise<ExpensePublic> => {
  const expense = await Expense.findOne({
    _id: new mongoose.Types.ObjectId(expenseId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!expense) {
    throw new ExpenseServiceError('Expense not found', 404);
  }

  await assertCanAccessExpense(tenantId, expense, access);
  return toExpensePublic(expense, true);
};

export const patchExpense = async (
  tenantId: string,
  expenseId: string,
  input: PatchExpenseInput,
  access: AccessContext,
  audit?: AuditContext
): Promise<ExpensePublic> => {
  const expense = await Expense.findOne({
    _id: new mongoose.Types.ObjectId(expenseId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!expense) {
    throw new ExpenseServiceError('Expense not found', 404);
  }

  await assertOwnPendingExpense(tenantId, expense, access);

  const before = expenseAuditSnapshot(expense);

  if (input.category !== undefined) expense.category = input.category;
  if (input.amount !== undefined) expense.amount = input.amount;
  if (input.currency !== undefined) expense.currency = input.currency;
  if (input.date !== undefined) expense.date = parseDateString(input.date);
  if (input.description !== undefined) expense.description = input.description;

  await expense.save();

  void writeAuditLog({
    tenantId,
    userId: access.userId,
    action: 'update',
    entityType: 'Expense',
    entityId: expense._id.toString(),
    before,
    after: expenseAuditSnapshot(expense),
    context: audit,
  });

  return toExpensePublic(expense);
};

export const approveExpense = async (
  tenantId: string,
  expenseId: string,
  access: AccessContext,
  env: ServerEnv,
  audit?: AuditContext
): Promise<ExpensePublic> => {
  const expense = await Expense.findOne({
    _id: new mongoose.Types.ObjectId(expenseId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!expense) {
    throw new ExpenseServiceError('Expense not found', 404);
  }

  await assertCanApproveExpense(tenantId, expense, access);

  const before = expenseAuditSnapshot(expense);

  expense.status = 'approved';
  expense.approverId = new mongoose.Types.ObjectId(access.userId);
  expense.approvedAt = new Date();
  expense.declineReason = null;
  await expense.save();

  const employee = await Employee.findById(expense.employeeId);
  const approver = await User.findById(access.userId);

  if (employee?.email) {
    void sendExpenseApprovedEmail(env, {
      to: employee.email,
      category: expense.category,
      amount: expense.amount,
      currency: expense.currency,
      date: formatDateString(expense.date),
      approverName: approver
        ? `${approver.firstName ?? ''} ${approver.lastName ?? ''}`.trim() || approver.email
        : 'Approver',
    });
  }

  if (employee?.userId) {
    void createInAppNotification({
      tenantId,
      userId: employee.userId.toString(),
      type: 'expense_approved',
      title: 'Expense approved',
      body: `Your ${expense.currency} ${expense.amount.toFixed(2)} ${expense.category} expense was approved.`,
      metadata: { expenseId: expense._id.toString() },
    });
  }

  void writeAuditLog({
    tenantId,
    userId: access.userId,
    action: 'update',
    entityType: 'Expense',
    entityId: expense._id.toString(),
    before,
    after: expenseAuditSnapshot(expense),
    context: audit,
  });

  return toExpensePublic(expense, true);
};

export const declineExpense = async (
  tenantId: string,
  expenseId: string,
  declineReason: string | undefined,
  access: AccessContext,
  env: ServerEnv,
  audit?: AuditContext
): Promise<ExpensePublic> => {
  const expense = await Expense.findOne({
    _id: new mongoose.Types.ObjectId(expenseId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!expense) {
    throw new ExpenseServiceError('Expense not found', 404);
  }

  await assertCanApproveExpense(tenantId, expense, access);

  const before = expenseAuditSnapshot(expense);

  expense.status = 'declined';
  expense.approverId = new mongoose.Types.ObjectId(access.userId);
  expense.approvedAt = new Date();
  expense.declineReason = declineReason ?? null;
  await expense.save();

  const employee = await Employee.findById(expense.employeeId);

  if (employee?.email) {
    void sendExpenseDeclinedEmail(env, {
      to: employee.email,
      category: expense.category,
      amount: expense.amount,
      currency: expense.currency,
      date: formatDateString(expense.date),
      declineReason,
    });
  }

  if (employee?.userId) {
    void createInAppNotification({
      tenantId,
      userId: employee.userId.toString(),
      type: 'expense_declined',
      title: 'Expense declined',
      body: `Your ${expense.currency} ${expense.amount.toFixed(2)} ${expense.category} expense was declined.`,
      metadata: { expenseId: expense._id.toString() },
    });
  }

  void writeAuditLog({
    tenantId,
    userId: access.userId,
    action: 'update',
    entityType: 'Expense',
    entityId: expense._id.toString(),
    before,
    after: expenseAuditSnapshot(expense),
    context: audit,
  });

  return toExpensePublic(expense, true);
};

export const getExpenseReceiptDownloadUrl = async (
  env: ServerEnv,
  tenantId: string,
  expenseId: string,
  access: AccessContext
): Promise<ExpenseReceiptDownloadResult> => {
  const expense = await Expense.findOne({
    _id: new mongoose.Types.ObjectId(expenseId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!expense) {
    throw new ExpenseServiceError('Expense not found', 404);
  }

  await assertCanAccessExpense(tenantId, expense, access);

  const downloadUrl = await createPresignedDownloadUrl(
    env,
    expense.receiptFileKey,
    expense.receiptFileName
  );

  return {
    downloadUrl,
    fileName: expense.receiptFileName,
  };
};

const escapeCsvValue = (value: string): string => {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const exportExpensesCsv = async (
  tenantId: string,
  query: ExportExpensesQuery,
  access: AccessContext
): Promise<string> => {
  if (!canExport(access.role)) {
    throw new ExpenseServiceError('Forbidden', 403);
  }

  const filter: Record<string, unknown> = {
    tenantId: new mongoose.Types.ObjectId(tenantId),
    status: query.status,
  };

  if (query.from || query.to) {
    const dateFilter: Record<string, Date> = {};
    if (query.from) {
      dateFilter.$gte = parseDateString(query.from);
    }
    if (query.to) {
      const toDate = parseDateString(query.to);
      toDate.setUTCDate(toDate.getUTCDate() + 1);
      dateFilter.$lt = toDate;
    }
    filter.date = dateFilter;
  }

  const expenses = await Expense.find(filter).sort({ date: 1, createdAt: 1 });
  const employeeIds = [...new Set(expenses.map((expense) => expense.employeeId.toString()))];
  const employees = await Employee.find({
    _id: { $in: employeeIds.map((id) => new mongoose.Types.ObjectId(id)) },
  });
  const employeeMap = new Map(employees.map((employee) => [employee._id.toString(), employee]));

  const header = [
    'date',
    'employee',
    'category',
    'amount',
    'currency',
    'description',
    'status',
    'approvedAt',
  ].join(',');

  const rows = expenses.map((expense) => {
    const employee = employeeMap.get(expense.employeeId.toString());
    const employeeName = employee
      ? `${employee.firstName} ${employee.lastName}`
      : expense.employeeId.toString();

    return [
      formatDateString(expense.date),
      escapeCsvValue(employeeName),
      expense.category,
      expense.amount.toFixed(2),
      expense.currency,
      escapeCsvValue(expense.description),
      expense.status,
      expense.approvedAt ? expense.approvedAt.toISOString() : '',
    ].join(',');
  });

  return [header, ...rows].join('\n');
};
