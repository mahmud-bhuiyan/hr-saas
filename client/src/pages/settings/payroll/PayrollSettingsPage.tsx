import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import {
  HiArrowLeft,
  HiBanknotes,
  HiCalendarDays,
  HiLink,
  HiSignal,
  HiXMark,
} from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import { PageContainer } from '../../../components/ui/PageContainer';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Select } from '../../../components/ui/Select';
import { useAuth } from '../../../contexts/AuthContext';
import {
  ApiError,
  disconnectAccounting,
  fetchAccountingConnectUrl,
  fetchAccountingConnectionStatus,
  fetchPayrollSettings,
  patchPayrollSettings,
} from '../../../lib/api';
import type { PayPeriodType } from '../../../types';
import { hasFormChanges } from '../../../utils/form';

type PayrollSettingsForm = {
  payPeriodType: PayPeriodType;
  defaultPayCurrency: string;
  payrollWeekStartDay: string;
  xeroExpenseAccountCode: string;
  xeroPayableAccountCode: string;
};

const WEEKDAY_OPTIONS = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

const toForm = (settings: {
  payPeriodType: PayPeriodType;
  defaultPayCurrency: string;
  payrollWeekStartDay: number;
  xeroExpenseAccountCode: string;
  xeroPayableAccountCode: string;
}): PayrollSettingsForm => ({
  payPeriodType: settings.payPeriodType,
  defaultPayCurrency: settings.defaultPayCurrency,
  payrollWeekStartDay: String(settings.payrollWeekStartDay),
  xeroExpenseAccountCode: settings.xeroExpenseAccountCode,
  xeroPayableAccountCode: settings.xeroPayableAccountCode,
});

export const PayrollSettingsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const canManage = user?.role === 'company_admin';

  const settingsQuery = useQuery({
    queryKey: ['settings', 'payroll'],
    queryFn: fetchPayrollSettings,
    enabled: Boolean(canManage),
  });

  const accountingQuery = useQuery({
    queryKey: ['payroll', 'accounting', 'status'],
    queryFn: fetchAccountingConnectionStatus,
    enabled: Boolean(canManage),
  });

  const [form, setForm] = useState<PayrollSettingsForm>({
    payPeriodType: 'weekly',
    defaultPayCurrency: 'GBP',
    payrollWeekStartDay: '1',
    xeroExpenseAccountCode: '477',
    xeroPayableAccountCode: '804',
  });
  const [original, setOriginal] = useState<PayrollSettingsForm>(form);

  useEffect(() => {
    if (settingsQuery.data) {
      const next = toForm(settingsQuery.data);
      setForm(next);
      setOriginal(next);
    }
  }, [settingsQuery.data]);

  useEffect(() => {
    const xeroResult = searchParams.get('xero');
    if (!xeroResult) return;

    if (xeroResult === 'connected') {
      toast.success('Xero connected successfully.');
      void queryClient.invalidateQueries({ queryKey: ['payroll', 'accounting', 'status'] });
    } else if (xeroResult === 'error') {
      const message = searchParams.get('message') ?? 'Failed to connect Xero';
      toast.error(decodeURIComponent(message));
    }

    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams, queryClient]);

  const saveMutation = useMutation({
    mutationFn: () =>
      patchPayrollSettings({
        payPeriodType: form.payPeriodType,
        defaultPayCurrency: form.defaultPayCurrency.toUpperCase(),
        payrollWeekStartDay: Number(form.payrollWeekStartDay),
        xeroExpenseAccountCode: form.xeroExpenseAccountCode.trim(),
        xeroPayableAccountCode: form.xeroPayableAccountCode.trim(),
      }),
    onSuccess: () => {
      toast.success('Payroll settings saved');
      setOriginal(form);
      void queryClient.invalidateQueries({ queryKey: ['settings', 'payroll'] });
      void queryClient.invalidateQueries({ queryKey: ['payroll', 'accounting', 'status'] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to save payroll settings');
    },
  });

  const connectMutation = useMutation({
    mutationFn: fetchAccountingConnectUrl,
    onSuccess: (url) => {
      window.location.href = url;
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to start Xero connection');
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: disconnectAccounting,
    onSuccess: () => {
      toast.success('Xero disconnected');
      void queryClient.invalidateQueries({ queryKey: ['payroll', 'accounting', 'status'] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to disconnect Xero');
    },
  });

  if (!canManage) {
    return <Navigate to="/dashboard/settings" replace />;
  }

  const changed = hasFormChanges(form, original, [
    'payPeriodType',
    'defaultPayCurrency',
    'payrollWeekStartDay',
    'xeroExpenseAccountCode',
    'xeroPayableAccountCode',
  ]);

  const accounting = accountingQuery.data;

  return (
    <PageContainer className="space-y-6">
      <Link
        to="/dashboard/settings"
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <HiArrowLeft className="h-4 w-4" />
        Back to settings
      </Link>

      <PageHeader
        label="Settings"
        title="Payroll settings"
        description="Configure pay period type, currency, week start, and Xero accounting integration."
      />

      <div className="card-surface max-w-lg space-y-5 p-6">
        <FormField label="Pay period type">
          <Select
            value={form.payPeriodType}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                payPeriodType: event.target.value as PayPeriodType,
              }))
            }
            icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
          >
            <option value="weekly">Weekly</option>
            <option value="biweekly">Biweekly</option>
            <option value="monthly">Monthly</option>
          </Select>
        </FormField>

        <FormField label="Default pay currency" htmlFor="pay-currency">
          <Input
            id="pay-currency"
            value={form.defaultPayCurrency}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, defaultPayCurrency: event.target.value.toUpperCase() }))
            }
            maxLength={3}
            icon={<HiBanknotes className="h-4 w-4 text-brand-600" />}
          />
        </FormField>

        <FormField label="Payroll week starts on">
          <Select
            value={form.payrollWeekStartDay}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, payrollWeekStartDay: event.target.value }))
            }
            icon={<HiSignal className="h-4 w-4 text-brand-600" />}
          >
            {WEEKDAY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>

        <div className="border-t border-slate-200 pt-5 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Xero account codes
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Chart of accounts codes used when syncing payroll as a manual journal.
          </p>

          <div className="mt-4 space-y-4">
            <FormField label="Wages expense account" htmlFor="xero-expense-account">
              <Input
                id="xero-expense-account"
                value={form.xeroExpenseAccountCode}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, xeroExpenseAccountCode: event.target.value }))
                }
                icon={<HiBanknotes className="h-4 w-4 text-brand-600" />}
              />
            </FormField>

            <FormField label="Wages payable account" htmlFor="xero-payable-account">
              <Input
                id="xero-payable-account"
                value={form.xeroPayableAccountCode}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, xeroPayableAccountCode: event.target.value }))
                }
                icon={<HiBanknotes className="h-4 w-4 text-brand-600" />}
              />
            </FormField>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            loading={saveMutation.isPending}
            loadingText="Saving…"
            disabled={!changed}
            onClick={() => saveMutation.mutate()}
          >
            Save changes
          </Button>
        </div>
      </div>

      <div className="card-surface max-w-lg space-y-4 p-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Xero accounting
          </h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Connect Xero to push generated payroll periods as draft manual journals.
          </p>
        </div>

        {!accounting?.configured && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            Xero is not configured on the server. Set <code>XERO_CLIENT_ID</code>,{' '}
            <code>XERO_CLIENT_SECRET</code>, and <code>XERO_REDIRECT_URI</code> in{' '}
            <code>server/.env.local</code>.
          </div>
        )}

        {accounting?.connected ? (
          <div className="space-y-3">
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-200">
              Connected to <strong>{accounting.organisationName}</strong>
              {accounting.connectedAt && (
                <>
                  {' '}
                  since{' '}
                  {new Date(accounting.connectedAt).toLocaleDateString(undefined, {
                    dateStyle: 'medium',
                  })}
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
    </PageContainer>
  );
};
