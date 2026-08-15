import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { HiCalendarDays } from "react-icons/hi2";
import { Navigate } from "react-router-dom";
import { homePathForRole } from "../../../utils/routes";
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
import { FormField } from "../../../components/ui/FormField";
import { Input } from "../../../components/ui/Input";
import { PageContainer } from "../../../components/ui/PageContainer";
import { PageHeader } from "../../../components/layout/PageHeader";
import { Table } from "../../../components/ui/primitives/Table";
import { useAuth } from "../../../contexts/AuthContext";
import { fetchAbsenceSummaryReport } from "../../../lib/api";
import { hasPermission } from "../../../utils/permissions";
import { isQueryInitialLoad } from "../../../utils/query";
import type { AbsenceDepartmentBreakdown } from "../../../types";

const currentYear = new Date().getFullYear();

const defaultFrom = `${currentYear}-01-01`;
const defaultTo = new Date().toISOString().slice(0, 10);

export const AbsenceReportPage = () => {
  const { user } = useAuth();
  const canRead = user && hasPermission(user.role, "report:read");
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const reportQuery = useQuery({
    queryKey: ["reports", "absence", from, to],
    queryFn: () => fetchAbsenceSummaryReport({ from, to }),
    enabled: Boolean(canRead && from && to),
  });

  const chartData = useMemo(
    () =>
      (reportQuery.data?.byDepartment ?? []).map((entry) => ({
        department: entry.department,
        days: entry.totalDays,
      })),
    [reportQuery.data?.byDepartment],
  );

  if (!canRead) {
    return <Navigate to={homePathForRole(user?.role)} replace />;
  }

  const columns = [
    {
      key: "department",
      header: "Department",
      align: "left" as const,
      render: (row: AbsenceDepartmentBreakdown) => row.department,
    },
    {
      key: "totalDays",
      header: "Total days",
      render: (row: AbsenceDepartmentBreakdown) => row.totalDays,
    },
    {
      key: "byType",
      header: "By type",
      align: "left" as const,
      render: (row: AbsenceDepartmentBreakdown) =>
        row.byType.map((item) => `${item.type}: ${item.days}`).join(", ") ||
        "—",
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        label="Reports"
        title="Absence summary"
        description="Approved leave days taken within a selected date range."
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <FormField label="From">
          <Input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
        <FormField label="To">
          <Input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
          />
        </FormField>
      </div>

      {reportQuery.data && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Total absence days
            </p>
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {reportQuery.data.totalDays}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Leave types
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {reportQuery.data.byType.length > 0
                ? reportQuery.data.byType
                    .map((item) => `${item.type}: ${item.days}`)
                    .join(" · ")
                : "No approved leave in range"}
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-4 text-sm font-medium text-slate-900 dark:text-slate-100">
          Absence days by department
        </h2>
        {isQueryInitialLoad(reportQuery) ? (
          <div className="flex h-72 items-center justify-center text-sm text-slate-500">
            Loading chart…
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-72 items-center justify-center text-sm text-slate-500">
            No approved leave in this date range.
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
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="days" name="Leave days" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <Table
        align="left"
        columns={columns}
        data={reportQuery.data?.byDepartment ?? []}
        getRowKey={(row) => row.department}
        loading={isQueryInitialLoad(reportQuery)}
        emptyMessage="No absence data for this period."
      />
    </PageContainer>
  );
};
