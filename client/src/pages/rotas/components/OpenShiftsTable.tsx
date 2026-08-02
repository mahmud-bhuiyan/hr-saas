import { HiHandRaised } from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button';
import { Table } from '../../../components/ui/Table';
import type { Shift } from '../../../types';
import { formatDayLabel, formatShiftTime } from '../utils';
import { ShiftStatusBadge } from './ShiftStatusBadge';

interface OpenShiftsTableProps {
  shifts: Shift[];
  loading: boolean;
  claimLoadingId: string | null;
  onClaim: (shift: Shift) => void;
}

export const OpenShiftsTable = ({
  shifts,
  loading,
  claimLoadingId,
  onClaim,
}: OpenShiftsTableProps) => (
  <Table<Shift>
    loading={loading}
    emptyMessage="No open shifts available for this week."
    columns={[
      {
        key: 'date',
        header: 'Date',
        render: (shift) => formatDayLabel(shift.date),
      },
      {
        key: 'time',
        header: 'Time',
        render: (shift) => formatShiftTime(shift.startTime, shift.endTime),
      },
      {
        key: 'location',
        header: 'Location',
        render: (shift) => shift.location?.name ?? '—',
      },
      {
        key: 'role',
        header: 'Role',
        render: (shift) => shift.role ?? '—',
      },
      {
        key: 'status',
        header: 'Status',
        render: () => <ShiftStatusBadge status="open" />,
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (shift) => (
          <Button
            type="button"
            variant="secondary"
            className="text-xs"
            icon={<HiHandRaised className="h-4 w-4 text-brand-600" />}
            loading={claimLoadingId === shift.id}
            loadingText="Claiming"
            onClick={() => onClaim(shift)}
          >
            Claim
          </Button>
        ),
      },
    ]}
    data={shifts}
    getRowKey={(shift) => shift.id}
  />
);
