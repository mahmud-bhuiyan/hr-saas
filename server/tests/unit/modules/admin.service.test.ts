import { beforeEach, describe, expect, it } from 'vitest';
import {
  countSuperAdmins,
  createAdmin,
  hasSuperAdmin,
} from '../../../src/modules/admin/admin.service.js';
import { User } from '../../../src/modules/admin/user.model.js';
import { useTestDatabase } from '../../helpers/db.js';

describe('hasSuperAdmin', () => {
  useTestDatabase();

  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('returns false when no super_admin exists', async () => {
    expect(await hasSuperAdmin()).toBe(false);
    expect(await countSuperAdmins()).toBe(0);
  });

  it('returns true after a super_admin is created', async () => {
    await createAdmin({
      email: 'superadmin@hr.com',
      password: 'User@123',
      role: 'super_admin',
    });

    expect(await hasSuperAdmin()).toBe(true);
    expect(await countSuperAdmins()).toBe(1);
  });

  it('returns true when only a non-seed super_admin exists', async () => {
    await createAdmin({
      email: 'other-super@hr.com',
      password: 'User@123',
      role: 'super_admin',
    });

    expect(await hasSuperAdmin()).toBe(true);
  });

  it('returns false when only non-super_admin users exist', async () => {
    await User.create({
      email: 'admin@acme.com',
      passwordHash: 'hash',
      role: 'company_admin',
      isActive: true,
    });

    expect(await hasSuperAdmin()).toBe(false);
  });
});
