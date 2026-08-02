import { Spinner } from '../../../components/ui/Spinner';
import type { DashboardCard } from '../utils';

type DashboardSummaryCardsProps = {
  cards: DashboardCard[];
  loading?: boolean;
};

export const DashboardSummaryCards = ({ cards, loading }: DashboardSummaryCardsProps) => {
  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
            {loading ? (
              <span className="inline-flex items-center text-slate-400">
                <Spinner className="h-7 w-7" />
              </span>
            ) : (
              card.value
            )}
          </p>
          {card.note ? <p className="mt-1 text-xs text-slate-400">{card.note}</p> : null}
        </div>
      ))}
    </section>
  );
};
