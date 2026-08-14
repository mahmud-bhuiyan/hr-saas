import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { HiMagnifyingGlass, HiUser } from 'react-icons/hi2';
import { FormField } from '../../../../components/ui/FormField';
import { Input } from '../../../../components/ui/Input';
import { Select } from '../../../../components/ui/Select';
import { fetchEmployeeAttendance, fetchEmployees } from '../../../../lib/api';
import type { AttendanceLog } from '../../../../types';
import { isQueryInitialLoad } from '../../../../utils/query';
import { AttendanceHistoryTable } from './AttendanceHistoryTable';

interface AttendanceEmployeeCorrectionsProps {
  onCorrect: (log: AttendanceLog) => void;
}

export const AttendanceEmployeeCorrections = ({ onCorrect }: AttendanceEmployeeCorrectionsProps) => {
  const [employeeId, setEmployeeId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const employeesQuery = useQuery({
    queryKey: ['employees', 'attendance-corrections', search],
    queryFn: () => fetchEmployees({ status: 'active', search: search || undefined }),
  });

  const historyQuery = useQuery({
    queryKey: ['attendance', 'employee', employeeId, page],
    queryFn: () => fetchEmployeeAttendance(employeeId, page),
    enabled: Boolean(employeeId),
  });

  const employees = employeesQuery.data ?? [];
  const selectedEmployee = employees.find((employee) => employee.id === employeeId);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Search employees">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name or email"
            icon={<HiMagnifyingGlass className="h-4 w-4 text-brand-600" />}
          />
        </FormField>

        <FormField label="Employee">
          <Select
            value={employeeId}
            onChange={(event) => {
              setEmployeeId(event.target.value);
              setPage(1);
            }}
            icon={<HiUser className="h-4 w-4 text-brand-600" />}
          >
            <option value="">Select an employee…</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {[employee.firstName, employee.lastName].filter(Boolean).join(' ')}
                {employee.email ? ` (${employee.email})` : ''}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      {!employeeId ? (
        <p className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300">
          Select an employee to view attendance history and correct missed punches.
        </p>
      ) : (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
            {selectedEmployee
              ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`.trim()
              : 'Employee'}{' '}
            history
          </h2>
          <AttendanceHistoryTable
            logs={historyQuery.data?.logs ?? []}
            loading={isQueryInitialLoad(historyQuery)}
            canCorrect
            onCorrect={onCorrect}
          />
          {(historyQuery.data?.total ?? 0) > (historyQuery.data?.limit ?? 20) && (
            <div className="mt-4 flex justify-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-1 text-sm disabled:opacity-50 dark:border-slate-700"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </button>
              <span className="px-2 py-1 text-sm text-slate-600 dark:text-slate-400">Page {page}</span>
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-3 py-1 text-sm disabled:opacity-50 dark:border-slate-700"
                disabled={
                  page * (historyQuery.data?.limit ?? 20) >= (historyQuery.data?.total ?? 0)
                }
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
