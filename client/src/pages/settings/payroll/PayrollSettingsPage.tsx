import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { HiArrowLeft, HiBanknotes, HiCalendarDays, HiSignal } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { Input } from '../../../components/ui/Input';
import { PageContainer } from '../../../components/ui/PageContainer';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Select } from '../../../components/ui/Select';
import { useAuth } from '../../../contexts/AuthContext';
import { ApiError, fetchPayrollSettings, patchPayrollSettings } from '../../../lib/api';
import type { PayPeriodType } from '../../../types';
import { hasFormChanges } from '../../../utils/form';

type PayrollSettingsForm = {
  payPeriodType: PayPeriodType;
  defaultPayCurrency: string;
  payrollWeekStartDay: string;
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
}): PayrollSettingsForm => ({
  payPeriodType: settings.payPeriodType,
  defaultPayCurrency: settings.defaultPayCurrency,
  payrollWeekStartDay: String(settings.payrollWeekStartDay),
});

export const PayrollSettingsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const canManage = user?.role === 'company_admin';

  const settingsQuery = useQuery({
    queryKey: ['settings', 'payroll'],
    queryFn: fetchPayrollSettings,
    enabled: Boolean(canManage),
  });

  const [form, setForm] = useState<PayrollSettingsForm>({
    payPeriodType: 'weekly',
    defaultPayCurrency: 'GBP',
    payrollWeekStartDay: '1',
  });
  const [original, setOriginal] = useState<PayrollSettingsForm>(form);

  useEffect(() => {
    if (settingsQuery.data) {
      const next = toForm(settingsQuery.data);
      setForm(next);
      setOriginal(next);
    }
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      patchPayrollSettings({
        payPeriodType: form.payPeriodType,
        defaultPayCurrency: form.defaultPayCurrency.toUpperCase(),
        payrollWeekStartDay: Number(form.payrollWeekStartDay),
      }),
    onSuccess: () => {
      toast.success('Payroll settings saved');
      setOriginal(form);
      void queryClient.invalidateQueries({ queryKey: ['settings', 'payroll'] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to save payroll settings');
    },
  });

  if (!canManage) {
    return <Navigate to="/dashboard/settings" replace />;
  }

  const changed = hasFormChanges(form, original, [
    'payPeriodType',
    'defaultPayCurrency',
    'payrollWeekStartDay',
  ]);

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
        description="Configure pay period type, currency, and week start for payroll export."
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
    </PageContainer>
  );
};
