import type { RegistrationRequest } from '../../types';

export const adminDisplayName = (firstName?: string, lastName?: string): string => {
  if (firstName || lastName) {
    return [firstName, lastName].filter(Boolean).join(' ');
  }
  return '—';
}

export const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleString();
}

export const toEditForm = (row: RegistrationRequest): EditCompanyForm => {
  return {
    companyName: row.companyName,
    adminEmail: row.adminEmail,
    adminFirstName: row.adminFirstName ?? '',
    adminLastName: row.adminLastName ?? '',
  };
}

export type EditCompanyForm = {
  companyName: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
};

export const editFormKeys: Array<keyof EditCompanyForm> = [
  'companyName',
  'adminEmail',
  'adminFirstName',
  'adminLastName',
];

export type CompaniesTab = 'pending' | 'registered';

export const emptyCreateForm = {
  companyName: '',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
};
