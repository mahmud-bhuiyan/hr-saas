export const CompanyStatusBadge = ({ isActive }: { isActive: boolean }) => {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${
        isActive
          ? 'bg-green-50 text-green-700 ring-green-600/20'
          : 'bg-slate-100 text-slate-600 ring-slate-500/20'
      }`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
}
