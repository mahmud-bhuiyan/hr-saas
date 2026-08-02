import type { UserProfile } from '../../../types';
import { roleLabel } from '../../../utils/user';

const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleString();
}

const SummaryItem = ({ label, value }: { label: string; value: string }) => {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-medium capitalize text-slate-900 dark:text-slate-100">{value}</dd>
    </div>
  );
}

export const ProfileSummary = ({ profile }: { profile: UserProfile }) => {
  return (
    <dl className="card-surface grid gap-4 p-6 sm:grid-cols-2">
      <SummaryItem label="Role" value={roleLabel(profile.role)} />
      <SummaryItem label="Status" value={profile.isActive ? 'Active' : 'Inactive'} />
      {profile.companyName && <SummaryItem label="Company" value={profile.companyName} />}
      {profile.role === 'super_admin' && (
        <SummaryItem label="Scope" value="Platform (super admin)" />
      )}
      <SummaryItem label="Member since" value={formatDate(profile.createdAt)} />
      <SummaryItem label="Last updated" value={formatDate(profile.updatedAt)} />
    </dl>
  );
}
