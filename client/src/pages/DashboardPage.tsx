import { useAuth } from '../contexts/AuthContext';

function displayName(firstName?: string, lastName?: string, email?: string): string {
  if (firstName || lastName) {
    return [firstName, lastName].filter(Boolean).join(' ');
  }
  return email?.split('@')[0] ?? 'there';
}

const summaryCards = [
  { label: 'Total employees', value: '—', note: 'Step 4' },
  { label: 'Pending leave', value: '—', note: 'Step 5' },
  { label: 'Documents', value: '—', note: 'Step 6' },
  { label: 'Departments', value: '—', note: 'Step 7' },
];

const quickLinks = [
  { label: 'Add employee', note: 'Coming in Step 4' },
  { label: 'Review leave requests', note: 'Coming in Step 5' },
  { label: 'Upload document', note: 'Coming in Step 6' },
  { label: 'Company settings', note: 'Coming in Step 7' },
];

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <section>
        <p className="text-sm font-medium uppercase tracking-wide text-brand-600">Dashboard</p>
        <h1 className="mt-1 text-3xl font-semibold text-slate-900">
          Welcome back, {displayName(user?.firstName, user?.lastName, user?.email)}
        </h1>
        <p className="mt-2 text-slate-600">
          Your HR workspace is ready. Employee, leave, and document modules arrive in the next
          steps.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{card.value}</p>
            <p className="mt-1 text-xs text-slate-400">{card.note}</p>
          </div>
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Quick links</h2>
        <ul className="mt-4 divide-y divide-slate-100">
          {quickLinks.map((link) => (
            <li key={link.label} className="flex items-center justify-between py-3">
              <span className="text-sm font-medium text-slate-700">{link.label}</span>
              <span className="text-xs text-slate-400">{link.note}</span>
            </li>
          ))}
        </ul>
      </section>

      {user && (
        <section className="rounded-xl border border-dashed border-slate-300 bg-slate-100/50 p-4 text-sm text-slate-600">
          Signed in as <strong>{user.email}</strong> ({user.role.replace(/_/g, ' ')})
          {user.tenantId && (
            <>
              {' '}
              · tenant <code className="rounded bg-white px-1">{user.tenantId.slice(0, 8)}…</code>
            </>
          )}
        </section>
      )}
    </div>
  );
}
