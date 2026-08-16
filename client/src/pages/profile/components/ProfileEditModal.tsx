import type { FormEvent } from "react";
import { HiPhone, HiUser } from "react-icons/hi2";
import { UserAvatar } from "../../../components/UserAvatar";
import { FormField } from "../../../components/ui/FormField";
import { FormModal } from "../../../components/ui/forms/FormModal";
import { ImageUpload } from "../../../components/ui/ImageUpload";
import { Input } from "../../../components/ui/Input";
import { PhoneInput } from "../../../components/ui/PhoneInput";
import type { AuthUser } from "../../../types";

interface ProfileEditModalProps {
  open: boolean;
  onClose: () => void;
  user: AuthUser;
  firstName: string;
  lastName: string;
  phone?: string;
  showPhone?: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onPhoneChange?: (value: string) => void;
  onAvatarUpload: (file: File) => Promise<void>;
  onAvatarRemove: () => Promise<void>;
  avatarUploading: boolean;
  avatarRemoving: boolean;
  onSubmit: (event: FormEvent) => void;
  loading: boolean;
  hasChanges: boolean;
}

export const ProfileEditModal = ({
  open,
  onClose,
  user,
  firstName,
  lastName,
  phone = "",
  showPhone = false,
  onFirstNameChange,
  onLastNameChange,
  onPhoneChange,
  onAvatarUpload,
  onAvatarRemove,
  avatarUploading,
  avatarRemoving,
  onSubmit,
  loading,
  hasChanges,
}: ProfileEditModalProps) => {
  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Edit profile"
      description={
        showPhone
          ? "Update your name, phone, and profile photo."
          : "Update your name and profile photo."
      }
      submitLabel="Save changes"
      loading={loading}
      submitDisabled={!hasChanges}
      size="lg"
    >
      <ImageUpload
        label="Profile photo"
        imageUrl={user.avatarUrl}
        fallback={
          <UserAvatar
            user={user}
            className="h-full w-full"
            textClassName="text-xl"
          />
        }
        onUpload={onAvatarUpload}
        onRemove={onAvatarRemove}
        uploading={avatarUploading}
        removing={avatarRemoving}
        disabled={loading}
        previewClassName="h-20 w-20"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="First name" htmlFor="profile-firstName">
          <Input
            id="profile-firstName"
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            placeholder="Jane"
            icon={<HiUser className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
        <FormField label="Last name" htmlFor="profile-lastName">
          <Input
            id="profile-lastName"
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            placeholder="Admin"
            icon={<HiUser className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
      </div>

      {showPhone && onPhoneChange && (
        <FormField label="Phone" htmlFor="profile-phone" required>
          <PhoneInput
            id="profile-phone"
            value={phone}
            onChange={onPhoneChange}
            required
            icon={<HiPhone className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
      )}
    </FormModal>
  );
};
