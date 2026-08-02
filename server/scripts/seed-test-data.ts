import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectToDatabase, disconnectFromDatabase } from '../src/config/db.js';
import { createAdmin, findUserByEmail, hasSuperAdmin } from '../src/modules/admin/admin.service.js';
import { createCompany } from '../src/modules/admin/registration.service.js';
import { User } from '../src/modules/admin/user.model.js';
import { Tenant } from '../src/modules/auth/tenant.model.js';
import { Employee } from '../src/modules/employees/employee.model.js';
import { createEmployee } from '../src/modules/employees/employee.service.js';
import type { UserRole } from '../src/types/index.js';
import { hashPassword } from '../src/utils/password.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

/** Matches docs/postman/hr-saas.postman_collection.json test credentials. */
export const TEST_PASSWORD = 'User@123';

const SUPER_ADMIN = {
  email: 'superadmin@hr.com',
  firstName: 'Super',
  lastName: 'Admin',
};

const ACME_ADMIN = {
  companyName: 'Acme Ltd',
  email: 'admin@acme.com',
  firstName: 'Jane',
  lastName: 'Admin',
};

interface TestEmployeeSeed {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  startDate: string;
  role: UserRole;
}

const TEST_EMPLOYEES: TestEmployeeSeed[] = [
  {
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@acme.com',
    jobTitle: 'Software Engineer',
    department: 'Engineering',
    startDate: '2024-03-01',
    role: 'employee',
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@acme.com',
    jobTitle: 'Software Engineer',
    department: 'Engineering',
    startDate: '2024-01-15',
    role: 'employee',
  },
  {
    firstName: 'HR',
    lastName: 'Manager',
    email: 'hr@acme.com',
    jobTitle: 'HR Manager',
    department: 'Human Resources',
    startDate: '2024-01-01',
    role: 'hr_manager',
  },
];

const ensureSuperAdmin = async (): Promise<string> => {
  if (!(await hasSuperAdmin())) {
    const admin = await createAdmin({
      email: SUPER_ADMIN.email,
      password: TEST_PASSWORD,
      role: 'super_admin',
      firstName: SUPER_ADMIN.firstName,
      lastName: SUPER_ADMIN.lastName,
    });
    console.log(`Super admin created: ${admin.email}`);
    return admin.id;
  }

  const existing = await findUserByEmail(SUPER_ADMIN.email);
  if (existing) {
    existing.passwordHash = await hashPassword(TEST_PASSWORD);
    await existing.save();
    console.log(`Super admin password reset: ${existing.email}`);
    return existing._id.toString();
  }

  const anySuperAdmin = await User.findOne({ role: 'super_admin' }).select('+passwordHash');
  if (!anySuperAdmin) {
    throw new Error('Super admin flag set but no super_admin user found');
  }

  anySuperAdmin.passwordHash = await hashPassword(TEST_PASSWORD);
  await anySuperAdmin.save();
  console.log(`Super admin password reset: ${anySuperAdmin.email}`);
  return anySuperAdmin._id.toString();
};

const ensureAcmeCompany = async (superAdminId: string): Promise<{ tenantId: string; adminUserId: string }> => {
  const existingAdmin = await findUserByEmail(ACME_ADMIN.email);

  if (existingAdmin?.tenantId) {
    existingAdmin.passwordHash = await hashPassword(TEST_PASSWORD);
    await existingAdmin.save();

    const tenant = await Tenant.findById(existingAdmin.tenantId);
    if (tenant) {
      tenant.approvalStatus = 'approved';
      tenant.isActive = true;
      tenant.approvedAt = tenant.approvedAt ?? new Date();
      await tenant.save();
    }

    console.log(`Company admin password reset: ${existingAdmin.email}`);
    return {
      tenantId: existingAdmin.tenantId.toString(),
      adminUserId: existingAdmin._id.toString(),
    };
  }

  const registration = await createCompany(
    {
      companyName: ACME_ADMIN.companyName,
      email: ACME_ADMIN.email,
      password: TEST_PASSWORD,
      firstName: ACME_ADMIN.firstName,
      lastName: ACME_ADMIN.lastName,
    },
    superAdminId
  );

  const admin = await findUserByEmail(ACME_ADMIN.email);
  if (!admin) {
    throw new Error('Failed to create Acme company admin');
  }

  console.log(`Company created: ${registration.companyName} (${registration.tenantId})`);
  return {
    tenantId: registration.tenantId,
    adminUserId: admin._id.toString(),
  };
};

const ensureEmployeeRecord = async (
  tenantId: string,
  seed: TestEmployeeSeed,
  adminUserId: string
): Promise<void> => {
  const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
  const normalizedEmail = seed.email.toLowerCase();

  let employee = await Employee.findOne({
    tenantId: tenantObjectId,
    email: normalizedEmail,
  });

  if (!employee) {
    await createEmployee(
      tenantId,
      {
        firstName: seed.firstName,
        lastName: seed.lastName,
        email: normalizedEmail,
        jobTitle: seed.jobTitle,
        department: seed.department,
        startDate: seed.startDate,
      },
      adminUserId
    );

    employee = await Employee.findOne({
      tenantId: tenantObjectId,
      email: normalizedEmail,
    });
  }

  if (!employee) {
    throw new Error(`Failed to create employee record for ${seed.email}`);
  }

  let user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

  if (!user) {
    const passwordHash = await hashPassword(TEST_PASSWORD);
    user = await User.create({
      email: normalizedEmail,
      passwordHash,
      role: seed.role,
      tenantId: tenantObjectId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      isActive: true,
    });
    console.log(`Login user created: ${user.email} (${seed.role})`);
  } else {
    user.passwordHash = await hashPassword(TEST_PASSWORD);
    user.role = seed.role;
    user.isActive = true;
    await user.save();
    console.log(`Login user password reset: ${user.email} (${seed.role})`);
  }

  if (!employee.userId) {
    employee.userId = user._id;
    employee.updatedBy = new mongoose.Types.ObjectId(adminUserId);
    await employee.save();
    console.log(`Employee linked to login: ${employee.email}`);
  }
};

const seedTestData = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  await connectToDatabase(uri);

  try {
    const superAdminId = await ensureSuperAdmin();
    const { tenantId, adminUserId } = await ensureAcmeCompany(superAdminId);

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      throw new Error('Acme tenant not found after seed');
    }

    for (const seed of TEST_EMPLOYEES) {
      await ensureEmployeeRecord(tenantId, seed, adminUserId);
    }

    console.log('');
    console.log('Test data ready. All accounts use password:', TEST_PASSWORD);
    console.log('  super_admin   -> superadmin@hr.com');
    console.log('  company_admin -> admin@acme.com');
    console.log('  hr_manager    -> hr@acme.com');
    console.log('  employee      -> alex.morgan@acme.com, jane.smith@acme.com');
    console.log('');
    console.log('Use Auth > Login (Employee) in docs/postman/hr-saas.postman_collection.json');
  } finally {
    await disconnectFromDatabase();
  }
};

seedTestData().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
