import type { UserRole } from '../types';

export const PERMISSIONS: Record<UserRole, string[]> = {
  super_admin: ['*'],
  company_admin: ['*'],
  hr_manager: [
    'employee:create',
    'employee:read',
    'employee:update',
    'document:manage',
    'leave:approve',
    'leave:create:own',
    'leave:read:own',
  ],
  manager: ['leave:approve:team', 'leave:create:own', 'leave:read:own', 'employee:read:team'],
  employee: ['leave:create:own', 'leave:read:own', 'document:read:own', 'profile:update:own'],
};

export const hasPermission = (role: UserRole, permission: string): boolean => {
  const rolePermissions = PERMISSIONS[role];
  if (rolePermissions.includes('*')) return true;
  return rolePermissions.includes(permission);
}
