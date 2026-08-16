import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { HiLink, HiXMark } from "react-icons/hi2";
import { toast } from "react-toastify";
import { Button } from "../../../../components/ui/Button";
import { PageContainer } from "../../../../components/ui/PageContainer";
import { SettingsPageHeader } from "../components/SettingsPageHeader";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  ApiError,
  disconnectAccounting,
  fetchAccountingConnectUrl,
  fetchAccountingConnectionStatus,
  fetchPayrollSettings,
  patchPayrollSettings,
} from "../../../../lib/api";
import { hasFormChanges, pickChangedFields } from "../../../../utils/form";
import { ADMIN_SETTINGS_PATH } from "../../utils";
import { PayrollConfigCard } from "./components/PayrollConfigCard";
import { PayrollConfigEditModal } from "./components/PayrollConfigEditModal";
import { XeroAccountCodesCard } from "./components/XeroAccountCodesCard";
import { XeroAccountCodesEditModal } from "./components/XeroAccountCodesEditModal";
import {
  DEFAULT_PAYROLL_FORM,
  toPayrollForm,
  type PayrollConfigFormValues,
  type PayrollSettingsFormValues,
  type XeroAccountCodesFormValues,
} from "./utils";

const CONFIG_KEYS = [
  "payPeriodType",
  "defaultPayCurrency",
  "payrollWeekStartDay",
] as const;

const XERO_KEYS = ["xeroExpenseAccountCode", "xeroPayableAccountCode"] as const;

export const PayrollSettingsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const canManage = user?.role === "company_admin";

  const settingsQuery = useQuery({
    queryKey: ["settings", "payroll"],
    queryFn: fetchPayrollSettings,
    enabled: Boolean(canManage),
  });

  const accountingQuery = useQuery({
    queryKey: ["payroll", "accounting", "status"],
    queryFn: fetchAccountingConnectionStatus,
    enabled: Boolean(canManage),
  });

  const [original, setOriginal] =
    useState<PayrollSettingsFormValues>(DEFAULT_PAYROLL_FORM);
  const [configForm, setConfigForm] = useState<PayrollConfigFormValues>({
    payPeriodType: DEFAULT_PAYROLL_FORM.payPeriodType,
    defaultPayCurrency: DEFAULT_PAYROLL_FORM.defaultPayCurrency,
    payrollWeekStartDay: DEFAULT_PAYROLL_FORM.payrollWeekStartDay,
  });
  const [xeroForm, setXeroForm] = useState<XeroAccountCodesFormValues>({
    xeroExpenseAccountCode: DEFAULT_PAYROLL_FORM.xeroExpenseAccountCode,
    xeroPayableAccountCode: DEFAULT_PAYROLL_FORM.xeroPayableAccountCode,
  });
  const [configEditOpen, setConfigEditOpen] = useState(false);
  const [xeroEditOpen, setXeroEditOpen] = useState(false);

  useEffect(() => {
    if (settingsQuery.data) {
      const next = toPayrollForm(settingsQuery.data);
      setOriginal(next);
      setConfigForm({
        payPeriodType: next.payPeriodType,
        defaultPayCurrency: next.defaultPayCurrency,
        payrollWeekStartDay: next.payrollWeekStartDay,
      });
      setXeroForm({
        xeroExpenseAccountCode: next.xeroExpenseAccountCode,
        xeroPayableAccountCode: next.xeroPayableAccountCode,
      });
    }
  }, [settingsQuery.data]);

  useEffect(() => {
    const xeroResult = searchParams.get("xero");
    if (!xeroResult) return;

    if (xeroResult === "connected") {
      toast.success("Xero connected successfully.");
      void queryClient.invalidateQueries({
        queryKey: ["payroll", "accounting", "status"],
      });
    } else if (xeroResult === "error") {
      const message = searchParams.get("message") ?? "Failed to connect Xero";
      toast.error(decodeURIComponent(message));
    }

    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams, queryClient]);

  const invalidateSettings = () => {
    void queryClient.invalidateQueries({ queryKey: ["settings", "payroll"] });
    void queryClient.invalidateQueries({
      queryKey: ["payroll", "accounting", "status"],
    });
  };

  const configSaveMutation = useMutation({
    mutationFn: () => {
      const changed = pickChangedFields(
        configForm as unknown as Record<string, unknown>,
        {
          payPeriodType: original.payPeriodType,
          defaultPayCurrency: original.defaultPayCurrency,
          payrollWeekStartDay: original.payrollWeekStartDay,
        } as unknown as Record<string, unknown>,
        [...CONFIG_KEYS],
      );

      return patchPayrollSettings({
        ...(changed.payPeriodType !== undefined
          ? { payPeriodType: configForm.payPeriodType }
          : {}),
        ...(changed.defaultPayCurrency !== undefined
          ? { defaultPayCurrency: configForm.defaultPayCurrency.toUpperCase() }
          : {}),
        ...(changed.payrollWeekStartDay !== undefined
          ? { payrollWeekStartDay: Number(configForm.payrollWeekStartDay) }
          : {}),
      });
    },
    onSuccess: () => {
      toast.success("Payroll configuration saved");
      setOriginal((prev) => ({ ...prev, ...configForm }));
      setConfigEditOpen(false);
      invalidateSettings();
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to save payroll configuration",
      );
    },
  });

  const xeroSaveMutation = useMutation({
    mutationFn: () => {
      const changed = pickChangedFields(
        xeroForm as unknown as Record<string, unknown>,
        {
          xeroExpenseAccountCode: original.xeroExpenseAccountCode,
          xeroPayableAccountCode: original.xeroPayableAccountCode,
        } as unknown as Record<string, unknown>,
        [...XERO_KEYS],
      );

      return patchPayrollSettings({
        ...(changed.xeroExpenseAccountCode !== undefined
          ? {
              xeroExpenseAccountCode: xeroForm.xeroExpenseAccountCode.trim(),
            }
          : {}),
        ...(changed.xeroPayableAccountCode !== undefined
          ? {
              xeroPayableAccountCode: xeroForm.xeroPayableAccountCode.trim(),
            }
          : {}),
      });
    },
    onSuccess: () => {
      toast.success("Xero account codes saved");
      setOriginal((prev) => ({ ...prev, ...xeroForm }));
      setXeroEditOpen(false);
      invalidateSettings();
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to save Xero account codes",
      );
    },
  });

  const connectMutation = useMutation({
    mutationFn: fetchAccountingConnectUrl,
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to start Xero connection",
      );
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: disconnectAccounting,
    onSuccess: () => {
      toast.success("Xero disconnected");
      void queryClient.invalidateQueries({
        queryKey: ["payroll", "accounting", "status"],
      });
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to disconnect Xero",
      );
    },
  });

  if (!canManage) {
    return <Navigate to={ADMIN_SETTINGS_PATH} replace />;
  }

  const configChanged = hasFormChanges(
    configForm as unknown as Record<string, unknown>,
    {
      payPeriodType: original.payPeriodType,
      defaultPayCurrency: original.defaultPayCurrency,
      payrollWeekStartDay: original.payrollWeekStartDay,
    } as unknown as Record<string, unknown>,
    [...CONFIG_KEYS],
  );

  const xeroChanged = hasFormChanges(
    xeroForm as unknown as Record<string, unknown>,
    {
      xeroExpenseAccountCode: original.xeroExpenseAccountCode,
      xeroPayableAccountCode: original.xeroPayableAccountCode,
    } as unknown as Record<string, unknown>,
    [...XERO_KEYS],
  );

  const handleOpenConfigEdit = () => {
    setConfigForm({
      payPeriodType: original.payPeriodType,
      defaultPayCurrency: original.defaultPayCurrency,
      payrollWeekStartDay: original.payrollWeekStartDay,
    });
    setConfigEditOpen(true);
  };

  const handleCloseConfigEdit = () => {
    setConfigEditOpen(false);
    setConfigForm({
      payPeriodType: original.payPeriodType,
      defaultPayCurrency: original.defaultPayCurrency,
      payrollWeekStartDay: original.payrollWeekStartDay,
    });
  };

  const handleOpenXeroEdit = () => {
    setXeroForm({
      xeroExpenseAccountCode: original.xeroExpenseAccountCode,
      xeroPayableAccountCode: original.xeroPayableAccountCode,
    });
    setXeroEditOpen(true);
  };

  const handleCloseXeroEdit = () => {
    setXeroEditOpen(false);
    setXeroForm({
      xeroExpenseAccountCode: original.xeroExpenseAccountCode,
      xeroPayableAccountCode: original.xeroPayableAccountCode,
    });
  };

  const handleConfigSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!configChanged || configSaveMutation.isPending) return;
    configSaveMutation.mutate();
  };

  const handleXeroSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!xeroChanged || xeroSaveMutation.isPending) return;
    xeroSaveMutation.mutate();
  };

  const accounting = accountingQuery.data;

  return (
    <PageContainer className="space-y-6">
      <SettingsPageHeader
        title="Payroll settings"
        description="Configure pay period type, currency, week start, and Xero accounting integration."
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <PayrollConfigCard values={original} onEdit={handleOpenConfigEdit} />
        <XeroAccountCodesCard values={original} onEdit={handleOpenXeroEdit} />
      </div>

      <div className="card-surface space-y-4 p-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Xero accounting
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Connect Xero to push generated payroll periods as draft manual
            journals.
          </p>
        </div>

        {!accounting?.configured && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            Xero is not configured on the server. Set{" "}
            <code>XERO_CLIENT_ID</code>, <code>XERO_CLIENT_SECRET</code>, and{" "}
            <code>XERO_REDIRECT_URI</code> in <code>server/.env.local</code>.
          </div>
        )}

        {accounting?.connected ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200">
              Connected to <strong>{accounting.organisationName}</strong>
              {accounting.connectedAt && (
                <>
                  {" "}
                  since{" "}
                  {new Date(accounting.connectedAt).toLocaleDateString(
                    undefined,
                    {
                      dateStyle: "medium",
                    },
                  )}
                </>
              )}
            </div>
            <Button
              variant="secondary"
              icon={<HiXMark className="h-4 w-4 text-red-500" />}
              loading={disconnectMutation.isPending}
              loadingText="Disconnecting…"
              onClick={() => disconnectMutation.mutate()}
            >
              Disconnect Xero
            </Button>
          </div>
        ) : (
          <Button
            icon={<HiLink className="h-4 w-4 text-white" />}
            loading={connectMutation.isPending}
            loadingText="Redirecting…"
            disabled={!accounting?.configured}
            onClick={() => connectMutation.mutate()}
          >
            Connect Xero
          </Button>
        )}
      </div>

      <PayrollConfigEditModal
        open={configEditOpen}
        onClose={handleCloseConfigEdit}
        values={configForm}
        onChange={(field, value) =>
          setConfigForm((prev) => ({ ...prev, [field]: value }))
        }
        onSubmit={handleConfigSubmit}
        loading={configSaveMutation.isPending}
        hasChanges={configChanged}
      />

      <XeroAccountCodesEditModal
        open={xeroEditOpen}
        onClose={handleCloseXeroEdit}
        values={xeroForm}
        onChange={(field, value) =>
          setXeroForm((prev) => ({ ...prev, [field]: value }))
        }
        onSubmit={handleXeroSubmit}
        loading={xeroSaveMutation.isPending}
        hasChanges={xeroChanged}
      />
    </PageContainer>
  );
};
