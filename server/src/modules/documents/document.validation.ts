import { z } from 'zod';

const documentCategorySchema = z.enum(['contract', 'id', 'certification', 'other']);

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

export const MAX_DOCUMENT_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const documentMetadataFields = {
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.enum(ALLOWED_DOCUMENT_MIME_TYPES),
  fileSize: z.number().int().min(1).max(MAX_DOCUMENT_FILE_SIZE),
  category: documentCategorySchema,
  employeeId: z.string().min(1).optional(),
  expiryDate: dateStringSchema.optional(),
};

export const presignDocumentSchema = z.object(documentMetadataFields);

export const createDocumentSchema = z
  .object({
    fileKey: z.string().trim().min(1).max(512),
    ...documentMetadataFields,
  })
  .refine(
    (data) => data.fileKey.includes('/'),
    { message: 'Invalid file key', path: ['fileKey'] }
  );

export const listDocumentsQuerySchema = z.object({
  employeeId: z.string().min(1).optional(),
  category: documentCategorySchema.optional(),
  expiringWithinDays: z.coerce.number().int().min(1).max(365).optional(),
});

export const expiringDocumentsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional().default(30),
});

export type PresignDocumentInput = z.infer<typeof presignDocumentSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type ListDocumentsQuery = z.infer<typeof listDocumentsQuerySchema>;
export type ExpiringDocumentsQuery = z.infer<typeof expiringDocumentsQuerySchema>;
