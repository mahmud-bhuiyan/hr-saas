import type { RegistrationRequest } from '../../../types';
import { adminDisplayName, formatDate } from '../utils';
import { CompanyStatusBadge } from './CompanyStatusBadge';

export const CompanyDetailsContent = ({ company }: { company: RegistrationRequest }) => {
  return (
    <dl className="divide-y divide-slate-100 dark:divide-slate-800">
      <div className="flex justify-between gap-4 py-2.5 text-sm">
        <dt className="text-slate-500 dark:text-slate-400">Company</dt>
        <dd className="text-right font-medium text-slate-900 dark:text-slate-100">{company.companyName}</dd>
      </div>
      <div className="flex justify-between gap-4 py-2.5 text-sm">
        <dt className="text-slate-500 dark:text-slate-400">Admin</dt>
        <dd className="text-right font-medium text-slate-900 dark:text-slate-100">
          {adminDisplayName(company.adminFirstName, company.adminLastName)}
        </dd>
      </div>
      <div className="flex justify-between gap-4 py-2.5 text-sm">
        <dt className="text-slate-500 dark:text-slate-400">Admin email</dt>
        <dd className="text-right font-medium text-slate-900 dark:text-slate-100">{company.adminEmail}</dd>
      </div>
      <div className="flex justify-between gap-4 py-2.5 text-sm">
        <dt className="text-slate-500 dark:text-slate-400">Approval status</dt>
        <dd className="text-right font-medium capitalize text-slate-900 dark:text-slate-100">{company.status}</dd>
      </div>
      <div className="flex justify-between gap-4 py-2.5 text-sm">
        <dt className="text-slate-500 dark:text-slate-400">Account status</dt>
        <dd className="text-right">
          <CompanyStatusBadge isActive={company.isActive} />
        </dd>
      </div>
      <div className="flex justify-between gap-4 py-2.5 text-sm">
        <dt className="text-slate-500 dark:text-slate-400">Submitted on</dt>
        <dd className="text-right text-slate-900 dark:text-slate-100">{formatDate(company.submittedAt)}</dd>
      </div>
      <div className="flex justify-between gap-4 py-2.5 text-sm">
        <dt className="text-slate-500 dark:text-slate-400">Created by</dt>
        <dd className="text-right text-slate-900 dark:text-slate-100">{company.createdByName ?? '—'}</dd>
      </div>
      <div className="flex justify-between gap-4 py-2.5 text-sm">
        <dt className="text-slate-500 dark:text-slate-400">Updated by</dt>
        <dd className="text-right text-slate-900 dark:text-slate-100">{company.updatedByName ?? '—'}</dd>
      </div>
      <div className="flex justify-between gap-4 py-2.5 text-sm">
        <dt className="text-slate-500 dark:text-slate-400">Updated at</dt>
        <dd className="text-right text-slate-900 dark:text-slate-100">
          {company.updatedAt ? formatDate(company.updatedAt) : '—'}
        </dd>
      </div>
      <div className="flex justify-between gap-4 py-2.5 text-sm">
        <dt className="text-slate-500 dark:text-slate-400">Company ID</dt>
        <dd className="text-right font-mono text-xs text-slate-600 dark:text-slate-400">{company.tenantId}</dd>
      </div>
      {company.rejectedReason && (
        <div className="flex justify-between gap-4 py-2.5 text-sm">
          <dt className="text-slate-500 dark:text-slate-400">Rejection reason</dt>
          <dd className="max-w-[60%] text-right text-slate-900 dark:text-slate-100">{company.rejectedReason}</dd>
        </div>
      )}
    </dl>
  );
}
