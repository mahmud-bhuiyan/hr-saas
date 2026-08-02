import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectToDatabase, disconnectFromDatabase } from '../src/config/db.js';
import { Tenant } from '../src/modules/auth/tenant.model.js';
import { User } from '../src/modules/admin/user.model.js';
import { Employee } from '../src/modules/employees/employee.model.js';
import type { UserRole } from '../src/types/index.js';
import { hashPassword } from '../src/utils/password.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const DEMO_PASSWORD = 'User@123';
const DEMO_COUNT = 20;

type DemoEmployeeSeed = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  startDate: string;
  managerIndex?: number;
  /** Login role — managers/HR get approval + team calendar access. Defaults to employee. */
  role?: UserRole;
};

const DEMO_EMPLOYEES: DemoEmployeeSeed[] = [
  {
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'alex.morgan@demo.com',
    phone: '+1 555-0101',
    jobTitle: 'Engineering Manager',
    department: 'Engineering',
    startDate: '2022-01-15',
    role: 'manager',
  },
  {
    firstName: 'Jordan',
    lastName: 'Lee',
    email: 'jordan.lee@demo.com',
    phone: '+1 555-0102',
    jobTitle: 'Sales Manager',
    department: 'Sales',
    startDate: '2022-02-01',
    role: 'manager',
  },
  {
    firstName: 'Taylor',
    lastName: 'Brooks',
    email: 'taylor.brooks@demo.com',
    phone: '+1 555-0103',
    jobTitle: 'HR Manager',
    department: 'Human Resources',
    startDate: '2022-03-10',
    role: 'hr_manager',
  },
  {
    firstName: 'Morgan',
    lastName: 'Chen',
    email: 'morgan.chen@demo.com',
    phone: '+1 555-0104',
    jobTitle: 'Finance Manager',
    department: 'Finance',
    startDate: '2022-04-05',
    role: 'manager',
  },
  {
    firstName: 'Jamie',
    lastName: 'Rivera',
    email: 'jamie.rivera@demo.com',
    phone: '+1 555-0105',
    jobTitle: 'Software Engineer',
    department: 'Engineering',
    startDate: '2023-01-20',
    managerIndex: 0,
  },
  {
    firstName: 'Casey',
    lastName: 'Kim',
    email: 'casey.kim@demo.com',
    phone: '+1 555-0106',
    jobTitle: 'Software Engineer',
    department: 'Engineering',
    startDate: '2023-02-14',
    managerIndex: 0,
  },
  {
    firstName: 'Riley',
    lastName: 'Patel',
    email: 'riley.patel@demo.com',
    phone: '+1 555-0107',
    jobTitle: 'QA Engineer',
    department: 'Engineering',
    startDate: '2023-03-01',
    managerIndex: 0,
  },
  {
    firstName: 'Avery',
    lastName: 'Nguyen',
    email: 'avery.nguyen@demo.com',
    phone: '+1 555-0108',
    jobTitle: 'DevOps Engineer',
    department: 'Engineering',
    startDate: '2023-04-18',
    managerIndex: 0,
  },
  {
    firstName: 'Quinn',
    lastName: "O'Brien",
    email: 'quinn.obrien@demo.com',
    phone: '+1 555-0109',
    jobTitle: 'Frontend Developer',
    department: 'Engineering',
    startDate: '2023-05-22',
    managerIndex: 0,
  },
  {
    firstName: 'Blake',
    lastName: 'Santos',
    email: 'blake.santos@demo.com',
    phone: '+1 555-0110',
    jobTitle: 'Backend Developer',
    department: 'Engineering',
    startDate: '2023-06-30',
    managerIndex: 0,
  },
  {
    firstName: 'Drew',
    lastName: 'Anderson',
    email: 'drew.anderson@demo.com',
    phone: '+1 555-0111',
    jobTitle: 'Account Executive',
    department: 'Sales',
    startDate: '2023-01-10',
    managerIndex: 1,
  },
  {
    firstName: 'Cameron',
    lastName: 'Wright',
    email: 'cameron.wright@demo.com',
    phone: '+1 555-0112',
    jobTitle: 'Account Executive',
    department: 'Sales',
    startDate: '2023-02-28',
    managerIndex: 1,
  },
  {
    firstName: 'Parker',
    lastName: 'Evans',
    email: 'parker.evans@demo.com',
    phone: '+1 555-0113',
    jobTitle: 'Sales Coordinator',
    department: 'Sales',
    startDate: '2023-07-15',
    managerIndex: 1,
  },
  {
    firstName: 'Reese',
    lastName: 'Taylor',
    email: 'reese.taylor@demo.com',
    phone: '+1 555-0114',
    jobTitle: 'Business Development Rep',
    department: 'Sales',
    startDate: '2023-08-01',
    managerIndex: 1,
  },
  {
    firstName: 'Skyler',
    lastName: 'Moore',
    email: 'skyler.moore@demo.com',
    phone: '+1 555-0115',
    jobTitle: 'Customer Success Manager',
    department: 'Sales',
    startDate: '2023-09-12',
    managerIndex: 1,
  },
  {
    firstName: 'Avery',
    lastName: 'Clark',
    email: 'avery.clark@demo.com',
    phone: '+1 555-0116',
    jobTitle: 'HR Specialist',
    department: 'Human Resources',
    startDate: '2023-03-20',
    managerIndex: 2,
  },
  {
    firstName: 'Jordan',
    lastName: 'Hayes',
    email: 'jordan.hayes@demo.com',
    phone: '+1 555-0117',
    jobTitle: 'Recruiter',
    department: 'Human Resources',
    startDate: '2023-05-05',
    managerIndex: 2,
  },
  {
    firstName: 'Morgan',
    lastName: 'Price',
    email: 'morgan.price@demo.com',
    phone: '+1 555-0118',
    jobTitle: 'Payroll Analyst',
    department: 'Finance',
    startDate: '2023-04-01',
    managerIndex: 3,
  },
  {
    firstName: 'Riley',
    lastName: 'Foster',
    email: 'riley.foster@demo.com',
    phone: '+1 555-0119',
    jobTitle: 'Financial Analyst',
    department: 'Finance',
    startDate: '2023-06-15',
    managerIndex: 3,
  },
  {
    firstName: 'Casey',
    lastName: 'Reed',
    email: 'casey.reed@demo.com',
    phone: '+1 555-0120',
    jobTitle: 'Operations Coordinator',
    department: 'Operations',
    startDate: '2023-10-01',
    managerIndex: 3,
  },
];

const resolveTenant = async (tenantIdArg?: string) => {
  if (tenantIdArg) {
    const tenant = await Tenant.findById(tenantIdArg);
    if (!tenant) {
      throw new Error(`Tenant not found: ${tenantIdArg}`);
    }
    return tenant;
  }

  const preferred = await Tenant.findOne({
    name: 'Bhuiyan LLC',
    approvalStatus: 'approved',
    isActive: true,
  });

  if (preferred) {
    return preferred;
  }

  const tenant = await Tenant.findOne({ approvalStatus: 'approved', isActive: true }).sort({
    createdAt: 1,
  });

  if (!tenant) {
    throw new Error('No approved active tenant found. Create a company first or pass TENANT_ID.');
  }

  return tenant;
};

const generateEmployeeNumber = async (tenantId: mongoose.Types.ObjectId): Promise<string> => {
  const count = await Employee.countDocuments({ tenantId });
  return `EMP-${String(count + 1).padStart(4, '0')}`;
};

const resolveDemoUserRole = (seed: DemoEmployeeSeed): UserRole => seed.role ?? 'employee';

/** Previous seed format, e.g. alex.morgan@demo.com → demo.alex.morgan@hr-saas.demo */
const legacyDemoEmail = (email: string): string => {
  const local = email.split('@')[0];
  return `demo.${local}@hr-saas.demo`;
};

const findExistingDemoUser = async (seed: DemoEmployeeSeed) => {
  const byCurrent = await User.findOne({ email: seed.email });
  if (byCurrent) {
    return byCurrent;
  }

  return User.findOne({ email: legacyDemoEmail(seed.email) });
};

const seedDemoEmployees = async (): Promise<void> => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  const tenantIdArg = process.argv[2] ?? process.env.SEED_TENANT_ID;

  await connectToDatabase(uri);

  try {
    const tenant = await resolveTenant(tenantIdArg);
    const tenantId = tenant._id;

    console.log(`Seeding ${DEMO_COUNT} demo employees for "${tenant.name}" (${tenantId.toString()})`);

    const passwordHash = await hashPassword(DEMO_PASSWORD);
    const createdEmployeeIds: mongoose.Types.ObjectId[] = [];
    let created = 0;
    let skipped = 0;
    let rolesUpdated = 0;
    let emailsUpdated = 0;

    for (let i = 0; i < DEMO_EMPLOYEES.length; i++) {
      const seed = DEMO_EMPLOYEES[i];
      const expectedRole = resolveDemoUserRole(seed);
      const existingUser = await findExistingDemoUser(seed);

      if (existingUser) {
        skipped += 1;

        const previousEmail = existingUser.email;

        if (existingUser.email !== seed.email) {
          existingUser.email = seed.email;
          emailsUpdated += 1;
          console.log(`  update ${previousEmail} → ${seed.email}`);
        }

        if (existingUser.role !== expectedRole) {
          existingUser.role = expectedRole;
          rolesUpdated += 1;
          console.log(`  update ${seed.email} — role set to ${expectedRole}`);
        } else if (existingUser.email === seed.email && previousEmail === seed.email) {
          console.log(`  skip  ${seed.email} — user already exists`);
        }

        if (existingUser.isModified()) {
          await existingUser.save();
        }

        const existingEmployee = await Employee.findOne({
          tenantId,
          $or: [{ userId: existingUser._id }, { email: seed.email }, { email: previousEmail }],
        });

        if (existingEmployee) {
          if (existingEmployee.email !== seed.email) {
            existingEmployee.email = seed.email;
            await existingEmployee.save();
          }
          createdEmployeeIds[i] = existingEmployee._id;
        }

        continue;
      }

      const managerId =
        seed.managerIndex !== undefined ? createdEmployeeIds[seed.managerIndex] : undefined;

      const session = await mongoose.startSession();

      try {
        session.startTransaction();

        const [user] = await User.create(
          [
            {
              email: seed.email,
              passwordHash,
              role: expectedRole,
              tenantId,
              firstName: seed.firstName,
              lastName: seed.lastName,
              isActive: true,
            },
          ],
          { session }
        );

        const employeeNumber = await generateEmployeeNumber(tenantId);

        const [employee] = await Employee.create(
          [
            {
              tenantId,
              userId: user._id,
              employeeNumber,
              firstName: seed.firstName,
              lastName: seed.lastName,
              email: seed.email,
              phone: seed.phone,
              jobTitle: seed.jobTitle,
              department: seed.department,
              startDate: new Date(seed.startDate),
              managerId: managerId ?? null,
              status: 'active' as const,
            },
          ],
          { session }
        );

        await session.commitTransaction();
        createdEmployeeIds[i] = employee._id;
        created += 1;
        console.log(
          `  added ${seed.firstName} ${seed.lastName} (${seed.email}) — ${employeeNumber}, role ${expectedRole}`
        );
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }

    console.log(
      `\nDone: ${created} created, ${skipped} skipped, ${rolesUpdated} roles updated, ${emailsUpdated} emails updated. Password for all: ${DEMO_PASSWORD}`
    );
  } finally {
    await disconnectFromDatabase();
  }
};

seedDemoEmployees().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
