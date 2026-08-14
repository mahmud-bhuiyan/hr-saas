import { FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { HiArrowPath, HiPlus, HiSignal } from 'react-icons/hi2';
import { toast } from 'react-toastify';
import { Button } from '../../components/ui/Button';
import { PageContainer } from '../../components/ui/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { Tabs } from '../../components/ui/Tabs';
import { useAuth } from '../../contexts/AuthContext';
import {
  ApiError,
  claimShift,
  copyRotaWeek,
  createShift,
  deleteShift,
  fetchEmployees,
  fetchRotaWeek,
  fetchWorkLocations,
  patchShift,
  publishRotaWeek,
} from '../../lib/api';
import type { Shift } from '../../types';
import { pickChangedFields } from '../../utils/form';
import { hasPermission } from '../../utils/permissions';
import { isQueryInitialLoad } from '../../utils/query';
import { MyShiftsTable } from './components/MyShiftsTable';
import { OpenShiftsTable } from './components/OpenShiftsTable';
import { PublishRotaModal } from './components/PublishRotaModal';
import { RotaWeekGrid } from './components/RotaWeekGrid';
import { ShiftFormModal } from './components/ShiftFormModal';
import { WeekPickerBar } from './components/WeekPickerBar';
import {
  emptyShiftForm,
  filterMyShifts,
  filterOpenShifts,
  formatWeekOf,
  getMondayOfWeek,
  type RotasTab,
  type ShiftFormState,
} from './utils';

const TENANT_ROTA_ROLES = ['company_admin', 'hr_manager', 'manager', 'employee'] as const;

export const RotasPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const canAccess =
    user && TENANT_ROTA_ROLES.includes(user.role as (typeof TENANT_ROTA_ROLES)[number]);
  const canManage = user && hasPermission(user.role, 'rota:manage');
  const canReadOwn = user && hasPermission(user.role, 'rota:read:own');
  const canClaim = user && hasPermission(user.role, 'rota:claim:own');

  const [weekOf, setWeekOf] = useState(() => formatWeekOf(getMondayOfWeek(new Date())));
  const [activeTab, setActiveTab] = useState<RotasTab>(() =>
    canManage ? 'weekly-rota' : canReadOwn ? 'my-shifts' : 'open-shifts'
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Shift | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [createForm, setCreateForm] = useState<ShiftFormState>(() => emptyShiftForm());
  const [editForm, setEditForm] = useState<ShiftFormState>(() => emptyShiftForm());
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [claimLoadingId, setClaimLoadingId] = useState<string | null>(null);

  const rotaQuery = useQuery({
    queryKey: ['rotas', weekOf],
    queryFn: () => fetchRotaWeek(weekOf),
    enabled: Boolean(canAccess),
  });

  const locationsQuery = useQuery({
    queryKey: ['locations', 'active'],
    queryFn: () => fetchWorkLocations(false),
    enabled: Boolean(canManage),
  });

  const employeesQuery = useQuery({
    queryKey: ['employees', 'rota'],
    queryFn: () => fetchEmployees({ status: 'active' }),
    enabled: Boolean(canManage),
  });

  const invalidateRotas = () => {
    void queryClient.invalidateQueries({ queryKey: ['rotas'] });
  };

  const createMutation = useMutation({
    mutationFn: createShift,
    onSuccess: () => {
      toast.success('Shift created.');
      setCreateOpen(false);
      setCreateForm(emptyShiftForm());
      invalidateRotas();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to create shift');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Record<string, unknown> }) =>
      patchShift(id, input),
    onSuccess: () => {
      toast.success('Shift updated.');
      setEditTarget(null);
      invalidateRotas();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to update shift');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteShift,
    onSuccess: () => {
      toast.success('Shift deleted.');
      setActionLoadingId(null);
      invalidateRotas();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to delete shift');
      setActionLoadingId(null);
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => publishRotaWeek({ weekOf }),
    onSuccess: (result) => {
      toast.success(`Published ${result.publishedCount} shift${result.publishedCount === 1 ? '' : 's'}.`);
      setPublishOpen(false);
      invalidateRotas();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to publish rota');
    },
  });

  const copyMutation = useMutation({
    mutationFn: () => copyRotaWeek({ weekOf }),
    onSuccess: (result) => {
      toast.success(`Copied ${result.copiedCount} shift${result.copiedCount === 1 ? '' : 's'} from previous week.`);
      invalidateRotas();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to copy previous week');
    },
  });

  const claimMutation = useMutation({
    mutationFn: claimShift,
    onSuccess: () => {
      toast.success('Shift claimed.');
      setClaimLoadingId(null);
      invalidateRotas();
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to claim shift');
      setClaimLoadingId(null);
    },
  });

  const shifts = rotaQuery.data?.shifts ?? [];
  const myShifts = useMemo(() => filterMyShifts(shifts), [shifts]);
  const openShifts = useMemo(() => filterOpenShifts(shifts), [shifts]);
  const draftCount = shifts.filter((shift) => shift.status === 'draft').length;

  const tabs = [
    ...(canManage ? [{ id: 'weekly-rota' as const, label: 'Weekly rota' }] : []),
    ...(canReadOwn ? [{ id: 'my-shifts' as const, label: 'My shifts', count: myShifts.length }] : []),
    ...(canClaim
      ? [{ id: 'open-shifts' as const, label: 'Open shifts', count: openShifts.length }]
      : []),
  ];

  const buildShiftPayload = (form: ShiftFormState) => ({
    date: form.date,
    startTime: form.startTime,
    endTime: form.endTime,
    locationId: form.locationId,
    employeeId: form.employeeId ? form.employeeId : null,
    role: form.role.trim() || undefined,
  });

  const handleCreateSubmit = (event: FormEvent) => {
    event.preventDefault();
    createMutation.mutate(buildShiftPayload(createForm));
  };

  const handleEditSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!editTarget) {
      return;
    }

    const original = {
      date: editTarget.date,
      startTime: editTarget.startTime,
      endTime: editTarget.endTime,
      locationId: editTarget.locationId,
      employeeId: editTarget.employeeId,
      role: editTarget.role ?? '',
    };

    const next = {
      date: editForm.date,
      startTime: editForm.startTime,
      endTime: editForm.endTime,
      locationId: editForm.locationId,
      employeeId: editForm.employeeId ? editForm.employeeId : null,
      role: editForm.role.trim(),
    };

    const changed = pickChangedFields(next, original, [
      'date',
      'startTime',
      'endTime',
      'locationId',
      'employeeId',
      'role',
    ]);
    if (Object.keys(changed).length === 0) {
      return;
    }

    if ('role' in changed && changed.role === '') {
      changed.role = '';
    }

    updateMutation.mutate({ id: editTarget.id, input: changed });
  };

  if (!canAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  const locations = locationsQuery.data ?? [];
  const employees = employeesQuery.data ?? [];
  const noLocations = canManage && !isQueryInitialLoad(locationsQuery) && locations.length === 0;

  return (
    <PageContainer>
      <PageHeader
        label="Scheduling"
        title="Rotas"
        description={
          canManage
            ? 'Build weekly shift schedules, publish to staff, and manage open shifts.'
            : 'View your assigned shifts and claim open shifts when available.'
        }
        action={
          canManage ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                icon={<HiArrowPath className="h-4 w-4 text-brand-600" />}
                loading={copyMutation.isPending}
                loadingText="Copying"
                onClick={() => copyMutation.mutate()}
              >
                Copy previous week
              </Button>
              <Button
                type="button"
                variant="secondary"
                icon={<HiSignal className="h-4 w-4 text-brand-600" />}
                disabled={draftCount === 0}
                onClick={() => setPublishOpen(true)}
              >
                Publish week{draftCount > 0 ? ` (${draftCount})` : ''}
              </Button>
              <Button
                type="button"
                icon={<HiPlus className="h-4 w-4 text-white" />}
                onClick={() => {
                  setCreateForm(emptyShiftForm(weekOf));
                  setCreateOpen(true);
                }}
              >
                Add shift
              </Button>
            </div>
          ) : undefined
        }
      />

      {noLocations && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-900/20 dark:text-amber-200">
          Add at least one work location in Settings before creating shifts.
        </div>
      )}

      <Tabs
        tabs={tabs}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as RotasTab)}
        className="mb-6"
      />

      <div className="space-y-6">
        <WeekPickerBar weekOf={weekOf} onWeekChange={setWeekOf} />

        {activeTab === 'weekly-rota' && canManage && (
          <RotaWeekGrid
            weekOf={weekOf}
            shifts={shifts}
            loading={isQueryInitialLoad(rotaQuery)}
            actionLoadingId={actionLoadingId}
            canManage={canManage}
            onAddShift={(date) => {
              setCreateForm(emptyShiftForm(date));
              setCreateOpen(true);
            }}
            onEditShift={(shift) => {
              setEditTarget(shift);
              setEditForm({
                date: shift.date,
                startTime: shift.startTime,
                endTime: shift.endTime,
                locationId: shift.locationId,
                employeeId: shift.employeeId ?? '',
                role: shift.role ?? '',
              });
            }}
            onDeleteShift={(shift) => {
              setActionLoadingId(shift.id);
              deleteMutation.mutate(shift.id);
            }}
          />
        )}

        {activeTab === 'my-shifts' && canReadOwn && (
          <MyShiftsTable shifts={myShifts} loading={isQueryInitialLoad(rotaQuery)} />
        )}

        {activeTab === 'open-shifts' && canClaim && (
          <OpenShiftsTable
            shifts={openShifts}
            loading={isQueryInitialLoad(rotaQuery)}
            claimLoadingId={claimLoadingId}
            onClaim={(shift) => {
              setClaimLoadingId(shift.id);
              claimMutation.mutate(shift.id);
            }}
          />
        )}
      </div>

      <ShiftFormModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setCreateForm(emptyShiftForm());
        }}
        onSubmit={handleCreateSubmit}
        title="Add shift"
        description="Create a draft shift. Publish the week when ready for staff to see it."
        submitLabel="Create shift"
        form={createForm}
        locations={locations}
        employees={employees}
        loading={createMutation.isPending}
        onChange={setCreateForm}
      />

      <ShiftFormModal
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEditSubmit}
        title="Edit shift"
        description="Update shift details. Leave conflicts are checked on save."
        submitLabel="Save changes"
        form={editForm}
        original={editTarget}
        locations={locations}
        employees={employees}
        loading={updateMutation.isPending}
        onChange={setEditForm}
      />

      <PublishRotaModal
        open={publishOpen}
        weekOf={weekOf}
        draftCount={draftCount}
        loading={publishMutation.isPending}
        onClose={() => setPublishOpen(false)}
        onConfirm={() => publishMutation.mutate()}
      />
    </PageContainer>
  );
};
