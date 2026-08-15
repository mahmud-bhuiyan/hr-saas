import { Table } from "../../../../components/ui/primitives/Table";
import type { EmployeePayrollSummary } from "../../../../types";
import { formatHours, formatMoney } from "../utils";

interface PayrollPreviewTableProps {
  summaries: EmployeePayrollSummary[];
  loading?: boolean;
}

export const PayrollPreviewTable = ({
  summaries,
  loading,
}: PayrollPreviewTableProps) => {
  const totalGross = summaries.reduce((sum, row) => sum + row.grossEstimate, 0);
  const missingPayRateCount = summaries.filter(
    (row) => row.missingPayRate,
  ).length;

  return (
    <div className="space-y-4">
      {missingPayRateCount > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          {missingPayRateCount} employee{missingPayRateCount === 1 ? "" : "s"}{" "}
          {missingPayRateCount === 1 ? "has" : "have"} no pay rate configured.
          Gross estimates show as zero until pay rates are set on employee
          profiles.
        </div>
      )}

      <Table
        align="left"
        data={summaries}
        getRowKey={(row) => row.employeeId}
        loading={loading}
        emptyMessage="Generate this period to preview employee payroll summaries."
        columns={[
          {
            key: "employee",
            header: "Employee",
            render: (row) => (
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {row.employeeName}
                </p>
                {row.missingPayRate && (
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Missing pay rate
                  </p>
                )}
              </div>
            ),
          },
          {
            key: "regularHours",
            header: "Regular hrs",
            align: "center",
            render: (row) => formatHours(row.regularHours),
          },
          {
            key: "overtimeHours",
            header: "Overtime hrs",
            align: "center",
            render: (row) => formatHours(row.overtimeHours),
          },
          {
            key: "expenseTotal",
            header: "Expenses",
            align: "center",
            render: (row) => formatMoney(row.expenseTotal, row.payCurrency),
          },
          {
            key: "grossEstimate",
            header: "Gross estimate",
            align: "right",
            render: (row) => (
              <span className="font-medium">
                {formatMoney(row.grossEstimate, row.payCurrency)}
              </span>
            ),
          },
        ]}
      />

      {summaries.length > 0 && (
        <div className="flex justify-end text-sm text-slate-600 dark:text-slate-400">
          Total gross estimate:{" "}
          <span className="ml-2 font-semibold text-slate-900 dark:text-slate-100">
            {formatMoney(totalGross)}
          </span>
        </div>
      )}
    </div>
  );
};
