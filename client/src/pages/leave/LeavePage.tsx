import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { HiPlus } from "react-icons/hi2";
import { toast } from "react-toastify";
import { Button } from "../../components/ui/Button";
import { PageContainer } from "../../components/ui/PageContainer";
import { PageHeader } from "../../components/ui/PageHeader";
import { Tabs } from "../../components/ui/Tabs";
import { useAuth } from "../../contexts/AuthContext";
import {
  ApiError,
  approveLeaveRequest,
  cancelLeaveRequest,
  createLeaveRequest,
  declineLeaveRequest,
  fetchLeaveCalendar,
  fetchLeaveRequests,
  fetchLeaveSettings,
  fetchMyLeaveBalance,
} from "../../lib/api";
import type { CreateLeaveRequestInput } from "../../types";
import { areRequiredFieldsFilled } from "../../utils/form";
import { hasPermission } from "../../utils/permissions";
import { LeaveApprovalQueue } from "./components/LeaveApprovalQueue";
import { EmployeeLeaveList } from "./components/EmployeeLeaveList";
import { LeaveBalanceSummary } from "./components/LeaveBalanceSummary";
import { LeaveCalendar } from "./components/LeaveCalendar";
import { LeaveRequestModal } from "./components/LeaveRequestModal";
import { LeaveRequestsTable } from "./components/LeaveRequestsTable";
import { emptyLeaveForm, type LeaveTab } from "./utils";

import { MeTabs } from "../../components/MeTabs";

const TENANT_LEAVE_ROLES = [
  "company_admin",
  "hr_manager",
  "manager",
  "employee",
] as const;

export const LeavePage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const now = new Date();
  const [activeTab, setActiveTab] = useState<LeaveTab>("my-leave");
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] =
    useState<CreateLeaveRequestInput>(emptyLeaveForm);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth() + 1);

  const canAccess =
    user &&
    TENANT_LEAVE_ROLES.includes(
      user.role as (typeof TENANT_LEAVE_ROLES)[number],
    );
  const canCreate = user && hasPermission(user.role, "leave:create:own");
  const canApprove =
    user &&
    (hasPermission(user.role, "leave:approve") ||
      hasPermission(user.role, "leave:approve:team"));
  const canApproveAll = user && hasPermission(user.role, "leave:approve");
  const canViewCalendar = canApprove;

  const balanceQuery = useQuery({
    queryKey: ["leave", "balance", "me"],
    queryFn: fetchMyLeaveBalance,
    enabled: Boolean(canCreate),
    retry: false,
  });

  const missingEmployeeLink =
    balanceQuery.isError &&
    balanceQuery.error instanceof ApiError &&
    balanceQuery.error.status === 403;

  const myRequestsQuery = useQuery({
    queryKey: ["leave", "requests", "mine"],
    queryFn: () => fetchLeaveRequests({ mine: true }),
    enabled: Boolean(canCreate),
  });

  const pendingQuery = useQuery({
    queryKey: ["leave", "requests", "pending"],
    queryFn: () => fetchLeaveRequests({ status: "pending" }),
    enabled: Boolean(canApprove),
  });

  const leaveSettingsQuery = useQuery({
    queryKey: ["leave", "settings"],
    queryFn: fetchLeaveSettings,
    enabled: Boolean(canApprove),
  });

  const employeeLeaveQuery = useQuery({
    queryKey: ["leave", "requests", "employees"],
    queryFn: () => fetchLeaveRequests(),
    enabled: Boolean(canApprove && activeTab === "employee-leave"),
  });

  const calendarQuery = useQuery({
    queryKey: ["leave", "calendar", calendarYear, calendarMonth],
    queryFn: () => fetchLeaveCalendar(calendarYear, calendarMonth),
    enabled: Boolean(canViewCalendar && activeTab === "calendar"),
  });

  const invalidateLeave = () => {
    void queryClient.invalidateQueries({ queryKey: ["leave"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard", "leave"] });
  };

  const createMutation = useMutation({
    mutationFn: createLeaveRequest,
    onSuccess: () => {
      setCreateOpen(false);
      setCreateForm(emptyLeaveForm);
      toast.success("Leave request submitted.");
      invalidateLeave();
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Failed to submit leave request",
      );
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelLeaveRequest,
    onSuccess: () => {
      toast.success("Leave request cancelled.");
      setActionLoadingId(null);
      invalidateLeave();
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to cancel request",
      );
      setActionLoadingId(null);
    },
  });

  const approveMutation = useMutation({
    mutationFn: approveLeaveRequest,
    onSuccess: (request) => {
      if (request.status === "pending" && request.approvalStep === 2) {
        toast.success("Step 1 approved — awaiting HR final approval.");
      } else {
        toast.success("Leave request approved.");
      }
      setActionLoadingId(null);
      invalidateLeave();
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to approve request",
      );
      setActionLoadingId(null);
    },
  });

  const declineMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      declineLeaveRequest(id, reason),
    onSuccess: () => {
      toast.success("Leave request declined.");
      setActionLoadingId(null);
      invalidateLeave();
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to decline request",
      );
      setActionLoadingId(null);
    },
  });

  const createRequiredFields = useMemo(
    () => ({
      type: createForm.type,
      startDate: createForm.startDate,
      endDate: createForm.endDate,
      reason: createForm.reason,
    }),
    [createForm],
  );

  const createSubmitDisabled = !areRequiredFieldsFilled(createRequiredFields, [
    "type",
    "startDate",
    "endDate",
    "reason",
  ]);

  const handleCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate({
      ...createForm,
      reason: createForm.reason.trim(),
    });
  };

  const tabs = useMemo(() => {
    const items: Array<{ id: LeaveTab; label: string }> = [];

    if (canCreate) {
      items.push({ id: "my-leave", label: "My leave" });
    }

    if (canApprove) {
      items.push({
        id: "employee-leave",
        label: canApproveAll ? "Employee leave" : "Team leave",
      });
      items.push({ id: "approvals", label: "Approvals" });
    }

    if (canViewCalendar) {
      items.push({ id: "calendar", label: "Team calendar" });
    }

    return items;
  }, [canCreate, canApprove, canApproveAll, canViewCalendar]);

  if (!canAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  if (tabs.length === 0) {
    return <Navigate to="/dashboard" replace />;
  }

  const effectiveTab = tabs.some((t) => t.id === activeTab)
    ? activeTab
    : tabs[0].id;

  return (
    <PageContainer>
      <MeTabs />
      <PageHeader
        label="Leave"
        title="Leave & absence"
        description="Request time off, review approvals, and view the team calendar."
        actionAlign="end"
        action={
          canCreate && !missingEmployeeLink && effectiveTab === "my-leave" ? (
            <Button
              icon={<HiPlus className="h-4 w-4 text-white" />}
              onClick={() => setCreateOpen(true)}
            >
              Request leave
            </Button>
          ) : undefined
        }
      />

      {tabs.length > 1 && (
        <Tabs
          tabs={tabs.map((t) => ({ id: t.id, label: t.label }))}
          activeId={effectiveTab}
          onChange={(id) => setActiveTab(id as LeaveTab)}
          className="mb-6"
        />
      )}

      {effectiveTab === "my-leave" && canCreate && (
        <div className="space-y-6">
          <LeaveBalanceSummary
            balance={balanceQuery.data}
            loading={balanceQuery.isLoading}
            missingEmployeeLink={missingEmployeeLink}
          />
          <div>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              My requests
            </h2>
            <LeaveRequestsTable
              requests={myRequestsQuery.data ?? []}
              loading={myRequestsQuery.isLoading}
              onCancel={(request) => {
                setActionLoadingId(request.id);
                cancelMutation.mutate(request.id);
              }}
              cancelLoadingId={
                cancelMutation.isPending ? actionLoadingId : null
              }
            />
          </div>
        </div>
      )}

      {effectiveTab === "employee-leave" && canApprove && (
        <EmployeeLeaveList
          requests={employeeLeaveQuery.data ?? []}
          loading={employeeLeaveQuery.isLoading}
          title={canApproveAll ? "Employee leave" : "Team leave"}
          description={
            canApproveAll
              ? "All leave requests across your organization. Overlapping dates are highlighted so you can compare urgency before approving."
              : "Leave requests for your direct reports. Overlapping dates are highlighted to help you decide who should be off."
          }
        />
      )}

      {effectiveTab === "approvals" && canApprove && (
        <LeaveApprovalQueue
          requests={pendingQuery.data ?? []}
          loading={pendingQuery.isLoading}
          multiStepApprovalEnabled={
            leaveSettingsQuery.data?.multiStepApprovalEnabled ?? false
          }
          actionLoadingId={actionLoadingId}
          onApprove={(request) => {
            setActionLoadingId(request.id);
            approveMutation.mutate(request.id);
          }}
          onDecline={(request, reason) => {
            setActionLoadingId(request.id);
            declineMutation.mutate({ id: request.id, reason });
          }}
        />
      )}

      {effectiveTab === "calendar" && canViewCalendar && (
        <LeaveCalendar
          year={calendarYear}
          month={calendarMonth}
          entries={calendarQuery.data ?? []}
          loading={calendarQuery.isLoading}
          onMonthChange={(year, month) => {
            setCalendarYear(year);
            setCalendarMonth(month);
          }}
        />
      )}

      <LeaveRequestModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        form={createForm}
        onFormChange={setCreateForm}
        loading={createMutation.isPending}
        submitDisabled={createSubmitDisabled}
      />
    </PageContainer>
  );
};
