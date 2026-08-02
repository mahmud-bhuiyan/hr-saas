import type { Response } from 'express';
import type { ServerEnv } from '../../config/env.js';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import type { AuditContext } from '../audit/audit.service.js';
import {
  DocumentServiceError,
  createDocument,
  deleteDocument,
  getDocumentById,
  getDocumentDownloadUrl,
  listDocuments,
  listExpiringDocuments,
  presignDocumentUpload,
} from './document.service.js';
import { S3ServiceError } from './s3.service.js';
import {
  createDocumentSchema,
  expiringDocumentsQuerySchema,
  listDocumentsQuerySchema,
  presignDocumentSchema,
} from './document.validation.js';

const accessContext = (req: AuthenticatedRequest) => ({
  userId: req.user!.sub,
  userEmail: req.user!.email,
  role: req.user!.role,
});

const auditContext = (req: AuthenticatedRequest): AuditContext => ({
  ip: req.ip,
  userAgent: req.get('user-agent'),
});

const handleServiceError = (error: unknown, res: Response): void => {
  if (error instanceof DocumentServiceError || error instanceof S3ServiceError) {
    res.status(error.statusCode).json({ status: 'error', message: error.message });
    return;
  }
  res.status(500).json({ status: 'error', message: 'Internal server error' });
};

export const listDocumentsHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = listDocumentsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid query parameters',
      });
      return;
    }

    const documents = await listDocuments(req.tenantId!, parsed.data, accessContext(req));
    res.json({ status: 'ok', data: { documents } });
  } catch (error) {
    handleServiceError(error, res);
  }
};

export const listExpiringDocumentsHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const parsed = expiringDocumentsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        status: 'error',
        message: parsed.error.issues[0]?.message ?? 'Invalid query parameters',
      });
      return;
    }

    const documents = await listExpiringDocuments(req.tenantId!, parsed.data, accessContext(req));
    res.json({ status: 'ok', data: { documents } });
  } catch (error) {
    handleServiceError(error, res);
  }
};

export const getDocumentHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const document = await getDocumentById(req.tenantId!, req.params.id, accessContext(req));
    res.json({ status: 'ok', data: document });
  } catch (error) {
    handleServiceError(error, res);
  }
};

export const presignDocumentHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsed = presignDocumentSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          status: 'error',
          message: parsed.error.issues[0]?.message ?? 'Invalid request body',
        });
        return;
      }

      const result = await presignDocumentUpload(
        env,
        req.tenantId!,
        parsed.data,
        accessContext(req)
      );
      res.json({ status: 'ok', data: result });
    } catch (error) {
      handleServiceError(error, res);
    }
  };
};

export const createDocumentHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parsed = createDocumentSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          status: 'error',
          message: parsed.error.issues[0]?.message ?? 'Invalid request body',
        });
        return;
      }

      const document = await createDocument(
        env,
        req.tenantId!,
        parsed.data,
        accessContext(req),
        auditContext(req)
      );
      res.status(201).json({ status: 'ok', data: document });
    } catch (error) {
      handleServiceError(error, res);
    }
  };
};

export const downloadDocumentHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const result = await getDocumentDownloadUrl(
        env,
        req.tenantId!,
        req.params.id,
        accessContext(req)
      );
      res.json({ status: 'ok', data: result });
    } catch (error) {
      handleServiceError(error, res);
    }
  };
};

export const deleteDocumentHandler = (env: ServerEnv) => {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      await deleteDocument(
        env,
        req.tenantId!,
        req.params.id,
        accessContext(req),
        auditContext(req)
      );
      res.json({ status: 'ok', data: { deleted: true } });
    } catch (error) {
      handleServiceError(error, res);
    }
  };
};
