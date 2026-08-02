import mongoose from 'mongoose';
import type { ServerEnv } from '../../config/env.js';
import type { UserRole } from '../../types/index.js';
import { hasPermission } from '../../utils/permissions.js';
import { Employee, type IEmployeeDocument } from '../employees/employee.model.js';
import { User } from '../admin/user.model.js';
import { resolveEmployeeForUser } from '../leave/leave.service.js';
import {
  HrDocument,
  type DocumentCategory,
  type IHrDocumentDocument,
} from './document.model.js';
import type {
  CreateDocumentInput,
  ExpiringDocumentsQuery,
  ListDocumentsQuery,
  PresignDocumentInput,
} from './document.validation.js';
import {
  buildDocumentFileKey,
  createPresignedDownloadUrl,
  createPresignedUploadUrl,
  deleteObject,
  verifyObjectExists,
} from './s3.service.js';

export class DocumentServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'DocumentServiceError';
  }
}

interface AccessContext {
  userId: string;
  userEmail: string;
  role: UserRole;
}

export interface DocumentEmployeeSummary {
  id: string;
  firstName: string;
  lastName: string;
}

export interface DocumentUploaderSummary {
  id: string;
  name: string;
  email: string;
}

export interface DocumentPublic {
  id: string;
  employeeId?: string;
  employee?: DocumentEmployeeSummary;
  category: DocumentCategory;
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: DocumentUploaderSummary;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PresignDocumentResult {
  uploadUrl: string;
  fileKey: string;
}

export interface DocumentDownloadResult {
  downloadUrl: string;
  fileName: string;
}

const canManageDocuments = (role: UserRole): boolean => hasPermission(role, 'document:manage');

const canReadOwnDocuments = (role: UserRole): boolean => hasPermission(role, 'document:read:own');

const formatDateString = (date: Date): string => date.toISOString().slice(0, 10);

const parseDateString = (value: string): Date => {
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw new DocumentServiceError('Invalid date', 400);
  }
  return date;
};

const toEmployeeSummary = (employee: IEmployeeDocument): DocumentEmployeeSummary => ({
  id: employee._id.toString(),
  firstName: employee.firstName,
  lastName: employee.lastName,
});

const toDocumentPublic = async (doc: IHrDocumentDocument): Promise<DocumentPublic> => {
  const uploader = await User.findById(doc.uploadedBy);
  if (!uploader) {
    throw new DocumentServiceError('Uploader not found for document', 500);
  }

  let employee: DocumentEmployeeSummary | undefined;
  if (doc.employeeId) {
    const employeeDoc = await Employee.findById(doc.employeeId);
    if (employeeDoc) {
      employee = toEmployeeSummary(employeeDoc);
    }
  }

  return {
    id: doc._id.toString(),
    employeeId: doc.employeeId?.toString(),
    employee,
    category: doc.category,
    fileName: doc.fileName,
    mimeType: doc.mimeType,
    fileSize: doc.fileSize,
    uploadedBy: {
      id: uploader._id.toString(),
      name:
        [uploader.firstName, uploader.lastName].filter(Boolean).join(' ') || uploader.email,
      email: uploader.email,
    },
    expiryDate: doc.expiryDate ? formatDateString(doc.expiryDate) : undefined,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
};

const assertEmployeeInTenant = async (
  tenantId: string,
  employeeId: string
): Promise<IEmployeeDocument> => {
  const employee = await Employee.findOne({
    _id: new mongoose.Types.ObjectId(employeeId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!employee) {
    throw new DocumentServiceError('Employee not found', 404);
  }

  return employee;
};

const assertCanAccessDocument = async (
  tenantId: string,
  doc: IHrDocumentDocument,
  context: AccessContext
): Promise<void> => {
  if (canManageDocuments(context.role)) {
    return;
  }

  if (!canReadOwnDocuments(context.role)) {
    throw new DocumentServiceError('Forbidden', 403);
  }

  if (!doc.employeeId) {
    throw new DocumentServiceError('Forbidden', 403);
  }

  const employee = await resolveEmployeeForUser(tenantId, context.userId, context.userEmail);

  if (doc.employeeId.toString() !== employee._id.toString()) {
    throw new DocumentServiceError('Forbidden', 403);
  }
};

const validateDocumentTarget = async (
  tenantId: string,
  context: AccessContext,
  employeeId?: string
): Promise<string | undefined> => {
  if (canManageDocuments(context.role)) {
    if (employeeId) {
      await assertEmployeeInTenant(tenantId, employeeId);
      return employeeId;
    }
    return undefined;
  }

  if (!canReadOwnDocuments(context.role)) {
    throw new DocumentServiceError('Forbidden', 403);
  }

  const employee = await resolveEmployeeForUser(tenantId, context.userId, context.userEmail);
  return employee._id.toString();
};

const assertFileKeyForTenant = (tenantId: string, fileKey: string): void => {
  const prefix = `${tenantId}/documents/`;
  if (!fileKey.startsWith(prefix)) {
    throw new DocumentServiceError('Invalid file key for tenant', 400);
  }
};

export const presignDocumentUpload = async (
  env: ServerEnv,
  tenantId: string,
  input: PresignDocumentInput,
  context: AccessContext
): Promise<PresignDocumentResult> => {
  await validateDocumentTarget(tenantId, context, input.employeeId);

  const fileKey = buildDocumentFileKey(tenantId, input.fileName);
  const uploadUrl = await createPresignedUploadUrl(env, fileKey, input.mimeType);

  return { uploadUrl, fileKey };
};

export const createDocument = async (
  env: ServerEnv,
  tenantId: string,
  input: CreateDocumentInput,
  context: AccessContext
): Promise<DocumentPublic> => {
  assertFileKeyForTenant(tenantId, input.fileKey);

  const resolvedEmployeeId = await validateDocumentTarget(tenantId, context, input.employeeId);

  const exists = await verifyObjectExists(env, input.fileKey);
  if (!exists) {
    throw new DocumentServiceError(
      'File not found in storage. Upload the file before saving the document.',
      400
    );
  }

  const doc = await HrDocument.create({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    employeeId: resolvedEmployeeId
      ? new mongoose.Types.ObjectId(resolvedEmployeeId)
      : null,
    category: input.category,
    fileKey: input.fileKey,
    fileName: input.fileName,
    mimeType: input.mimeType,
    fileSize: input.fileSize,
    uploadedBy: new mongoose.Types.ObjectId(context.userId),
    expiryDate: input.expiryDate ? parseDateString(input.expiryDate) : null,
  });

  return toDocumentPublic(doc);
};

export const listDocuments = async (
  tenantId: string,
  query: ListDocumentsQuery,
  context: AccessContext
): Promise<DocumentPublic[]> => {
  const filter: Record<string, unknown> = {
    tenantId: new mongoose.Types.ObjectId(tenantId),
  };

  if (canManageDocuments(context.role)) {
    if (query.employeeId) {
      filter.employeeId = new mongoose.Types.ObjectId(query.employeeId);
    }
  } else if (canReadOwnDocuments(context.role)) {
    const employee = await resolveEmployeeForUser(tenantId, context.userId, context.userEmail);
    filter.employeeId = employee._id;
  } else {
    throw new DocumentServiceError('Forbidden', 403);
  }

  if (query.category) {
    filter.category = query.category;
  }

  if (query.expiringWithinDays) {
    const now = new Date();
    const until = new Date(now);
    until.setUTCDate(until.getUTCDate() + query.expiringWithinDays);
    filter.expiryDate = { $gte: now, $lte: until };
  }

  const docs = await HrDocument.find(filter).sort({ createdAt: -1 });
  return Promise.all(docs.map((doc) => toDocumentPublic(doc)));
};

export const listExpiringDocuments = async (
  tenantId: string,
  query: ExpiringDocumentsQuery,
  context: AccessContext
): Promise<DocumentPublic[]> => {
  if (!canManageDocuments(context.role)) {
    throw new DocumentServiceError('Forbidden', 403);
  }

  return listDocuments(
    tenantId,
    { expiringWithinDays: query.days },
    context
  );
};

export const getDocumentById = async (
  tenantId: string,
  documentId: string,
  context: AccessContext
): Promise<DocumentPublic> => {
  const doc = await HrDocument.findOne({
    _id: new mongoose.Types.ObjectId(documentId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!doc) {
    throw new DocumentServiceError('Document not found', 404);
  }

  await assertCanAccessDocument(tenantId, doc, context);
  return toDocumentPublic(doc);
};

export const getDocumentDownloadUrl = async (
  env: ServerEnv,
  tenantId: string,
  documentId: string,
  context: AccessContext
): Promise<DocumentDownloadResult> => {
  const doc = await HrDocument.findOne({
    _id: new mongoose.Types.ObjectId(documentId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!doc) {
    throw new DocumentServiceError('Document not found', 404);
  }

  await assertCanAccessDocument(tenantId, doc, context);

  const downloadUrl = await createPresignedDownloadUrl(env, doc.fileKey, doc.fileName);

  return {
    downloadUrl,
    fileName: doc.fileName,
  };
};

export const deleteDocument = async (
  env: ServerEnv,
  tenantId: string,
  documentId: string,
  context: AccessContext
): Promise<void> => {
  if (!canManageDocuments(context.role)) {
    throw new DocumentServiceError('Forbidden', 403);
  }

  const doc = await HrDocument.findOne({
    _id: new mongoose.Types.ObjectId(documentId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!doc) {
    throw new DocumentServiceError('Document not found', 404);
  }

  await deleteObject(env, doc.fileKey);
  await doc.deleteOne();
};
