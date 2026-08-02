import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import {
  RotaServiceError,
  createShift,
  deleteShift,
  getRotaWeek,
  patchShift,
  publishRotaWeek,
} from './rota.service.js';
import {
  createShiftSchema,
  patchShiftSchema,
  publishRotaSchema,
} from './rota.validation.js';

const getAccessContext = (req: AuthenticatedRequest) => ({
  userId: req.user!.sub,
  userEmail: req.user!.email,
  role: req.user!.role,
});

export const getRotaWeekHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.tenantId) {
      res.status(403).json({ status: 'error', message: 'Tenant context required' });
      return;
    }

    const rota = await getRotaWeek(req.tenantId, req.params.weekOf, getAccessContext(req));
    res.json({ status: 'ok', data: rota });
  } catch (error) {
    if (error instanceof RotaServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const createShiftHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.tenantId) {
      res.status(403).json({ status: 'error', message: 'Tenant context required' });
      return;
    }

    const parsed = createShiftSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body',
      });
      return;
    }

    const shift = await createShift(
      req.tenantId,
      parsed.data,
      req.user.sub,
      getAccessContext(req),
      {
        ip: req.ip,
        userAgent: req.get('user-agent') ?? undefined,
      }
    );
    res.status(201).json({ status: 'ok', data: shift });
  } catch (error) {
    if (error instanceof RotaServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const patchShiftHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.tenantId) {
      res.status(403).json({ status: 'error', message: 'Tenant context required' });
      return;
    }

    const parsed = patchShiftSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body',
      });
      return;
    }

    const shift = await patchShift(
      req.tenantId,
      req.params.id,
      parsed.data,
      req.user.sub,
      getAccessContext(req),
      {
        ip: req.ip,
        userAgent: req.get('user-agent') ?? undefined,
      }
    );
    res.json({ status: 'ok', data: shift });
  } catch (error) {
    if (error instanceof RotaServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const deleteShiftHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.tenantId) {
      res.status(403).json({ status: 'error', message: 'Tenant context required' });
      return;
    }

    await deleteShift(
      req.tenantId,
      req.params.id,
      req.user.sub,
      getAccessContext(req),
      {
        ip: req.ip,
        userAgent: req.get('user-agent') ?? undefined,
      }
    );
    res.json({ status: 'ok', data: { deleted: true } });
  } catch (error) {
    if (error instanceof RotaServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const publishRotaHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || !req.tenantId) {
      res.status(403).json({ status: 'error', message: 'Tenant context required' });
      return;
    }

    const parsed = publishRotaSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid request body',
      });
      return;
    }

    const result = await publishRotaWeek(
      req.tenantId,
      parsed.data.weekOf,
      req.user.sub,
      getAccessContext(req),
      {
        ip: req.ip,
        userAgent: req.get('user-agent') ?? undefined,
      }
    );
    res.json({ status: 'ok', data: result });
  } catch (error) {
    if (error instanceof RotaServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
