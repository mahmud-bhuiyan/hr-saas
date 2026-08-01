import { FormEvent } from 'react';
import {
  HiBuildingOffice2,
  HiChatBubbleLeftEllipsis,
  HiEnvelope,
  HiLockClosed,
  HiUser,
} from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { FormModal } from '../../../components/ui/FormModal';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { PasswordInput } from '../../../components/ui/PasswordInput';
import { Textarea } from '../../../components/ui/Textarea';
import type { CreateCompanyInput, RegistrationRequest } from '../../../types';
import type { EditCompanyForm } from '../utils';
import { CompanyDetailsContent } from './CompanyDetailsContent';

interface CreateCompanyModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  form: CreateCompanyInput;
  onFormChange: (updater: (prev: CreateCompanyInput) => CreateCompanyInput) => void;
  loading: boolean;
  submitDisabled: boolean;
}

export const CreateCompanyModal = ({
  open,
  onClose,
  onSubmit,
  form,
  onFormChange,
  loading,
  submitDisabled,
}: CreateCompanyModalProps) => {
  return (
    <FormModal
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Add company"
      description="Create an approved company and company admin account. They can sign in immediately."
      submitLabel="Create company"
      loading={loading}
      submitDisabled={submitDisabled}
      size="lg"
    >
      <FormField label="Company name" htmlFor="create-companyName">
        <Input
          id="create-companyName"
          value={form.companyName}
          onChange={(e) => onFormChange((f) => ({ ...f, companyName: e.target.value }))}
          placeholder="Acme Ltd"
          required
          icon={<HiBuildingOffice2 className="h-4 w-4 text-brand-600" />}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Admin first name" htmlFor="create-firstName">
          <Input
            id="create-firstName"
            value={form.firstName ?? ''}
            onChange={(e) => onFormChange((f) => ({ ...f, firstName: e.target.value }))}
            placeholder="Jane"
            icon={<HiUser className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
        <FormField label="Admin last name" htmlFor="create-lastName">
          <Input
            id="create-lastName"
            value={form.lastName ?? ''}
            onChange={(e) => onFormChange((f) => ({ ...f, lastName: e.target.value }))}
            placeholder="Admin"
            icon={<HiUser className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
      </div>

      <FormField label="Admin email" htmlFor="create-email">
        <Input
          id="create-email"
          type="email"
          value={form.email}
          onChange={(e) => onFormChange((f) => ({ ...f, email: e.target.value }))}
          placeholder="admin@acme.com"
          required
          icon={<HiEnvelope className="h-4 w-4 text-brand-600" />}
        />
      </FormField>

      <FormField label="Initial password" htmlFor="create-password">
        <PasswordInput
          id="create-password"
          value={form.password}
          onChange={(e) => onFormChange((f) => ({ ...f, password: e.target.value }))}
          placeholder="Min. 8 characters"
          required
          minLength={8}
          icon={<HiLockClosed className="h-4 w-4 text-brand-600" />}
        />
      </FormField>
    </FormModal>
  );
}

interface ApproveRegistrationModalProps {
  target: RegistrationRequest | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export const ApproveRegistrationModal = ({
  target,
  onClose,
  onConfirm,
  loading,
}: ApproveRegistrationModalProps) => {
  return (
    <Modal
      open={Boolean(target)}
      onClose={onClose}
      title="Approve registration"
      description={
        target
          ? `Approve ${target.companyName}? The company admin will be able to sign in immediately.`
          : undefined
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button loading={loading} loadingText="Approving…" onClick={onConfirm}>
            Confirm approve
          </Button>
        </div>
      }
      size="sm"
    >
      <></>
    </Modal>
  );
}

interface RejectRegistrationModalProps {
  target: RegistrationRequest | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  reason: string;
  onReasonChange: (value: string) => void;
  loading: boolean;
}

export const RejectRegistrationModal = ({
  target,
  onClose,
  onSubmit,
  reason,
  onReasonChange,
  loading,
}: RejectRegistrationModalProps) => {
  return (
    <FormModal
      open={Boolean(target)}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Reject registration"
      description={
        target
          ? `Reject ${target.companyName}? The company admin will see your reason on login.`
          : undefined
      }
      submitLabel="Confirm reject"
      submitVariant="danger"
      loading={loading}
      size="sm"
    >
      <FormField label="Rejection reason (optional)" htmlFor="reject-reason">
        <Textarea
          id="reject-reason"
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          rows={3}
          placeholder="Reason shown to the company admin on login"
          icon={<HiChatBubbleLeftEllipsis className="h-4 w-4 text-brand-600" />}
        />
      </FormField>
    </FormModal>
  );
}

interface CompanyDetailsModalProps {
  target: RegistrationRequest | null;
  onClose: () => void;
}

export const CompanyDetailsModal = ({ target, onClose }: CompanyDetailsModalProps) => {
  return (
    <Modal
      open={Boolean(target)}
      onClose={onClose}
      title="Company details"
      description={target?.companyName}
      footer={
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
      size="md"
    >
      {target && <CompanyDetailsContent company={target} />}
    </Modal>
  );
}

interface EditCompanyModalProps {
  target: RegistrationRequest | null;
  form: EditCompanyForm | null;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFormChange: (updater: (prev: EditCompanyForm) => EditCompanyForm) => void;
  loading: boolean;
  submitDisabled: boolean;
}

export const EditCompanyModal = ({
  target,
  form,
  onClose,
  onSubmit,
  onFormChange,
  loading,
  submitDisabled,
}: EditCompanyModalProps) => {
  return (
    <FormModal
      open={Boolean(target && form)}
      onClose={onClose}
      onSubmit={onSubmit}
      title="Edit company"
      description={target ? `Update details for ${target.companyName}.` : undefined}
      submitLabel="Save changes"
      loading={loading}
      submitDisabled={submitDisabled}
      size="lg"
    >
      {form && (
        <>
          <FormField label="Company name" htmlFor="edit-companyName">
            <Input
              id="edit-companyName"
              value={form.companyName}
              onChange={(e) => onFormChange((f) => ({ ...f, companyName: e.target.value }))}
              required
              icon={<HiBuildingOffice2 className="h-4 w-4 text-brand-600" />}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Admin first name" htmlFor="edit-firstName">
              <Input
                id="edit-firstName"
                value={form.adminFirstName}
                onChange={(e) => onFormChange((f) => ({ ...f, adminFirstName: e.target.value }))}
                icon={<HiUser className="h-4 w-4 text-brand-600" />}
              />
            </FormField>
            <FormField label="Admin last name" htmlFor="edit-lastName">
              <Input
                id="edit-lastName"
                value={form.adminLastName}
                onChange={(e) => onFormChange((f) => ({ ...f, adminLastName: e.target.value }))}
                icon={<HiUser className="h-4 w-4 text-brand-600" />}
              />
            </FormField>
          </div>

          <FormField label="Admin email" htmlFor="edit-email">
            <Input
              id="edit-email"
              type="email"
              value={form.adminEmail}
              onChange={(e) => onFormChange((f) => ({ ...f, adminEmail: e.target.value }))}
              required
              icon={<HiEnvelope className="h-4 w-4 text-brand-600" />}
            />
          </FormField>
        </>
      )}
    </FormModal>
  );
}

interface DeactivateCompanyModalProps {
  target: RegistrationRequest | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export const DeactivateCompanyModal = ({
  target,
  onClose,
  onConfirm,
  loading,
}: DeactivateCompanyModalProps) => {
  return (
    <Modal
      open={Boolean(target)}
      onClose={onClose}
      title="Deactivate company"
      description={
        target
          ? `Deactivate ${target.companyName}? All company users will lose access immediately.`
          : undefined
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={loading}
            loadingText="Deactivating…"
            onClick={onConfirm}
          >
            Confirm deactivate
          </Button>
        </div>
      }
      size="sm"
    >
      <></>
    </Modal>
  );
}

interface ActivateCompanyModalProps {
  target: RegistrationRequest | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

export const ActivateCompanyModal = ({
  target,
  onClose,
  onConfirm,
  loading,
}: ActivateCompanyModalProps) => {
  return (
    <Modal
      open={Boolean(target)}
      onClose={onClose}
      title="Activate company"
      description={
        target
          ? `Reactivate ${target.companyName}? Company users will be able to sign in again.`
          : undefined
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button loading={loading} loadingText="Activating…" onClick={onConfirm}>
            Confirm activate
          </Button>
        </div>
      }
      size="sm"
    >
      <></>
    </Modal>
  );
}
