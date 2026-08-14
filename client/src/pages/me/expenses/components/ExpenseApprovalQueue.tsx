import { useState } from 'react';
import { HiArrowDownTray, HiCheck, HiXMark, HiChatBubbleLeftEllipsis } from 'react-icons/hi2';
import { Button } from '../../../../components/ui/Button';
import { FormField } from '../../../../components/ui/FormField';
import { Modal } from '../../../../components/ui/Modal';
import { Table } from '../../../../components/ui/Table';
import { Textarea } from '../../../../components/ui/Textarea';
import type { Expense } from '../../../../types';
import {
  EXPENSE_CATEGORY_LABELS,
  formatExpenseAmount,
} from '../utils';

interface ExpenseApprovalQueueProps {
  expenses: Expense[];
  loading: boolean;
  actionLoadingId: string | null;
  receiptLoadingId: string | null;
  onApprove: (expense: Expense) => void;
  onDecline: (expense: Expense, reason?: string) => void;
  onViewReceipt: (expense: Expense) => void;
}

export const ExpenseApprovalQueue = ({
  expenses,
  loading,
  actionLoadingId,
  receiptLoadingId,
  onApprove,
  onDecline,
  onViewReceipt,
}: ExpenseApprovalQueueProps) => {
  const [declineTarget, setDeclineTarget] = useState<Expense | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  const handleDeclineSubmit = () => {
    if (!declineTarget) {
      return;
    }
    onDecline(declineTarget, declineReason.trim() || undefined);
    setDeclineTarget(null);
    setDeclineReason('');
  };

  return (
    <>
      <Table
        loading={loading}
        emptyMessage="No pending expense claims."
        data={expenses}
        getRowKey={(row) => row.id}
        columns={[
          {
            key: 'employee',
            header: 'Employee',
            render: (row: Expense) =>
              row.employee
                ? `${row.employee.firstName} ${row.employee.lastName}`
                : '—',
          },
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
          {
            key: 'actions',
            header: 'Actions',
            align: 'right',
            render: (row: Expense) => (
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  className="px-3 py-1.5 text-xs"
                  icon={<HiCheck className="h-4 w-4 text-white" />}
                  loading={actionLoadingId === row.id}
                  loadingText="Approving…"
                  onClick={() => onApprove(row)}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="px-3 py-1.5 text-xs"
                  icon={<HiXMark className="h-4 w-4 text-red-500" />}
                  disabled={actionLoadingId === row.id}
                  onClick={() => {
                    setDeclineTarget(row);
                    setDeclineReason('');
                  }}
                >
                  Decline
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={Boolean(declineTarget)}
        onClose={() => setDeclineTarget(null)}
        title="Decline expense"
        description={
          declineTarget?.employee
            ? `Decline ${declineTarget.employee.firstName} ${declineTarget.employee.lastName}'s expense claim?`
            : undefined
        }
        footer={
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setDeclineTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="secondary"
              icon={<HiXMark className="h-4 w-4 text-red-500" />}
              loading={Boolean(declineTarget && actionLoadingId === declineTarget.id)}
              loadingText="Declining…"
              onClick={handleDeclineSubmit}
            >
              Decline expense
            </Button>
          </div>
        }
      >
        <FormField label="Reason (optional)" htmlFor="decline-expense-reason">
          <Textarea
            id="decline-expense-reason"
            value={declineReason}
            onChange={(event) => setDeclineReason(event.target.value)}
            rows={3}
            icon={<HiChatBubbleLeftEllipsis className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
      </Modal>
    </>
  );
};
