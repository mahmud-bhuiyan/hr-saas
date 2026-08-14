import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { PageContainer } from "../../../components/ui/PageContainer";
import { PageHeader } from "../../../components/layout/PageHeader";
import { TabGroup, type TabGroupItem } from "../../../components/ui/TabGroup";
import { useAuth } from "../../../contexts/AuthContext";
import { useMyAttendanceStatus } from "../../../hooks/useMyAttendanceStatus";
import { useTabUrlState } from "../../../hooks/useTabUrlState";
import {
  ApiError,
  clockIn,
  clockOut,
  fetchAttendanceSettings,
  fetchMyAttendance,
  fetchMyAttendanceCalendar,
  fetchTeamLiveAttendance,
  patchAttendanceLog,
} from "../../../lib/api";
import type { AttendanceLog, PatchAttendanceInput } from "../../../types";
import { hasPermission } from "../../../utils/permissions";
import "./attendance-keka.css";
import { AttendanceActionsCard } from "./components/AttendanceActionsCard";
import { AttendanceEmployeeCorrections } from "./components/AttendanceEmployeeCorrections";
import { AttendanceCorrectionModal } from "./components/AttendanceCorrectionModal";
import { AttendanceLogsSection } from "./components/AttendanceLogsSection";
import { AttendanceStatsCard } from "./components/AttendanceStatsCard";
import { AttendanceTeamBoard } from "./components/AttendanceTeamBoard";
import { AttendanceTimingsCard } from "./components/AttendanceTimingsCard";
import { MeTabs } from "../components/MeTabs";
import type {
  AttendanceDisplayMode,
  AttendanceLogsTab,
  AttendanceTab,
} from "./utils";
import { ATTENDANCE_24H_KEY, ATTENDANCE_TAB_IDS, todayDateString } from "./utils";

const TENANT_ATTENDANCE_ROLES = [
  "company_admin",
  "hr_manager",
  "manager",
  "employee",
] as const;

export const AttendancePage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const now = new Date();

  const { activeTab, setActiveTab } = useTabUrlState(ATTENDANCE_TAB_IDS, {
    defaultTab: "my-attendance",
  });
  const [logsTab, setLogsTab] = useState<AttendanceLogsTab>("attendance-log");
  const [displayMode, setDisplayMode] =
    useState<AttendanceDisplayMode>("calendar");
  const [historyPage, setHistoryPage] = useState(1);
  const [correctLog, setCorrectLog] = useState<AttendanceLog | null>(null);
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    todayDateString(),
  );
  const [use24Hour, setUse24Hour] = useState(
    () => localStorage.getItem(ATTENDANCE_24H_KEY) === "true",
  );

  useEffect(() => {
    localStorage.setItem(ATTENDANCE_24H_KEY, String(use24Hour));
  }, [use24Hour]);

  const canAccess =
    user &&
    TENANT_ATTENDANCE_ROLES.includes(
      user.role as (typeof TENANT_ATTENDANCE_ROLES)[number],
    );
  const canClock = user && hasPermission(user.role, "attendance:clock:own");
  const canReadTeam = user && hasPermission(user.role, "attendance:read:team");
  const canManage = user && hasPermission(user.role, "attendance:manage");

  const availableTabIds = useMemo(() => {
    const ids: AttendanceTab[] = [];
    if (canClock) {
      ids.push("my-attendance");
    }
    if (canReadTeam) {
      ids.push("team-live");
    }
    if (canManage) {
      ids.push("hr-corrections");
    }
    return ids;
  }, [canClock, canReadTeam, canManage]);

  const effectiveTab: AttendanceTab = availableTabIds.includes(
    activeTab as AttendanceTab,
  )
    ? (activeTab as AttendanceTab)
    : (availableTabIds[0] ?? "my-attendance");

  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const viewingCurrentMonth =
    calendarYear === currentYear && calendarMonth === currentMonth;

  const settingsQuery = useQuery({
    queryKey: ["attendance", "settings"],
    queryFn: fetchAttendanceSettings,
    enabled: Boolean(canClock),
  });

  const statusQuery = useMyAttendanceStatus();

  const calendarQuery = useQuery({
    queryKey: ["attendance", "me", "calendar", calendarYear, calendarMonth],
    queryFn: () => fetchMyAttendanceCalendar(calendarYear, calendarMonth),
    enabled: Boolean(canClock && effectiveTab === "my-attendance"),
    retry: false,
  });

  const currentMonthCalendarQuery = useQuery({
    queryKey: ["attendance", "me", "calendar", currentYear, currentMonth],
    queryFn: () => fetchMyAttendanceCalendar(currentYear, currentMonth),
    enabled: Boolean(
      canClock && effectiveTab === "my-attendance" && !viewingCurrentMonth,
    ),
    retry: false,
  });

  const statsCalendar = viewingCurrentMonth
    ? calendarQuery.data
    : currentMonthCalendarQuery.data;
  const statsLoading = viewingCurrentMonth
    ? calendarQuery.isLoading
    : currentMonthCalendarQuery.isLoading;

  const sessionCalendarDays = useMemo(
    () => statsCalendar?.days ?? calendarQuery.data?.days ?? [],
    [statsCalendar?.days, calendarQuery.data?.days],
  );

  const historyQuery = useQuery({
    queryKey: ["attendance", "me", historyPage],
    queryFn: () => fetchMyAttendance(historyPage),
    enabled: Boolean(
      canClock &&
      effectiveTab === "my-attendance" &&
      logsTab === "attendance-log" &&
      displayMode === "list",
    ),
    retry: false,
  });

  const teamLiveQuery = useQuery({
    queryKey: ["attendance", "team", "live"],
    queryFn: fetchTeamLiveAttendance,
    enabled: Boolean(canReadTeam && effectiveTab === "team-live"),
    refetchInterval: 30000,
  });

  const missingEmployeeLink =
    statusQuery.isError &&
    statusQuery.error instanceof ApiError &&
    statusQuery.error.status === 403 &&
    statusQuery.error.message.includes("No employee record linked");

  useEffect(() => {
    if (missingEmployeeLink && canReadTeam) {
      setActiveTab("team-live");
    }
  }, [missingEmployeeLink, canReadTeam, setActiveTab]);

  const clockInMutation = useMutation({
    mutationFn: ({
      method,
      withGps,
    }: {
      method: "kiosk" | "web";
      withGps: boolean;
    }) => {
      if (!withGps) {
        return clockIn({ method });
      }
      return new Promise<Awaited<ReturnType<typeof clockIn>>>(
        (resolve, reject) => {
          if (!navigator.geolocation) {
            reject(
              new ApiError("Geolocation is not supported by your browser", 400),
            );
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (position) => {
              clockIn({
                method,
                location: {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                },
              })
                .then(resolve)
                .catch(reject);
            },
            () => reject(new ApiError("Unable to retrieve your location", 400)),
          );
        },
      );
    },
    onSuccess: () => {
      toast.success("Clocked in successfully");
      void queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to clock in",
      );
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: clockOut,
    onSuccess: () => {
      toast.success("Clocked out successfully");
      void queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to clock out",
      );
    },
  });

  const correctMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: PatchAttendanceInput }) =>
      patchAttendanceLog(id, input),
    onSuccess: () => {
      toast.success("Attendance record updated");
      setCorrectLog(null);
      void queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof ApiError ? error.message : "Failed to update record",
      );
    },
  });

  const handleMonthSelect = (year: number, month: number): void => {
    setCalendarYear(year);
    setCalendarMonth(month);
    setSelectedDate(null);
  };

  if (!canAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  const clockedIn = statusQuery.data?.clockedIn ?? false;
  const session = statusQuery.data?.session ?? null;
  const clockLoading = clockInMutation.isPending || clockOutMutation.isPending;

  const myAttendanceContent = canClock ? (
    <div className="keka-attendance space-y-5">
      {missingEmployeeLink ? (
        <div className="rounded-lg border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
          <p className="font-medium">No employee profile linked to your account</p>
          <p className="mt-1 keka-muted">
            Attendance is recorded against employee records. Your user account is not linked to one,
            so personal clock-in and history are unavailable.
            {canReadTeam
              ? " Switch to the Team live board tab to see who is working, or link your user to an employee in Employees."
              : " Contact your administrator to link your user to an employee record."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-3">
            <AttendanceStatsCard
              summary={statsCalendar?.summary}
              canReadTeam={Boolean(canReadTeam)}
              loading={statsLoading}
            />
            <AttendanceTimingsCard
              session={session}
              clockedIn={clockedIn}
              calendarDays={sessionCalendarDays}
              use24Hour={use24Hour}
            />
            <AttendanceActionsCard
              clockedIn={clockedIn}
              session={session}
              gpsEnabled={settingsQuery.data?.attendanceGpsEnabled ?? false}
              loading={clockLoading}
              use24Hour={use24Hour}
              onClockIn={(params) => clockInMutation.mutate(params)}
              onClockOut={() => clockOutMutation.mutate()}
            />
          </div>

          <AttendanceLogsSection
            logsTab={logsTab}
            onLogsTabChange={setLogsTab}
            displayMode={displayMode}
            onDisplayModeChange={setDisplayMode}
            use24Hour={use24Hour}
            onUse24HourChange={setUse24Hour}
            calendarYear={calendarYear}
            calendarMonth={calendarMonth}
            calendarDays={calendarQuery.data?.days ?? []}
            calendarLoading={calendarQuery.isLoading}
            selectedDate={selectedDate}
            onMonthSelect={handleMonthSelect}
            onDaySelect={setSelectedDate}
            historyLogs={historyQuery.data?.logs ?? []}
            historyLoading={historyQuery.isLoading}
            historyPage={historyPage}
            historyTotal={historyQuery.data?.total ?? 0}
            historyLimit={historyQuery.data?.limit ?? 20}
            onHistoryPageChange={setHistoryPage}
            canCorrect={Boolean(canManage)}
            onCorrect={setCorrectLog}
          />
        </>
      )}
    </div>
  ) : null;

  const attendanceTabs: TabGroupItem<AttendanceTab>[] = [];

  if (canClock) {
    attendanceTabs.push({
      id: "my-attendance",
      label: "My attendance",
      content: myAttendanceContent,
    });
  }

  if (canReadTeam) {
    attendanceTabs.push({
      id: "team-live",
      label: "Team live board",
      content: (
        <AttendanceTeamBoard
          logs={teamLiveQuery.data ?? []}
          loading={teamLiveQuery.isLoading}
        />
      ),
    });
  }

  if (canManage) {
    attendanceTabs.push({
      id: "hr-corrections",
      label: "HR corrections",
      content: <AttendanceEmployeeCorrections onCorrect={setCorrectLog} />,
    });
  }

  return (
    <PageContainer>
      <MeTabs />
      <PageHeader
        label="Operations"
        title="Attendance"
        description={
          canReadTeam
            ? "Clock in and out, view history, and see who is working now."
            : "Clock in and out and view your attendance history."
        }
      />

      {attendanceTabs.length > 1 ? (
        <TabGroup<AttendanceTab>
          activeId={effectiveTab}
          onChange={setActiveTab}
          tabs={attendanceTabs}
        />
      ) : (
        attendanceTabs[0]?.content
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
