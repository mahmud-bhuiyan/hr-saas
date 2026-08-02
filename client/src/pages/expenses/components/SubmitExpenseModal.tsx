import { FormEvent, useRef, useState } from 'react';
import {
  HiBanknotes,
  HiCalendarDays,
  HiChatBubbleLeftEllipsis,
  HiDocumentArrowUp,
  HiSignal,
} from 'react-icons/hi2';
import { FormField } from '../../../components/ui/FormField';
import { FormModal } from '../../../components/ui/FormModal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { Textarea } from '../../../components/ui/Textarea';
import type { ExpenseCategory } from '../../../types';
import {
  CURRENCY_OPTIONS,
  EXPENSE_CATEGORY_LABELS,
  isAllowedReceiptFile,
  MAX_RECEIPT_FILE_SIZE,
} from '../utils';

export interface SubmitExpenseFormState {
  category: ExpenseCategory;
  amount: string;
  currency: string;
  date: string;
  description: string;
  file: File | null;
}

interface SubmitExpenseModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>, file: File) => void;
  form: SubmitExpenseFormState;
  onFormChange: (updater: (prev: SubmitExpenseFormState) => SubmitExpenseFormState) => void;
  loading: boolean;
  submitDisabled: boolean;
}

const categoryOptions = (Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map(
  (value) => ({
    value,
    label: EXPENSE_CATEGORY_LABELS[value],
  })
);

export const SubmitExpenseModal = ({
  open,
  onClose,
  onSubmit,
  form,
  onFormChange,
  loading,
  submitDisabled,
}: SubmitExpenseModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) {
      onFormChange((prev) => ({ ...prev, file: null }));
      setFileError(null);
      return;
    }

    if (!isAllowedReceiptFile(file)) {
      setFileError(
        `Choose a PDF or image up to ${Math.round(MAX_RECEIPT_FILE_SIZE / (1024 * 1024))} MB.`
      );
      onFormChange((prev) => ({ ...prev, file: null }));
      return;
    }

    setFileError(null);
    onFormChange((prev) => ({ ...prev, file }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.file) return;
    onSubmit(event, form.file);
  };

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Submit expense"
      description="Upload a receipt and enter the claim details."
      submitLabel="Submit expense"
      loading={loading}
      submitDisabled={submitDisabled}
    >
      <FormField label="Receipt" htmlFor="expense-receipt">
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            id="expense-receipt"
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.gif"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 transition hover:border-brand-400 hover:bg-brand-50/40"
          >
            <HiDocumentArrowUp className="h-5 w-5 shrink-0 text-brand-600" />
            <span className="min-w-0 truncate">
              {form.file ? form.file.name : 'Choose a receipt (PDF or image)'}
            </span>
          </button>
          {fileError && <p className="text-sm text-red-600">{fileError}</p>}
        </div>
      </FormField>

      <FormField label="Category" htmlFor="expense-category">
        <Select
          id="expense-category"
          value={form.category}
          onChange={(e) =>
            onFormChange((prev) => ({
              ...prev,
              category: e.target.value as ExpenseCategory,
            }))
          }
          icon={<HiSignal className="h-4 w-4 text-brand-600" />}
        >
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Amount" htmlFor="expense-amount">
          <Input
            id="expense-amount"
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={(e) => onFormChange((prev) => ({ ...prev, amount: e.target.value }))}
            icon={<HiBanknotes className="h-4 w-4 text-brand-600" />}
          />
        </FormField>

        <FormField label="Currency" htmlFor="expense-currency">
          <Select
            id="expense-currency"
            value={form.currency}
            onChange={(e) => onFormChange((prev) => ({ ...prev, currency: e.target.value }))}
            icon={<HiBanknotes className="h-4 w-4 text-brand-600" />}
          >
            {CURRENCY_OPTIONS.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="Expense date" htmlFor="expense-date">
        <Input
          id="expense-date"
          type="date"
          value={form.date}
          onChange={(e) => onFormChange((prev) => ({ ...prev, date: e.target.value }))}
          icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
        />
      </FormField>

      <FormField label="Description" htmlFor="expense-description">
        <Textarea
          id="expense-description"
          value={form.description}
          onChange={(e) => onFormChange((prev) => ({ ...prev, description: e.target.value }))}
          rows={3}
          icon={<HiChatBubbleLeftEllipsis className="h-4 w-4 text-brand-600" />}
        />
      </FormField>
    </FormModal>
  );
};
