export const CompanyStatusBadge = ({ isActive }: { isActive: boolean }) => {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
        isActive
          ? 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/15 dark:text-green-300 dark:ring-green-500/30'
          : 'bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-500/30'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}
