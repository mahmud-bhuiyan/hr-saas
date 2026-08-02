import type { DocumentCategory } from '../../types';

export type DocumentsTab = 'all' | 'expiring';

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  contract: 'Contract',
  id: 'ID',
  certification: 'Certification',
  other: 'Other',
};

export const ALLOWED_DOCUMENT_EXTENSIONS = [
  '.pdf',
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.doc',
  '.docx',
  '.xls',
  '.xlsx',
];

export const MAX_DOCUMENT_FILE_SIZE = 10 * 1024 * 1024;

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const formatDocumentDate = (value: string): string => {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const inferMimeType = (file: File): string | null => {
  if (file.type) return file.type;

  const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0];
  const map: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };

  return ext ? (map[ext] ?? null) : null;
};

export const isAllowedDocumentFile = (file: File): boolean => {
  const mimeType = inferMimeType(file);
  const allowed = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  return Boolean(mimeType && allowed.includes(mimeType) && file.size <= MAX_DOCUMENT_FILE_SIZE);
};
