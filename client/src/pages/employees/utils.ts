import type { Employee } from '../../types';

export type EmployeesTab = 'active' | 'inactive';

export const isActiveEmployee = (employee: Employee): boolean => employee.status !== 'terminated';

export const personName = (person: { firstName: string; lastName: string }): string => {
  return `${person.firstName} ${person.lastName}`;
}

export const employeeName = (employee: Employee): string => {
  return personName(employee);
}

export const formatDateTime = (iso: string): string => {
  return new Date(iso).toLocaleString();
}

export const statusLabel = (status: string): string => {
  return status.replace(/_/g, ' ');
}
