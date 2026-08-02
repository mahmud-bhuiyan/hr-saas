import { HiArrowDownTray, HiBolt } from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button';
import { Table } from '../../../components/ui/Table';
import type { PayrollPeriod } from '../../../types';
import { formatPeriodRange, payrollStatusClass, payrollStatusLabel } from '../utils';

interface PayrollPeriodsTableProps {
  periods: PayrollPeriod[];
  loading: boolean;
  selectedPeriodId: string | null;
  actionLoadingId: string | null;
  canGenerate: boolean;
  canExport: boolean;
  onSelect: (period: PayrollPeriod) => void;
  onGenerate: (period: PayrollPeriod) => void;
  onExport: (period: PayrollPeriod) => void;
}

export const PayrollPeriodsTable = ({
  periods,
  loading,
  selectedPeriodId,
  actionLoadingId,
  canGenerate,
  canExport,
  onSelect,
  onGenerate,
  onExport,
}: PayrollPeriodsTableProps) => {
  return (
    <Table
      align="left"
      data={periods}
      getRowKey={(period) => period.id}
      loading={loading}
      emptyMessage="No payroll periods yet. Create one to get started."
      columns={[
        {
          key: 'period',
          header: 'Period',
          render: (period) => (
            <button
              type="button"
              onClick={() => onSelect(period)}
              className={`font-medium ${
                selectedPeriodId === period.id
                  ? 'text-brand-700 dark:text-brand-400'
                  : 'text-slate-900 hover:text-brand-700 dark:text-slate-100 dark:hover:text-brand-400'
              }`}
            >
              {formatPeriodRange(period.periodStart, period.periodEnd)}
            </button>
          ),
        },
        {
          key: 'status',
          header: 'Status',
          render: (period) => (
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${payrollStatusClass(period.status)}`}
            >
              {payrollStatusLabel(period.status)}
            </span>
          ),
        },
        {
          key: 'employees',
          header: 'Employees',
          align: 'center',
          render: (period) => period.employeeSummaries.length,
        },
        {
          key: 'actions',
          header: 'Actions',
          align: 'right',
          render: (period) => (
            <div className="flex justify-end gap-2">
              {canGenerate && period.status !== 'exported' && (
                <Button
                  type="button"
                  variant="secondary"
                  className="px-3 py-1.5"
                  icon={<HiBolt className="h-4 w-4 text-amber-500" />}
                  loading={actionLoadingId === `${period.id}-generate`}
                  loadingText="Generating…"
                  onClick={() => onGenerate(period)}
                >
                  {period.status === 'draft' ? 'Generate' : 'Regenerate'}
                </Button>
              )}
              {canExport && period.status !== 'draft' && (
                <Button
                  type="button"
                  variant="secondary"
                  className="px-3 py-1.5"
                  icon={<HiArrowDownTray className="h-4 w-4 text-brand-600" />}
                  loading={actionLoadingId === `${period.id}-export`}
                  loadingText="Exporting…"
                  onClick={() => onExport(period)}
                >
                  CSV
                </Button>
              )}
            </div>
          ),
        },
      ]}
    />
  );
};
