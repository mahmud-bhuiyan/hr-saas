import type { ReactNode } from 'react';
import { Button } from './Button';

interface FormActionsProps {
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  loadingText?: string;
  submitDisabled?: boolean;
  onCancel?: () => void;
  children?: ReactNode;
  className?: string;
}

export function FormActions({
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  loading = false,
  loadingText,
  submitDisabled = false,
  onCancel,
  children,
  className = '',
}: FormActionsProps) {
  return (
    <div className={`flex flex-wrap justify-end gap-2 ${className}`}>
      {children}
      {onCancel && (
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
      )}
      <Button
        type="submit"
        loading={loading}
        loadingText={loadingText ?? submitLabel}
        disabled={submitDisabled}
      >
        {submitLabel}
      </Button>
    </div>
  );
}
