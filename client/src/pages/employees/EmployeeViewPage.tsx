import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HiArrowLeft, HiEnvelope, HiPencilSquare, HiUserGroup } from 'react-icons/hi2';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Button } from '../../components/ui/Button';
import { PageContainer } from '../../components/ui/PageContainer';
import { PageHeader } from '../../components/layout/PageHeader';
import { Spinner } from '../../components/ui/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError, fetchEmployee, fetchEmployeeReports, inviteEmployee } from '../../lib/api';
import { hasPermission } from '../../utils/permissions';
import { DirectReportsTable } from './components/DirectReportsTable';
import { EmployeeProfileSummary } from './components/EmployeeProfileSummary';
import { EmployeeStatusBadge } from './components/EmployeeStatusBadge';
import { employeeName, employeeEditPath, employeeViewPath, EMPLOYEES_ACTIVE_PATH } from './utils';

export const EmployeeViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const canRead =
    user && (hasPermission(user.role, 'employee:read') || hasPermission(user.role, 'employee:read:team'));
  const canUpdate = user && hasPermission(user.role, 'employee:update');
  const canInvite = user && hasPermission(user.role, 'employee:create');
  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: () => inviteEmployee(id!),
    onSuccess: () => {
      toast.success('Invite sent successfully');
      void queryClient.invalidateQueries({ queryKey: ['employees', id] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : 'Invite failed');
    },
  });

  const employeeQuery = useQuery({
    queryKey: ['employees', id],
    queryFn: () => fetchEmployee(id!),
    enabled: Boolean(canRead && id),
  });

  const reportsQuery = useQuery({
    queryKey: ['employees', id, 'reports'],
    queryFn: () => fetchEmployeeReports(id!),
    enabled: Boolean(canRead && id),
  });

  if (!canRead) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!id) {
    return <Navigate to={EMPLOYEES_ACTIVE_PATH} replace />;
  }

  const employee = employeeQuery.data;
  const reportCount = reportsQuery.data?.length ?? 0;

  return (
    <PageContainer className="space-y-6">
      <div>
        <Link
          to={EMPLOYEES_ACTIVE_PATH}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          <HiArrowLeft className="h-4 w-4" />
          Back to employees
        </Link>
      </div>

      {employeeQuery.isLoading && (
        <div className="flex justify-center py-12">
          <Spinner className="h-6 w-6 text-brand-600" />
        </div>
      )}

      {employeeQuery.isError && (
        <p className="text-sm text-red-600">Failed to load employee details.</p>
      )}

      {employee && (
        <>
          <PageHeader
            label="People"
            title={
              <span className="flex flex-wrap items-center gap-2">
                {employeeName(employee)}
                <EmployeeStatusBadge status={employee.status} />
              </span>
            }
            description={`${employee.jobTitle ?? 'No job title'} · ${employee.employeeNumber}`}
            actionAlign="end"
            action={
              canUpdate || (canInvite && employee.email && !employee.userId) ? (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {canInvite && employee.email && !employee.userId && (
                    <Button
                      variant="secondary"
                      loading={inviteMutation.isPending}
                      loadingText="Sending…"
                      icon={<HiEnvelope className="h-4 w-4 text-brand-600" />}
                      onClick={() => inviteMutation.mutate()}
                    >
                      Send invite
                    </Button>
                  )}
                  {canUpdate && (
                    <Button
                      variant="secondary"
                      icon={<HiPencilSquare className="h-4 w-4 text-brand-600" />}
                      onClick={() => navigate(employeeEditPath(id!))}
                    >
                      Edit employee
                    </Button>
                  )}
                </div>
              ) : undefined
            }
          />

          <EmployeeProfileSummary employee={employee} showMetadata />

          <section className="card-surface overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <HiUserGroup className="h-4 w-4 text-brand-600" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Direct reports</h2>
              </div>
              {!reportsQuery.isLoading && (
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                  {reportCount}
                </span>
              )}
            </div>
            <DirectReportsTable
              reports={reportsQuery.data ?? []}
              loading={reportsQuery.isLoading}
              onViewEmployee={(employeeId) => navigate(employeeViewPath(employeeId))}
              embedded
            />
          </section>
        </>
      )}
    </PageContainer>
  );
};
