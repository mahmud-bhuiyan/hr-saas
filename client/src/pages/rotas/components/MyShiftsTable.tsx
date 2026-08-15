import { Table } from "../../../components/ui/primitives/Table";
import type { Shift } from "../../../types";
import { formatDayLabel, formatShiftTime } from "../utils";
import { ShiftStatusBadge } from "./ShiftStatusBadge";

interface MyShiftsTableProps {
  shifts: Shift[];
  loading: boolean;
}

export const MyShiftsTable = ({ shifts, loading }: MyShiftsTableProps) => (
  <Table<Shift>
    loading={loading}
    emptyMessage="No shifts assigned for this week."
    columns={[
      {
        key: "date",
        header: "Date",
        render: (shift) => formatDayLabel(shift.date),
      },
      {
        key: "time",
        header: "Time",
        render: (shift) => formatShiftTime(shift.startTime, shift.endTime),
      },
      {
        key: "location",
        header: "Location",
        render: (shift) => shift.location?.name ?? "—",
      },
      {
        key: "role",
        header: "Role",
        render: (shift) => shift.role ?? "—",
      },
      {
        key: "status",
        header: "Status",
        render: (shift) => <ShiftStatusBadge status={shift.status} />,
      },
    ]}
    data={shifts}
    getRowKey={(shift) => shift.id}
  />
);
