import { HiArrowDownTray } from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button';
import { Table } from '../../../components/ui/Table';
import type { Expense } from '../../../types';
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_STATUS_CLASSES,
  EXPENSE_STATUS_LABELS,
  formatExpenseAmount,
} from '../utils';

interface MyExpensesTableProps {
  expenses: Expense[];
  loading: boolean;
  receiptLoadingId: string | null;
  onViewReceipt: (expense: Expense) => void;
}

export const MyExpensesTable = ({
  expenses,
  loading,
  receiptLoadingId,
  onViewReceipt,
}: MyExpensesTableProps) => (
  <Table
    loading={loading}
    emptyMessage="No expenses submitted yet."
    data={expenses}
    getRowKey={(row) => row.id}
    columns={[
      {
        key: 'date',
        header: 'Date',
        render: (row: Expense) =>
          new Date(`${row.date}T00:00:00`).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
      },
      {
        key: 'category',
        header: 'Category',
        render: (row: Expense) => EXPENSE_CATEGORY_LABELS[row.category],
      },
      {
        key: 'amount',
        header: 'Amount',
        render: (row: Expense) => formatExpenseAmount(row.amount, row.currency),
      },
      {
        key: 'description',
        header: 'Description',
        align: 'left',
        render: (row: Expense) => (
          <span className="line-clamp-2 max-w-xs text-left">{row.description}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        render: (row: Expense) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${EXPENSE_STATUS_CLASSES[row.status]}`}
          >
            {EXPENSE_STATUS_LABELS[row.status]}
          </span>
        ),
      },
      {
        key: 'receipt',
        header: 'Receipt',
        render: (row: Expense) => (
          <Button
            type="button"
            variant="secondary"
            className="px-3 py-1.5 text-xs"
            icon={<HiArrowDownTray className="h-4 w-4 text-brand-600" />}
            loading={receiptLoadingId === row.id}
            loadingText="Opening…"
            onClick={() => onViewReceipt(row)}
          >
            View
          </Button>
        ),
      },
    ]}
  />
);
