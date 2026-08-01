export const SummaryItem = ({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) => {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd
        className={`mt-1 text-sm font-medium text-slate-900 ${capitalize ? 'capitalize' : ''}`}
      >
        {value}
      </dd>
    </div>
  );
}
