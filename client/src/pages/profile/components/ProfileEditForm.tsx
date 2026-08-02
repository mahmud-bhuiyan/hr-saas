import { FormEvent } from 'react';
import { HiEnvelope, HiUser } from 'react-icons/hi2';
import { FormActions } from '../../../components/ui/FormActions';
import { FormField } from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';

interface ProfileEditFormProps {
  firstName: string;
  lastName: string;
  email: string;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  loading: boolean;
  hasChanges: boolean;
}

export const ProfileEditForm = ({
  firstName,
  lastName,
  email,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onSubmit,
  loading,
  hasChanges,
}: ProfileEditFormProps) => {
  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="card-surface space-y-6 p-6"
    >
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Edit profile</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First name" htmlFor="firstName">
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            placeholder="Jane"
            icon={<HiUser className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
        <FormField label="Last name" htmlFor="lastName">
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            placeholder="Admin"
            icon={<HiUser className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
      </div>

      <FormField label="Email" htmlFor="email">
        <Input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          icon={<HiEnvelope className="h-4 w-4 text-brand-600" />}
        />
      </FormField>

      <FormActions
        submitLabel="Save changes"
        loading={loading}
        loadingText="Saving…"
        submitDisabled={!hasChanges}
      />
    </form>
  );
}
