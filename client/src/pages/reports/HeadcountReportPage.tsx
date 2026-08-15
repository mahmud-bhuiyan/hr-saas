import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageContainer } from "../../components/ui/PageContainer";
import { PageHeader } from "../../components/layout/PageHeader";
import { Table } from "../../components/ui/primitives/Table";
import { useAuth } from "../../contexts/AuthContext";
import { fetchHeadcountReport } from "../../lib/api";
import { hasPermission } from "../../utils/permissions";
import { isQueryInitialLoad } from "../../utils/query";
import type { HeadcountDepartmentBreakdown } from "../../types";

export const HeadcountReportPage = () => {
  const { user } = useAuth();
  const canRead = user && hasPermission(user.role, "report:read");

  const reportQuery = useQuery({
    queryKey: ["reports", "headcount"],
    queryFn: () => fetchHeadcountReport(),
    enabled: Boolean(canRead),
  });

  if (!canRead) {
    return <Navigate to="/dashboard" replace />;
  }

  const report = reportQuery.data;
  const chartData =
    report?.byDepartment.map((entry) => ({
      department: entry.department,
      Active: entry.active,
      "On leave": entry.onLeave,
      Terminated: entry.terminated,
    })) ?? [];

  const columns = [
    {
      key: "department",
      header: "Department",
      align: "left" as const,
      render: (row: HeadcountDepartmentBreakdown) => row.department,
    },
    {
      key: "active",
      header: "Active",
      render: (row: HeadcountDepartmentBreakdown) => row.active,
    },
    {
      key: "onLeave",
      header: "On leave",
      render: (row: HeadcountDepartmentBreakdown) => row.onLeave,
    },
    {
      key: "terminated",
      header: "Terminated",
      render: (row: HeadcountDepartmentBreakdown) => row.terminated,
    },
    {
      key: "total",
      header: "Total",
      render: (row: HeadcountDepartmentBreakdown) =>
        row.active + row.onLeave + row.terminated,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        label="Reports"
        title="Headcount"
        description="Current employee counts by department and employment status."
      />

      {report && (
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Total
            </p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {report.total}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
            <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
              Active
            </p>
            <p className="text-2xl font-semibold text-emerald-800 dark:text-emerald-300">
              {report.byStatus.active}
            </p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/50 dark:bg-amber-950/30">
            <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-400">
              On leave
            </p>
            <p className="text-2xl font-semibold text-amber-800 dark:text-amber-300">
              {report.byStatus.on_leave}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Terminated
            </p>
            <p className="text-2xl font-semibold text-slate-700 dark:text-slate-300">
              {report.byStatus.terminated}
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-medium text-slate-900 dark:text-slate-100">
          Headcount by department
        </h2>
        {isQueryInitialLoad(reportQuery) ? (
          <div className="flex h-72 items-center justify-center text-sm text-slate-500">
            Loading chart…
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-72 items-center justify-center text-sm text-slate-500">
            No employee data to display.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 0, bottom: 48 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-slate-200 dark:stroke-slate-700"
              />
              <XAxis
                dataKey="department"
                angle={-30}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 12 }}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Active" stackId="a" fill="#10b981" />
              <Bar dataKey="On leave" stackId="a" fill="#f59e0b" />
              <Bar dataKey="Terminated" stackId="a" fill="#94a3b8" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <Table
        align="left"
        columns={columns}
        data={report?.byDepartment ?? []}
        getRowKey={(row) => row.department}
        loading={isQueryInitialLoad(reportQuery)}
        emptyMessage="No department data available."
      />
    </PageContainer>
  );
};
