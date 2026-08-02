import type { ExpenseCategory, ExpenseStatus } from '../../types';
import { todayLocalDate } from '../../utils/date';

export type ExpensesTab = 'my-expenses' | 'approval-queue';

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  travel: 'Travel',
  meals: 'Meals',
  equipment: 'Equipment',
  other: 'Other',
};

export const EXPENSE_STATUS_LABELS: Record<ExpenseStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  declined: 'Declined',
  reimbursed: 'Reimbursed',
};

export const EXPENSE_STATUS_CLASSES: Record<ExpenseStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  approved: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  declined: 'bg-red-50 text-red-700 ring-red-600/20',
  reimbursed: 'bg-sky-50 text-sky-700 ring-sky-600/20',
};

export const CURRENCY_OPTIONS = ['GBP', 'EUR', 'USD'] as const;

export const MAX_RECEIPT_FILE_SIZE = 10 * 1024 * 1024;

export const ALLOWED_RECEIPT_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif'];

export const inferReceiptMimeType = (file: File): string | null => {
  if (file.type) {
    return file.type;
  }

  const lower = file.name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return null;
};

export const isAllowedReceiptFile = (file: File): boolean => {
  if (file.size > MAX_RECEIPT_FILE_SIZE) {
    return false;
  }

  const mimeType = inferReceiptMimeType(file);
  if (!mimeType) {
    return false;
  }

  return [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ].includes(mimeType);
};

export const formatExpenseAmount = (amount: number, currency: string): string =>
  new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

export const emptyExpenseForm = () => ({
  category: 'travel' as ExpenseCategory,
  amount: '',
  currency: 'GBP',
  date: todayLocalDate(),
  description: '',
  file: null as File | null,
});
