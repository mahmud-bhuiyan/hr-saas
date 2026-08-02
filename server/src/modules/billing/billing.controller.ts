import type { Response } from 'express';
import type { ServerEnv } from '../../config/env.js';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import {
  BillingServiceError,
  createCheckoutSession,
  createPortalSession,
  getBillingStatus,
  handleStripeWebhook,
} from './billing.service.js';
import { checkoutSessionSchema, portalSessionSchema } from './billing.validation.js';

export const billingStatusHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const status = await getBillingStatus(req.tenantId!);
    res.json({ status: 'ok', data: status });
  } catch (error) {
    if (error instanceof BillingServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }

    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const checkoutSessionHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsed = checkoutSessionSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        res.status(400).json({
          status: 'error',
          message: parsed.error.issues[0]?.message ?? 'Invalid request body',
        });
        return;
      }

      const session = await createCheckoutSession(req.tenantId!, env, parsed.data);
      res.json({ status: 'ok', data: session });
    } catch (error) {
      if (error instanceof BillingServiceError) {
        res.status(error.statusCode).json({ status: 'error', message: error.message });
        return;
      }

      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };
};

export const portalSessionHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsed = portalSessionSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        res.status(400).json({
          status: 'error',
          message: parsed.error.issues[0]?.message ?? 'Invalid request body',
        });
        return;
      }

      const session = await createPortalSession(req.tenantId!, env, parsed.data);
      res.json({ status: 'ok', data: session });
    } catch (error) {
      if (error instanceof BillingServiceError) {
        res.status(error.statusCode).json({ status: 'error', message: error.message });
        return;
      }

      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };
};

export const stripeWebhookHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const rawBody = req.body as Buffer;
      const signatureHeader = req.headers['stripe-signature'];
      const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
      await handleStripeWebhook(rawBody, signature, env);
      res.json({ received: true });
    } catch (error) {
      if (error instanceof BillingServiceError) {
        res.status(error.statusCode).json({ status: 'error', message: error.message });
        return;
      }

      res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
  };
};
