import { FormEvent, useRef, useState } from 'react';
import {
  HiCalendarDays,
  HiDocumentArrowUp,
  HiSignal,
  HiUser,
} from 'react-icons/hi2';
import { FormField } from '../../../components/ui/FormField';
import { FormModal } from '../../../components/ui/forms/FormModal';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import type { DocumentCategory, Employee } from '../../../types';
import { DOCUMENT_CATEGORY_LABELS, isAllowedDocumentFile, MAX_DOCUMENT_FILE_SIZE } from '../utils';

export interface UploadDocumentFormState {
  category: DocumentCategory;
  employeeId: string;
  expiryDate: string;
  file: File | null;
}

interface UploadDocumentModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>, file: File) => void;
  form: UploadDocumentFormState;
  onFormChange: (updater: (prev: UploadDocumentFormState) => UploadDocumentFormState) => void;
  loading: boolean;
  submitDisabled: boolean;
  employees: Employee[];
  showEmployeeSelect: boolean;
}

const categoryOptions = (Object.keys(DOCUMENT_CATEGORY_LABELS) as DocumentCategory[]).map(
  (value) => ({
    value,
    label: DOCUMENT_CATEGORY_LABELS[value],
  })
);

export const UploadDocumentModal = ({
  open,
  onClose,
  onSubmit,
  form,
  onFormChange,
  loading,
  submitDisabled,
  employees,
  showEmployeeSelect,
}: UploadDocumentModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = (file: File | null) => {
    if (!file) {
      onFormChange((prev) => ({ ...prev, file: null }));
      setFileError(null);
      return;
    }

    if (!isAllowedDocumentFile(file)) {
      setFileError(
        `Choose a PDF, image, or Office file up to ${Math.round(MAX_DOCUMENT_FILE_SIZE / (1024 * 1024))} MB.`
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
      title="Upload document"
      description="Store a contract, ID, certification, or other HR file."
      submitLabel="Upload"
      loading={loading}
      submitDisabled={submitDisabled}
    >
      <FormField label="File" htmlFor="document-file">
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            id="document-file"
            type="file"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.webp,.gif,.doc,.docx,.xls,.xlsx"
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 transition hover:border-brand-400 hover:bg-brand-50/40"
          >
            <HiDocumentArrowUp className="h-5 w-5 shrink-0 text-brand-600" />
            <span className="min-w-0 truncate">
              {form.file ? form.file.name : 'Choose a file (PDF, image, or Office)'}
            </span>
          </button>
          {fileError && <p className="text-sm text-red-600">{fileError}</p>}
        </div>
      </FormField>

      <FormField label="Category" htmlFor="document-category">
        <Select
          id="document-category"
          value={form.category}
          onChange={(e) =>
            onFormChange((prev) => ({
              ...prev,
              category: e.target.value as DocumentCategory,
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

      {showEmployeeSelect && (
        <FormField label="Employee" htmlFor="document-employee">
          <Select
            id="document-employee"
            value={form.employeeId}
            onChange={(e) => onFormChange((prev) => ({ ...prev, employeeId: e.target.value }))}
            icon={<HiUser className="h-4 w-4 text-brand-600" />}
          >
            <option value="">Company-wide (no employee)</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName}
              </option>
            ))}
          </Select>
        </FormField>
      )}

      <FormField label="Expiry date (optional)" htmlFor="document-expiry">
        <Input
          id="document-expiry"
          type="date"
          value={form.expiryDate}
          onChange={(e) => onFormChange((prev) => ({ ...prev, expiryDate: e.target.value }))}
          icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
        />
      </FormField>
    </FormModal>
  );
};
