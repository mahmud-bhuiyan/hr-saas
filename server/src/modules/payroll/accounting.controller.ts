import type { Response } from 'express';
import type { ServerEnv } from '../../config/env.js';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import {
  AccountingServiceError,
  completeXeroOAuth,
  disconnectAccounting,
  getAccountingConnectionStatus,
  getXeroConnectUrl,
  mapAccountingError,
  syncPayrollPeriodToXero,
} from './accounting.service.js';

const getAuditContext = (req: AuthenticatedRequest) => ({
  ip: req.ip,
  userAgent: req.get('user-agent') ?? undefined,
});

export const accountingStatusHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.tenantId) {
        res.status(403).json({ status: 'error', message: 'Tenant context required' });
        return;
      }

      const status = await getAccountingConnectionStatus(env, req.tenantId);
      res.json({ status: 'ok', data: status });
    } catch (error) {
      const mapped = mapAccountingError(error);
      if (mapped) {
        res.status(mapped.statusCode).json({ status: 'error', message: mapped.message });
        return;
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };
};

export const accountingConnectHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.tenantId) {
        res.status(403).json({ status: 'error', message: 'Tenant context required' });
        return;
      }

      const url = getXeroConnectUrl(env, req.tenantId, req.user.sub);
      res.json({ status: 'ok', data: { url } });
    } catch (error) {
      const mapped = mapAccountingError(error);
      if (mapped) {
        res.status(mapped.statusCode).json({ status: 'error', message: mapped.message });
        return;
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };
};

export const accountingCallbackHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const redirectBase = `${env.clientUrl}/dashboard/settings/payroll`;

    try {
      const code = typeof req.query.code === 'string' ? req.query.code : '';
      const state = typeof req.query.state === 'string' ? req.query.state : '';

      if (!code || !state) {
        res.redirect(`${redirectBase}?xero=error&message=missing_oauth_params`);
        return;
      }

      await completeXeroOAuth(env, code, state);
      res.redirect(`${redirectBase}?xero=connected`);
    } catch (error) {
      const mapped = mapAccountingError(error);
      const message = encodeURIComponent(mapped?.message ?? 'oauth_failed');
      res.redirect(`${redirectBase}?xero=error&message=${message}`);
    }
  };
};

export const accountingDisconnectHandler = () => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.tenantId) {
        res.status(403).json({ status: 'error', message: 'Tenant context required' });
        return;
      }

      await disconnectAccounting(req.tenantId);
      res.json({ status: 'ok', data: { disconnected: true } });
    } catch (error) {
      const mapped = mapAccountingError(error);
      if (mapped) {
        res.status(mapped.statusCode).json({ status: 'error', message: mapped.message });
        return;
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };
};

export const syncPayrollPeriodHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user || !req.tenantId) {
        res.status(403).json({ status: 'error', message: 'Tenant context required' });
        return;
      }

      const result = await syncPayrollPeriodToXero(
        env,
        req.tenantId,
        req.params.id,
        req.user.sub,
        getAuditContext(req)
      );

      res.json({ status: 'ok', data: result });
    } catch (error) {
      const mapped = mapAccountingError(error);
      if (mapped) {
        res.status(mapped.statusCode).json({ status: 'error', message: mapped.message });
        return;
      }
      if (error instanceof AccountingServiceError) {
        res.status(error.statusCode).json({ status: 'error', message: error.message });
        return;
      }
      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };
};
