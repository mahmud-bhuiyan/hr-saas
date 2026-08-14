import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { HiCalendarDays, HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { Button } from '../../components/ui/Button';
import { PageContainer } from '../../components/ui/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { Tabs } from '../../components/ui/Tabs';
import { useAuth } from '../../contexts/AuthContext';
import {
  ApiError,
  approveTimesheet,
  declineTimesheet,
  fetchMyTimesheetForWeek,
  fetchTimesheetApprovalQueue,
  generateTimesheet,
  patchTimesheet,
  submitTimesheet,
} from '../../lib/api';
import type { TimesheetEntry } from '../../types';
import { hasPermission } from '../../utils/permissions';
import { TimesheetApprovalQueue } from './components/TimesheetApprovalQueue';
import { TimesheetWeekGrid } from './components/TimesheetWeekGrid';
import { formatWeekRange, getMondayOfWeek, formatWeekOf, shiftWeek, type TimesheetTab } from './utils';

const TENANT_TIMESHEET_ROLES = ['company_admin', 'hr_manager', 'manager', 'employee'] as const;

export const TimesheetsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TimesheetTab>('my-timesheet');
  const [weekOf, setWeekOf] = useState(() => formatWeekOf(getMondayOfWeek(new Date())));
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const canAccess =
    user &&
    TENANT_TIMESHEET_ROLES.includes(user.role as (typeof TENANT_TIMESHEET_ROLES)[number]);
  const canSubmit = user && hasPermission(user.role, 'timesheet:submit:own');
  const canApprove =
    user &&
    (hasPermission(user.role, 'timesheet:approve') ||
      hasPermission(user.role, 'timesheet:approve:team'));

  const timesheetQuery = useQuery({
    queryKey: ['timesheets', 'me', weekOf],
    queryFn: () => fetchMyTimesheetForWeek(weekOf),
    enabled: Boolean(canSubmit),
    retry: false,
  });

  const approvalQuery = useQuery({
    queryKey: ['timesheets', 'approval'],
    queryFn: () => fetchTimesheetApprovalQueue(),
    enabled: Boolean(canApprove && activeTab === 'approval-queue'),
  });

  const missingEmployeeLink =
    timesheetQuery.isError &&
    timesheetQuery.error instanceof ApiError &&
    timesheetQuery.error.status === 403;

  const invalidateTimesheets = () => {
    void queryClient.invalidateQueries({ queryKey: ['timesheets'] });
  };

  const generateMutation = useMutation({
    mutationFn: () => generateTimesheet({ weekOf }),
    onSuccess: () => {
      toast.success('Timesheet generated from attendance.');
      invalidateTimesheets();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to generate timesheet');
    },
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, entries }: { id: string; entries: TimesheetEntry[] }) =>
      patchTimesheet(id, {
        entries: entries.map((entry) => ({
          date: entry.date,
          hours: entry.hours,
          notes: entry.notes,
        })),
      }),
    onSuccess: () => {
      toast.success('Timesheet saved.');
      invalidateTimesheets();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to save timesheet');
    },
  });

  const submitMutation = useMutation({
    mutationFn: submitTimesheet,
    onSuccess: () => {
      toast.success('Timesheet submitted for approval.');
      invalidateTimesheets();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to submit timesheet');
    },
  });

  const approveMutation = useMutation({
    mutationFn: approveTimesheet,
    onSuccess: () => {
      toast.success('Timesheet approved.');
      setActionLoadingId(null);
      invalidateTimesheets();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to approve timesheet');
      setActionLoadingId(null);
    },
  });

  const declineMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      declineTimesheet(id, { declineReason: reason }),
    onSuccess: () => {
      toast.success('Timesheet declined.');
      setActionLoadingId(null);
      invalidateTimesheets();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to decline timesheet');
      setActionLoadingId(null);
    },
  });

  if (!canAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  const tabs = [
    { id: 'my-timesheet' as const, label: 'My timesheet' },
    ...(canApprove ? [{ id: 'approval-queue' as const, label: 'Approval queue' }] : []),
  ];

  const timesheet = timesheetQuery.data ?? null;

  return (
    <PageContainer>
      <PageHeader
        label="Operations"
        title="Timesheets"
        description={
          canApprove
            ? 'Review weekly hours, submit for approval, and manage your team queue.'
            : 'Review weekly hours from attendance and submit for approval.'
        }
      />

      <Tabs
        tabs={tabs}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as TimesheetTab)}
        className="mb-6"
      />

      {activeTab === 'my-timesheet' && (
        <div className="space-y-6">
          {missingEmployeeLink ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-medium">No employee profile linked to your account</p>
              <p className="mt-1">
                Timesheets are tied to employee records. Contact your administrator to link your
                user to an employee record.
              </p>
            </div>
          ) : (
            <>
              <div className="card-surface flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Week</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatWeekRange(weekOf)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-2 py-2"
                    icon={<HiChevronLeft className="h-4 w-4 text-brand-600" />}
                    onClick={() => setWeekOf((current) => shiftWeek(current, -1))}
                    aria-label="Previous week"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    className="px-2 py-2"
                    icon={<HiChevronRight className="h-4 w-4 text-brand-600" />}
                    onClick={() => setWeekOf((current) => shiftWeek(current, +1))}
                    aria-label="Next week"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    icon={<HiCalendarDays className="h-4 w-4 text-brand-600" />}
                    onClick={() => setWeekOf(formatWeekOf(getMondayOfWeek(new Date())))}
                  >
                    This week
                  </Button>
                </div>
              </div>

              <TimesheetWeekGrid
                weekOf={weekOf}
                timesheet={timesheet}
                loading={timesheetQuery.isLoading}
                generating={generateMutation.isPending}
                saving={saveMutation.isPending}
                submitting={submitMutation.isPending}
                canEdit={Boolean(canSubmit)}
                onGenerate={() => generateMutation.mutate()}
                onSave={(entries) => {
                  if (timesheet?.id) {
                    saveMutation.mutate({ id: timesheet.id, entries });
                  }
                }}
                onSubmit={() => {
                  if (timesheet?.id) {
                    submitMutation.mutate(timesheet.id);
                  }
                }}
              />
            </>
          )}
        </div>
      )}

      {activeTab === 'approval-queue' && canApprove && (
        <TimesheetApprovalQueue
          timesheets={approvalQuery.data?.timesheets ?? []}
          loading={approvalQuery.isLoading}
          actionLoadingId={actionLoadingId}
          onApprove={(sheet) => {
            setActionLoadingId(sheet.id);
            approveMutation.mutate(sheet.id);
          }}
          onDecline={(sheet, reason) => {
            setActionLoadingId(sheet.id);
            declineMutation.mutate({ id: sheet.id, reason });
          }}
        />
      )}
    </PageContainer>
  );
};
