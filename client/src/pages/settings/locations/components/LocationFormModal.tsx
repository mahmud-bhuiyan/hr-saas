import { FormEvent } from 'react';
import { HiBuildingOffice2, HiMapPin } from 'react-icons/hi2';
import { FormField } from '../../../../components/ui/FormField';
import { FormModal } from '../../../../components/ui/FormModal';
import { Input } from '../../../../components/ui/Input';

interface LocationFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  title: string;
  description: string;
  submitLabel: string;
  name: string;
  address: string;
  timezone: string;
  onNameChange: (value: string) => void;
  onAddressChange: (value: string) => void;
  onTimezoneChange: (value: string) => void;
  loading: boolean;
  submitDisabled: boolean;
}

export const LocationFormModal = ({
  open,
  onClose,
  onSubmit,
  title,
  description,
  submitLabel,
  name,
  address,
  timezone,
  onNameChange,
  onAddressChange,
  onTimezoneChange,
  loading,
  submitDisabled,
}: LocationFormModalProps) => {
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
      <FormField label="Location name" htmlFor="location-name">
        <Input
          id="location-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          required
          icon={<HiBuildingOffice2 className="h-4 w-4 text-brand-600" />}
        />
      </FormField>
      <FormField label="Address" htmlFor="location-address">
        <Input
          id="location-address"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          icon={<HiMapPin className="h-4 w-4 text-brand-600" />}
        />
      </FormField>
      <FormField label="Timezone (optional)" htmlFor="location-timezone">
        <Input
          id="location-timezone"
          value={timezone}
          onChange={(e) => onTimezoneChange(e.target.value)}
          placeholder="e.g. Europe/London"
          icon={<HiMapPin className="h-4 w-4 text-brand-600" />}
        />
      </FormField>
    </FormModal>
  );
};
