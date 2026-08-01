import type { FormEvent, ReactNode } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';

interface FormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  title: string;
  description?: string;
  children: ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  submitDisabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  submitVariant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  formId?: string;
}

export const FormModal = ({
  open,
  onClose,
  onSubmit,
  title,
  description,
  children,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  loading = false,
  submitDisabled = false,
  size = 'md',
  submitVariant = 'primary',
  formId = 'form-modal',
}: FormModalProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            form={formId}
            variant={submitVariant}
            loading={loading}
            loadingText={submitLabel}
            disabled={submitDisabled}
          >
            {submitLabel}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={onSubmit} className="space-y-4">
        {children}
      </form>
    </Modal>
  );
}
