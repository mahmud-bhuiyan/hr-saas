import { Table } from "../../../../components/ui/primitives/Table";
import type { AttendanceLog } from "../../../../types";
import { formatAttendanceDateTime } from "../utils";

type AttendanceTeamBoardProps = {
  logs: AttendanceLog[];
  loading?: boolean;
};

export const AttendanceTeamBoard = ({
  logs,
  loading,
}: AttendanceTeamBoardProps) => {
  return (
    <Table<AttendanceLog>
      loading={loading}
      emptyMessage="No one is clocked in right now."
      align="left"
      columns={[
        {
          key: "employee",
          header: "Employee",
          align: "left",
          render: (row) =>
            row.employee
              ? `${row.employee.firstName} ${row.employee.lastName}`
              : row.employeeId,
        },
        {
          key: "department",
          header: "Department",
          align: "left",
          render: (row) => row.employee?.department ?? "—",
        },
        {
          key: "jobTitle",
          header: "Job title",
          align: "left",
          render: (row) => row.employee?.jobTitle ?? "—",
        },
        {
          key: "clockIn",
          header: "Clocked in at",
          render: (row) => formatAttendanceDateTime(row.clockIn),
        },
      ]}
      data={logs}
      getRowKey={(row) => row.id}
    />
  );
};
