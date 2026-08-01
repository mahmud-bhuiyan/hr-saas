import { useMutation } from '@tanstack/react-query';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { HiLockClosed } from 'react-icons/hi2';
import { useAuth } from '../contexts/AuthContext';
import { ApiError, updateProfile } from '../lib/api';
import { toast } from 'react-toastify';
import { areRequiredFieldsFilled } from '../utils/form';
import { FormField } from './ui/FormField';
import { FormModal } from './ui/FormModal';
import { PasswordInput } from './ui/PasswordInput';

interface ChangePasswordModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChangePasswordModal = ({ open, onClose, onSuccess }: ChangePasswordModalProps) => {
  const { setAuth, accessToken } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (!open) {
      setCurrentPassword('');
      setNewPassword('');
    }
  }, [open]);

  const formValues = useMemo(
    () => ({ currentPassword, newPassword }),
    [currentPassword, newPassword]
  );

  const canSubmit =
    areRequiredFieldsFilled(formValues, ['currentPassword', 'newPassword']) &&
    newPassword.length >= 8;

  const changePasswordMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      if (data.accessToken && accessToken) {
        setAuth(
          {
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
            tenantId: data.user.tenantId,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
          },
          data.accessToken
        );
      }
      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Failed to change password');
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!canSubmit) {
      return;
    }

    changePasswordMutation.mutate({ currentPassword, newPassword });
  }

  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={(e) => void handleSubmit(e)}
      title="Change password"
      description="Enter your current password and choose a new one."
      submitLabel="Update password"
      loading={changePasswordMutation.isPending}
      submitDisabled={!canSubmit}
      size="sm"
      formId="change-password-form"
    >
      <FormField label="Current password" htmlFor="change-password-current">
        <PasswordInput
          id="change-password-current"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          icon={<HiLockClosed className="h-4 w-4 text-brand-600" />}
        />
      </FormField>
      <FormField label="New password" htmlFor="change-password-new">
        <PasswordInput
          id="change-password-new"
          autoComplete="new-password"
          required
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="At least 8 characters"
          icon={<HiLockClosed className="h-4 w-4 text-brand-600" />}
        />
      </FormField>
    </FormModal>
  );
}
