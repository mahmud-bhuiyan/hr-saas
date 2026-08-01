import { describe, expect, it } from 'vitest';
import { hasPermission, PERMISSIONS } from '../../../src/utils/permissions.js';

describe('hasPermission', () => {
  it('grants all permissions to company_admin via wildcard', () => {
    expect(hasPermission('company_admin', 'anything:here')).toBe(true);
  });

  it('grants all permissions to super_admin via wildcard', () => {
    expect(hasPermission('super_admin', 'employee:delete')).toBe(true);
  });

  it('grants explicit permission to hr_manager', () => {
    expect(hasPermission('hr_manager', 'employee:create')).toBe(true);
  });

  it('denies permission not in hr_manager list', () => {
    expect(hasPermission('hr_manager', 'leave:create:own')).toBe(false);
  });

  it('grants team-scoped permission to manager', () => {
    expect(hasPermission('manager', 'leave:approve:team')).toBe(true);
  });

  it('grants own-scoped permission to employee', () => {
    expect(hasPermission('employee', 'leave:create:own')).toBe(true);
  });

  it('denies admin permission to employee', () => {
    expect(hasPermission('employee', 'employee:create')).toBe(false);
  });
});

describe('PERMISSIONS', () => {
  it('defines permissions for every role', () => {
    const roles = ['super_admin', 'company_admin', 'hr_manager', 'manager', 'employee'] as const;
    for (const role of roles) {
      expect(PERMISSIONS[role].length).toBeGreaterThan(0);
    }
  });
});
