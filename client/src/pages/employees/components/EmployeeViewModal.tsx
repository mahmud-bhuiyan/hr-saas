import { useQuery } from '@tanstack/react-query';
import { HiUserGroup } from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Spinner } from '../../../components/ui/Spinner';
import { fetchEmployee, fetchEmployeeReports } from '../../../lib/api';
import { employeeName } from '../utils';
import { DirectReportsTable } from './DirectReportsTable';
import { EmployeeProfileSummary } from './EmployeeProfileSummary';
import { EmployeeStatusBadge } from './EmployeeStatusBadge';

interface EmployeeViewModalProps {
  employeeId: string | null;
  onClose: () => void;
  onViewEmployee?: (employeeId: string) => void;
}

export const EmployeeViewModal = ({ employeeId, onClose, onViewEmployee }: EmployeeViewModalProps) => {
  const employeeQuery = useQuery({
    queryKey: ['employees', employeeId],
    queryFn: () => fetchEmployee(employeeId!),
    enabled: Boolean(employeeId),
  });

  const reportsQuery = useQuery({
    queryKey: ['employees', employeeId, 'reports'],
    queryFn: () => fetchEmployeeReports(employeeId!),
    enabled: Boolean(employeeId),
  });

  const employee = employeeQuery.data;
  const reportCount = reportsQuery.data?.length ?? 0;

  return (
    <Modal
      open={Boolean(employeeId)}
      onClose={onClose}
      title={
        employee ? (
          <span className="flex flex-wrap items-center gap-2">
            {employeeName(employee)}
            <EmployeeStatusBadge status={employee.status} />
          </span>
        ) : (
          'Employee details'
        )
      }
      description={
        employee
          ? `${employee.jobTitle ?? 'No job title'} · ${employee.employeeNumber}`
          : undefined
      }
      footer={
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
      size="xl"
    >
      {employeeQuery.isLoading && (
        <div className="flex justify-center py-8">
          <Spinner className="h-6 w-6 text-brand-600" />
        </div>
      )}

      {employeeQuery.isError && (
        <p className="text-sm text-red-600">Failed to load employee details.</p>
      )}

      {employee && (
        <div className="space-y-5">
          <EmployeeProfileSummary employee={employee} showMetadata />

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-3">
              <div className="flex items-center gap-2">
                <HiUserGroup className="h-4 w-4 text-brand-600" />
                <h3 className="text-sm font-semibold text-slate-900">Direct reports</h3>
              </div>
              {!reportsQuery.isLoading && (
                <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                  {reportCount}
                </span>
              )}
            </div>
            <DirectReportsTable
              reports={reportsQuery.data ?? []}
              loading={reportsQuery.isLoading}
              onViewEmployee={onViewEmployee}
              embedded
            />
          </section>
        </div>
      )}
    </Modal>
  );
};
