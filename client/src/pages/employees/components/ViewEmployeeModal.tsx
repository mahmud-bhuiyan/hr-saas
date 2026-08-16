import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  HiEnvelope,
  HiPencilSquare,
  HiUserGroup,
  HiUserPlus,
  HiXMark,
} from "react-icons/hi2";
import { toast } from "react-toastify";
import { Button } from "../../../components/ui/Button";
import { ConfirmModal } from "../../../components/ui/forms/ConfirmModal";
import { Modal } from "../../../components/ui/Modal";
import { Spinner } from "../../../components/ui/Spinner";
import {
  ApiError,
  createEmployeeLogin,
  fetchEmployee,
  fetchEmployeeReports,
  inviteEmployee,
} from "../../../lib/api";
import { isQueryInitialLoad } from "../../../utils/query";
import { DEFAULT_EMPLOYEE_LOGIN_PASSWORD, employeeName } from "../utils";
import { DirectReportsTable } from "./DirectReportsTable";
import { EmployeeProfileSummary } from "./EmployeeProfileSummary";
import { EmployeeStatusBadge } from "./EmployeeStatusBadge";

interface ViewEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  employeeId: string | null;
  onEdit?: (employeeId: string) => void;
  onViewEmployee?: (employeeId: string) => void;
  canUpdate: boolean;
  canInvite: boolean;
}

export const ViewEmployeeModal = ({
  open,
  onClose,
  employeeId,
  onEdit,
  onViewEmployee,
  canUpdate,
  canInvite,
}: ViewEmployeeModalProps) => {
  const queryClient = useQueryClient();
  const [createLoginOpen, setCreateLoginOpen] = useState(false);

  const employeeQuery = useQuery({
    queryKey: ["employees", employeeId],
    queryFn: () => fetchEmployee(employeeId!),
    enabled: Boolean(open && employeeId),
  });

  const reportsQuery = useQuery({
    queryKey: ["employees", employeeId, "reports"],
    queryFn: () => fetchEmployeeReports(employeeId!),
    enabled: Boolean(open && employeeId),
  });

  const invalidateEmployee = () => {
    void queryClient.invalidateQueries({ queryKey: ["employees", employeeId] });
    void queryClient.invalidateQueries({ queryKey: ["employees"] });
  };

  const inviteMutation = useMutation({
    mutationFn: () => inviteEmployee(employeeId!),
    onSuccess: () => {
      toast.success("Invite sent successfully");
      invalidateEmployee();
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "Invite failed");
    },
  });

  const createLoginMutation = useMutation({
    mutationFn: () => createEmployeeLogin(employeeId!),
    onSuccess: (result) => {
      setCreateLoginOpen(false);
      if (result.userCreated) {
        toast.success(
          `Login created. They can sign in with password ${DEFAULT_EMPLOYEE_LOGIN_PASSWORD}.`,
        );
      } else {
        toast.success(
          "Existing user linked. They can sign in with their current password.",
        );
      }
      invalidateEmployee();
    },
    onError: (err) => {
      toast.error(
        err instanceof ApiError ? err.message : "Create login failed",
      );
    },
  });

  const handleClose = () => {
    setCreateLoginOpen(false);
    onClose();
  };

  const employee = employeeQuery.data;
  const reportCount = reportsQuery.data?.length ?? 0;
  const showAccessActions = Boolean(
    canInvite && employee?.email && !employee.userId,
  );
  const showEdit = Boolean(canUpdate && onEdit && employeeId);
  const accessBusy = inviteMutation.isPending || createLoginMutation.isPending;

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        title={
          employee ? (
            <span className="flex flex-wrap items-center gap-2">
              {employeeName(employee)}
              <EmployeeStatusBadge status={employee.status} />
            </span>
          ) : (
            "Employee details"
          )
        }
        description={
          employee
            ? `${employee.jobTitle ?? "No job title"} · ${employee.employeeNumber}`
            : undefined
        }
        size="xl"
        headerActions={
          <>
            {showAccessActions && (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  loading={inviteMutation.isPending}
                  loadingText="Sending…"
                  disabled={accessBusy}
                  icon={<HiEnvelope className="h-4 w-4 text-brand-600" />}
                  onClick={() => inviteMutation.mutate()}
                >
                  Send invite
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={accessBusy}
                  icon={<HiUserPlus className="h-4 w-4 text-brand-600" />}
                  onClick={() => setCreateLoginOpen(true)}
                >
                  Create login
                </Button>
              </>
            )}
            {showEdit && (
              <Button
                type="button"
                icon={<HiPencilSquare className="h-4 w-4 text-white" />}
                onClick={() => onEdit!(employeeId!)}
              >
                Edit employee
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              display="icon"
              aria-label="Close"
              icon={
                <HiXMark className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              }
              onClick={handleClose}
            />
          </>
        }
      >
        {isQueryInitialLoad(employeeQuery) && (
          <div className="flex justify-center py-12">
            <Spinner className="h-6 w-6 text-brand-600" />
          </div>
        )}

        {employeeQuery.isError && (
          <p className="text-sm text-red-600">
            Failed to load employee details.
          </p>
        )}

        {employee && (
          <div className="space-y-6">
            <EmployeeProfileSummary employee={employee} showMetadata />

            <section className="card-surface overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <HiUserGroup className="h-4 w-4 text-brand-600" />
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Direct reports
                  </h3>
                </div>
                {!isQueryInitialLoad(reportsQuery) && (
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                    {reportCount}
                  </span>
                )}
              </div>
              <DirectReportsTable
                reports={reportsQuery.data ?? []}
                loading={isQueryInitialLoad(reportsQuery)}
                onViewEmployee={onViewEmployee}
                embedded
              />
            </section>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={createLoginOpen}
        onClose={() => setCreateLoginOpen(false)}
        onConfirm={() => createLoginMutation.mutate()}
        title="Create login"
        description={
          employee
            ? `Create a login for ${employeeName(employee)} so they can sign in immediately.`
            : undefined
        }
        confirmLabel="Create login"
        loading={createLoginMutation.isPending}
        loadingText="Creating…"
      >
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>Share these credentials with the employee:</p>
          <dl className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="flex justify-between gap-3">
              <dt className="font-medium text-slate-700 dark:text-slate-200">
                Email
              </dt>
              <dd className="text-right">{employee?.email ?? "—"}</dd>
            </div>
            <div className="mt-2 flex justify-between gap-3">
              <dt className="font-medium text-slate-700 dark:text-slate-200">
                Password
              </dt>
              <dd className="font-mono text-right">
                {DEFAULT_EMPLOYEE_LOGIN_PASSWORD}
              </dd>
            </div>
          </dl>
          <p>They can change the password later from their profile.</p>
        </div>
      </ConfirmModal>
    </>
  );
};
