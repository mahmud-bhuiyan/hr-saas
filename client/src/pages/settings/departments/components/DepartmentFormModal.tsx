import { FormEvent } from 'react';
import { HiRectangleGroup } from 'react-icons/hi2';
import { FormField } from '../../../../components/ui/FormField';
import { FormModal } from '../../../../components/ui/FormModal';
import { Input } from '../../../../components/ui/Input';

interface DepartmentFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  title: string;
  description: string;
  submitLabel: string;
  name: string;
  onNameChange: (value: string) => void;
  loading: boolean;
  submitDisabled: boolean;
}

export const DepartmentFormModal = ({
  open,
  onClose,
  onSubmit,
  title,
  description,
  submitLabel,
  name,
  onNameChange,
  loading,
  submitDisabled,
}: DepartmentFormModalProps) => {
  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
      description={description}
      submitLabel={submitLabel}
      loading={loading}
      submitDisabled={submitDisabled}
    >
      <FormField label="Department name" htmlFor="department-name">
        <Input
          id="department-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
          icon={<HiRectangleGroup className="h-4 w-4 text-brand-600" />}
        />
      </FormField>
    </FormModal>
  );
};
