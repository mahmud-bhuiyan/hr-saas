import type { UserRole } from '../types/index.js';

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
    'audit:read',
    'notification:read:own',
    'attendance:clock:own',
    'attendance:read:own',
    'attendance:read:team',
    'attendance:manage',
  ],
  manager: [
    'leave:approve:team',
    'leave:create:own',
    'leave:read:own',
    'employee:read:team',
    'notification:read:own',
    'attendance:clock:own',
    'attendance:read:own',
    'attendance:read:team',
  ],
  employee: [
    'leave:create:own',
    'leave:read:own',
    'document:read:own',
    'profile:update:own',
    'notification:read:own',
    'attendance:clock:own',
    'attendance:read:own',
  ],
};

export const hasPermission = (role: UserRole, permission: string): boolean => {
  const rolePermissions = PERMISSIONS[role];
  if (rolePermissions.includes('*')) return true;
  return rolePermissions.includes(permission);
}
