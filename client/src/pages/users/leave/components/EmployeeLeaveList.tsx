import { LeaveRequestsTable } from "./LeaveRequestsTable";
import type { LeaveRequest } from "../../../../types";

interface EmployeeLeaveListProps {
  requests: LeaveRequest[];
  loading: boolean;
  title: string;
  description: string;
  emptyMessage?: string;
}

export const EmployeeLeaveList = ({
  requests,
  loading,
  title,
  description,
  emptyMessage = "No employee leave requests yet.",
}: EmployeeLeaveListProps) => (
  <div className="space-y-3">
    <div>
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
    <LeaveRequestsTable
      requests={requests}
      loading={loading}
      showEmployee
      showOverlaps
      emptyMessage={emptyMessage}
    />
  </div>
);
