import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";
import { homePathForRole } from "../../../utils/routes";
import { HiPlus } from "react-icons/hi2";
import { toast } from "react-toastify";
import { Button } from "../../../components/ui/Button";
import { PageContainer } from "../../../components/ui/PageContainer";
import { PageHeader } from "../../../components/layout/PageHeader";
import { useAuth } from "../../../contexts/AuthContext";
import {
  ApiError,
  createPayrollPeriod,
  exportPayrollPeriodCsv,
  fetchAccountingConnectionStatus,
  fetchPayrollPeriod,
  fetchPayrollPeriods,
  fetchPayrollSettings,
  generatePayrollPeriod,
  syncPayrollPeriodToAccounting,
} from "../../../lib/api";
import type { PayrollPeriod } from "../../../types";
import { areRequiredFieldsFilled } from "../../../utils/form";
import { hasPermission } from "../../../utils/permissions";
import { isQueryInitialLoad } from "../../../utils/query";
import {
  CreatePayrollPeriodModal,
  type CreatePayrollPeriodForm,
} from "./components/CreatePayrollPeriodModal";
import { PayrollPeriodsTable } from "./components/PayrollPeriodsTable";
import { PayrollPreviewTable } from "./components/PayrollPreviewTable";
import { formatPeriodRange, suggestPayPeriod } from "./utils";

const PAYROLL_ROLES = ["company_admin", "hr_manager"] as const;

export const PayrollPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreatePayrollPeriodForm>({
    periodStart: "",
    periodEnd: "",
  });
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const canAccess =
    user && PAYROLL_ROLES.includes(user.role as (typeof PAYROLL_ROLES)[number]);
  const canGenerate = user && hasPermission(user.role, "payroll:generate");
  const canExport = user && hasPermission(user.role, "payroll:export");

  const settingsQuery = useQuery({
    queryKey: ["settings", "payroll"],
    queryFn: fetchPayrollSettings,
    enabled: Boolean(canAccess),
  });

  const periodsQuery = useQuery({
    queryKey: ["payroll", "periods"],
    queryFn: fetchPayrollPeriods,
    enabled: Boolean(canAccess),
  });

  const accountingQuery = useQuery({
    queryKey: ["payroll", "accounting", "status"],
    queryFn: fetchAccountingConnectionStatus,
    enabled: Boolean(canAccess && canExport),
  });

  const canSync = Boolean(canExport && accountingQuery.data?.connected);

  const selectedPeriodQuery = useQuery({
    queryKey: ["payroll", "periods", selectedPeriodId],
    queryFn: () => fetchPayrollPeriod(selectedPeriodId!),
    enabled: Boolean(canAccess && selectedPeriodId),
  });

  useEffect(() => {
    if (periodsQuery.data?.length && !selectedPeriodId) {
      setSelectedPeriodId(periodsQuery.data[0].id);
    }
  }, [periodsQuery.data, selectedPeriodId]);

  useEffect(() => {
    if (createOpen && settingsQuery.data) {
      setCreateForm(
        suggestPayPeriod(
          settingsQuery.data.payPeriodType,
          settingsQuery.data.payrollWeekStartDay,
        ),
      );
    }
  }, [createOpen, settingsQuery.data]);

  const invalidatePayroll = () => {
    void queryClient.invalidateQueries({ queryKey: ["payroll"] });
  };

  const createRequiredFields = useMemo(
    () => ({
      periodStart: createForm.periodStart,
      periodEnd: createForm.periodEnd,
    }),
    [createForm],
  );

  const createDisabled = !areRequiredFieldsFilled(createRequiredFields, [
    "periodStart",
    "periodEnd",
  ]);

  const createMutation = useMutation({
    mutationFn: createPayrollPeriod,
    onSuccess: (period) => {
      setCreateOpen(false);
      setSelectedPeriodId(period.id);
      toast.success("Payroll period created.");
      invalidatePayroll();
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to create payroll period",
      );
    },
  });

  const generateMutation = useMutation({
    mutationFn: generatePayrollPeriod,
    onSuccess: (period) => {
      toast.success("Payroll period generated.");
      setSelectedPeriodId(period.id);
      setActionLoadingId(null);
      invalidatePayroll();
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to generate payroll period",
      );
      setActionLoadingId(null);
    },
  });

  const exportMutation = useMutation({
    mutationFn: exportPayrollPeriodCsv,
    onSuccess: () => {
      toast.success("Payroll CSV downloaded.");
      setActionLoadingId(null);
      invalidatePayroll();
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to export payroll CSV",
      );
      setActionLoadingId(null);
    },
  });

  const syncMutation = useMutation({
    mutationFn: syncPayrollPeriodToAccounting,
    onSuccess: (result) => {
      toast.success(
        `Synced to Xero (journal ${result.externalReference.slice(0, 8)}…).`,
      );
      setActionLoadingId(null);
      invalidatePayroll();
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to sync payroll to Xero",
      );
      setActionLoadingId(null);
    },
  });

  const handleCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate(createForm);
  };

  const handleGenerate = (period: PayrollPeriod) => {
    setSelectedPeriodId(period.id);
    setActionLoadingId(`${period.id}-generate`);
    generateMutation.mutate(period.id);
  };

  const handleExport = (period: PayrollPeriod) => {
    setSelectedPeriodId(period.id);
    setActionLoadingId(`${period.id}-export`);
    exportMutation.mutate(period.id);
  };

  const handleSync = (period: PayrollPeriod) => {
    setSelectedPeriodId(period.id);
    setActionLoadingId(`${period.id}-sync`);
    syncMutation.mutate(period.id);
  };

  if (!canAccess) {
    return <Navigate to={homePathForRole(user?.role)} replace />;
  }

  const selectedPeriod = selectedPeriodQuery.data;
  const previewSummaries =
    selectedPeriod?.employeeSummaries ??
    periodsQuery.data?.find((period) => period.id === selectedPeriodId)
      ?.employeeSummaries ??
    [];

  return (
    <PageContainer>
      <PageHeader
        label="Operations"
        title="Payroll export"
        description="Create payroll periods, generate summaries from approved timesheets and expenses, export CSV, or sync to Xero."
        action={
          canGenerate ? (
            <Button
              icon={<HiPlus className="h-4 w-4 text-white" />}
              onClick={() => setCreateOpen(true)}
            >
              Create period
            </Button>
          ) : undefined
        }
      />

      <div className="mb-8">
        <PayrollPeriodsTable
          periods={periodsQuery.data ?? []}
          loading={isQueryInitialLoad(periodsQuery)}
          selectedPeriodId={selectedPeriodId}
          actionLoadingId={actionLoadingId}
          canGenerate={Boolean(canGenerate)}
          canExport={Boolean(canExport)}
          canSync={canSync}
          onSelect={(period) => setSelectedPeriodId(period.id)}
          onGenerate={handleGenerate}
          onExport={handleExport}
          onSync={handleSync}
        />
      </div>

      {selectedPeriodId && (
        <div className="card-surface space-y-4 p-6">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Preview
            </h2>
            {selectedPeriod && (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {formatPeriodRange(
                  selectedPeriod.periodStart,
                  selectedPeriod.periodEnd,
                )}
                {" · "}
                {selectedPeriod.employeeSummaries.length} employee
                {selectedPeriod.employeeSummaries.length === 1 ? "" : "s"}
              </p>
            )}
          </div>

          <PayrollPreviewTable
            summaries={previewSummaries}
            loading={isQueryInitialLoad(selectedPeriodQuery)}
          />
        </div>
      )}

      <CreatePayrollPeriodModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        form={createForm}
        onFormChange={setCreateForm}
        loading={createMutation.isPending}
        submitDisabled={createDisabled}
      />
    </PageContainer>
  );
};
