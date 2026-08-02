import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { PageContainer } from '../../components/ui/PageContainer';
import { PageHeader } from '../../components/ui/PageHeader';
import { Tabs } from '../../components/ui/Tabs';
import { useAuth } from '../../contexts/AuthContext';
import {
  ApiError,
  clockIn,
  clockOut,
  fetchAttendanceSettings,
  fetchMyAttendance,
  fetchMyAttendanceStatus,
  fetchTeamLiveAttendance,
  patchAttendanceLog,
} from '../../lib/api';
import type { AttendanceLog, PatchAttendanceInput } from '../../types';
import { hasPermission } from '../../utils/permissions';
import { AttendanceClockCard } from './components/AttendanceClockCard';
import { AttendanceCorrectionModal } from './components/AttendanceCorrectionModal';
import { AttendanceHistoryTable } from './components/AttendanceHistoryTable';
import { AttendanceTeamBoard } from './components/AttendanceTeamBoard';
import type { AttendanceTab } from './utils';

const TENANT_ATTENDANCE_ROLES = ['company_admin', 'hr_manager', 'manager', 'employee'] as const;

export const AttendancePage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<AttendanceTab>('my-attendance');
  const [historyPage, setHistoryPage] = useState(1);
  const [correctLog, setCorrectLog] = useState<AttendanceLog | null>(null);

  const canAccess =
    user &&
    TENANT_ATTENDANCE_ROLES.includes(user.role as (typeof TENANT_ATTENDANCE_ROLES)[number]);
  const canClock = user && hasPermission(user.role, 'attendance:clock:own');
  const canReadTeam = user && hasPermission(user.role, 'attendance:read:team');
  const canManage = user && hasPermission(user.role, 'attendance:manage');

  const settingsQuery = useQuery({
    queryKey: ['attendance', 'settings'],
    queryFn: fetchAttendanceSettings,
    enabled: Boolean(canClock),
  });

  const statusQuery = useQuery({
    queryKey: ['attendance', 'status'],
    queryFn: fetchMyAttendanceStatus,
    enabled: Boolean(canClock),
    refetchInterval: 60000,
    retry: false,
  });

  const historyQuery = useQuery({
    queryKey: ['attendance', 'me', historyPage],
    queryFn: () => fetchMyAttendance(historyPage),
    enabled: Boolean(canClock),
    retry: false,
  });

  const teamLiveQuery = useQuery({
    queryKey: ['attendance', 'team', 'live'],
    queryFn: fetchTeamLiveAttendance,
    enabled: Boolean(canReadTeam && activeTab === 'team-live'),
    refetchInterval: 30000,
  });

  const missingEmployeeLink =
    statusQuery.isError &&
    statusQuery.error instanceof ApiError &&
    statusQuery.error.status === 403 &&
    statusQuery.error.message.includes('No employee record linked');

  useEffect(() => {
    if (missingEmployeeLink && canReadTeam) {
      setActiveTab('team-live');
    }
  }, [missingEmployeeLink, canReadTeam]);

  const clockInMutation = useMutation({
    mutationFn: (withGps: boolean) => {
      if (!withGps) {
        return clockIn();
      }
      return new Promise<Awaited<ReturnType<typeof clockIn>>>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new ApiError('Geolocation is not supported by your browser', 400));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (position) => {
            clockIn({
              location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
            })
              .then(resolve)
              .catch(reject);
          },
          () => reject(new ApiError('Unable to retrieve your location', 400))
        );
      });
    },
    onSuccess: () => {
      toast.success('Clocked in successfully');
      void queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to clock in');
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: clockOut,
    onSuccess: () => {
      toast.success('Clocked out successfully');
      void queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to clock out');
    },
  });

  const correctMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: PatchAttendanceInput }) =>
      patchAttendanceLog(id, input),
    onSuccess: () => {
      toast.success('Attendance record updated');
      setCorrectLog(null);
      void queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof ApiError ? error.message : 'Failed to update record');
    },
  });

  if (!canAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  const tabs = [
    { id: 'my-attendance' as const, label: 'My attendance' },
    ...(canReadTeam ? [{ id: 'team-live' as const, label: 'Team live board' }] : []),
  ];

  return (
    <PageContainer>
      <PageHeader
        label="Operations"
        title="Attendance"
        description={
          canReadTeam
            ? 'Clock in and out, view history, and see who is working now.'
            : 'Clock in and out and view your attendance history.'
        }
      />

      <Tabs tabs={tabs} activeId={activeTab} onChange={(id) => setActiveTab(id as AttendanceTab)} className="mb-6" />

      {activeTab === 'my-attendance' && canClock && (
        <div className="space-y-6">
          {missingEmployeeLink ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              <p className="font-medium">No employee profile linked to your account</p>
              <p className="mt-1">
                Attendance is recorded against employee records. Your user account is not linked to
                one, so personal clock-in and history are unavailable.
                {canReadTeam
                  ? ' Switch to the Team live board tab to see who is working, or link your user to an employee in Employees.'
                  : ' Contact your administrator to link your user to an employee record.'}
              </p>
            </div>
          ) : (
            <>
              <AttendanceClockCard
                clockedIn={statusQuery.data?.clockedIn ?? false}
                session={statusQuery.data?.session ?? null}
                gpsEnabled={settingsQuery.data?.attendanceGpsEnabled ?? false}
                loading={clockInMutation.isPending || clockOutMutation.isPending}
                onClockIn={(withGps) => clockInMutation.mutate(withGps)}
                onClockOut={() => clockOutMutation.mutate()}
              />

              <div>
                <h2 className="mb-3 text-lg font-semibold text-slate-900">My history</h2>
                <AttendanceHistoryTable
                  logs={historyQuery.data?.logs ?? []}
                  loading={historyQuery.isLoading}
                  canCorrect={Boolean(canManage)}
                  onCorrect={setCorrectLog}
                />
                {(historyQuery.data?.total ?? 0) > (historyQuery.data?.limit ?? 20) && (
                  <div className="mt-4 flex justify-center gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
                      disabled={historyPage <= 1}
                      onClick={() => setHistoryPage((p) => p - 1)}
                    >
                      Previous
                    </button>
                    <span className="px-2 py-1 text-sm text-slate-600">Page {historyPage}</span>
                    <button
                      type="button"
                      className="rounded-lg border border-slate-200 px-3 py-1 text-sm disabled:opacity-50"
                      disabled={
                        historyPage * (historyQuery.data?.limit ?? 20) >=
                        (historyQuery.data?.total ?? 0)
                      }
                      onClick={() => setHistoryPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'team-live' && canReadTeam && (
        <AttendanceTeamBoard logs={teamLiveQuery.data ?? []} loading={teamLiveQuery.isLoading} />
      )}

      <AttendanceCorrectionModal
        open={Boolean(correctLog)}
        log={correctLog}
        loading={correctMutation.isPending}
        onClose={() => setCorrectLog(null)}
        onSubmit={(input) => {
          if (correctLog) {
            correctMutation.mutate({ id: correctLog.id, input });
          }
        }}
      />
    </PageContainer>
  );
};
