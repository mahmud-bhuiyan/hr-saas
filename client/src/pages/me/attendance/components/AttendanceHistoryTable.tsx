import { HiPencilSquare } from 'react-icons/hi2';
import { Button } from '../../../../components/ui/Button';
import { Table } from '../../../../components/ui/Table';
import type { AttendanceLog } from '../../../../types';
import { formatAttendanceDateTime, formatAttendanceDuration } from '../utils';

type AttendanceHistoryTableProps = {
  logs: AttendanceLog[];
  loading?: boolean;
  emptyMessage?: string;
  canCorrect?: boolean;
  onCorrect?: (log: AttendanceLog) => void;
};

export const AttendanceHistoryTable = ({
  logs,
  loading,
  emptyMessage = 'No attendance records yet.',
  canCorrect,
  onCorrect,
}: AttendanceHistoryTableProps) => {
  const columns = [
    {
      key: 'clockIn',
      header: 'Clock in',
      render: (row: AttendanceLog) => formatAttendanceDateTime(row.clockIn),
    },
    {
      key: 'clockOut',
      header: 'Clock out',
      render: (row: AttendanceLog) =>
        row.clockOut ? formatAttendanceDateTime(row.clockOut) : 'In progress',
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (row: AttendanceLog) => formatAttendanceDuration(row.durationMinutes),
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (row: AttendanceLog) => row.notes ?? '—',
    },
    ...(canCorrect
      ? [
          {
            key: 'actions',
            header: 'Actions',
            align: 'right' as const,
            render: (row: AttendanceLog) => (
              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  className="px-3 py-1.5 text-xs"
                  icon={<HiPencilSquare className="h-4 w-4 text-brand-600" />}
                  onClick={() => onCorrect?.(row)}
                >
                  Correct
                </Button>
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <Table<AttendanceLog>
      loading={loading}
      emptyMessage={emptyMessage}
      columns={columns}
      data={logs}
      getRowKey={(row) => row.id}
    />
  );
};
