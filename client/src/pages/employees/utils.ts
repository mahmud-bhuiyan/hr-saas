import type { Employee } from '../../types';

export const personName = (person: { firstName: string; lastName: string }): string => {
  return `${person.firstName} ${person.lastName}`;
}

export const employeeName = (employee: Employee): string => {
  return personName(employee);
}

export const statusLabel = (status: string): string => {
  return status.replace(/_/g, ' ');
}
