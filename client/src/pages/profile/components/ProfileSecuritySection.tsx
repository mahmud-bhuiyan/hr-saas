import { HiLockClosed } from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button';

interface ProfileSecuritySectionProps {
  onChangePassword: () => void;
}

export const ProfileSecuritySection = ({ onChangePassword }: ProfileSecuritySectionProps) => {
  return (
    <section className="card-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Security</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Update your password to keep your account secure.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          icon={<HiLockClosed className="h-4 w-4 text-amber-500" />}
          onClick={onChangePassword}
        >
          Change password
        </Button>
      </div>
    </section>
  );
}
