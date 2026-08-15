import { FormEvent } from 'react';
import { HiSignal, HiUser } from 'react-icons/hi2';
import { FormField } from '../../../../components/ui/FormField';
import { FormModal } from '../../../../components/ui/forms/FormModal';
import { Select } from '../../../../components/ui/Select';
import type { TenantUser, UserRole } from '../../../../types';
import { assignableRoles, roleLabel, userDisplayName } from '../../utils';

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
  user: TenantUser | null;
  role: Exclude<UserRole, 'super_admin'>;
  isActive: boolean;
  onRoleChange: (role: Exclude<UserRole, 'super_admin'>) => void;
  onActiveChange: (isActive: boolean) => void;
  loading: boolean;
  submitDisabled: boolean;
}

export const EditUserModal = ({
  open,
  onClose,
  onSubmit,
  user,
  role,
  isActive,
  onRoleChange,
  onActiveChange,
  loading,
  submitDisabled,
}: EditUserModalProps) => {
  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Edit user"
      description={
        user
          ? `Update role and status for ${userDisplayName(user)} (${user.email}).`
          : undefined
      }
      submitLabel="Save changes"
      loading={loading}
      submitDisabled={submitDisabled}
    >
      <FormField label="Role" htmlFor="user-role">
        <Select
          id="user-role"
          value={role}
          onChange={(e) => onRoleChange(e.target.value as Exclude<UserRole, 'super_admin'>)}
          icon={<HiUser className="h-4 w-4 text-brand-600" />}
        >
          {assignableRoles.map((option) => (
            <option key={option} value={option}>
              {roleLabel(option)}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Status" htmlFor="user-status">
        <Select
          id="user-status"
          value={isActive ? 'active' : 'inactive'}
          onChange={(e) => onActiveChange(e.target.value === 'active')}
          icon={<HiSignal className="h-4 w-4 text-brand-600" />}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
      </FormField>
    </FormModal>
  );
};
