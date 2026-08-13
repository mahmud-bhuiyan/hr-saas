import type { Employee } from '../../types';

export type EmployeesTab = 'active' | 'inactive';

export const EMPLOYEES_TAB_IDS = ['active', 'inactive'] as const satisfies readonly EmployeesTab[];

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

export const employeeMatchesSearch = (employee: Employee, search: string): boolean => {
  const trimmed = search.trim();
  if (!trimmed) {
    return true;
  }

  const fields = [
    employee.firstName,
    employee.lastName,
    employee.email,
    employee.phone,
    employee.jobTitle,
    employee.department,
    employee.employeeNumber,
    employeeName(employee),
    `${employee.lastName} ${employee.firstName}`,
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => value.toLowerCase());

  const needle = trimmed.toLowerCase();

  if (needle.includes('@') || !/\s/.test(trimmed)) {
    return fields.some((field) => field.includes(needle));
  }

  const terms = needle.split(/\s+/).filter(Boolean);
  return terms.every((term) => fields.some((field) => field.includes(term)));
};
