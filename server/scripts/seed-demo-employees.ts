import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { connectToDatabase, disconnectFromDatabase } from '../src/config/db.js';
import { Tenant } from '../src/modules/auth/tenant.model.js';
import { User } from '../src/modules/admin/user.model.js';
import { Employee } from '../src/modules/employees/employee.model.js';
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
};

const DEMO_EMPLOYEES: DemoEmployeeSeed[] = [
  {
    firstName: 'Alex',
    lastName: 'Morgan',
    email: 'demo.alex.morgan@hr-saas.demo',
    phone: '+1 555-0101',
    jobTitle: 'Engineering Manager',
    department: 'Engineering',
    startDate: '2022-01-15',
  },
  {
    firstName: 'Jordan',
    lastName: 'Lee',
    email: 'demo.jordan.lee@hr-saas.demo',
    phone: '+1 555-0102',
    jobTitle: 'Sales Manager',
    department: 'Sales',
    startDate: '2022-02-01',
  },
  {
    firstName: 'Taylor',
    lastName: 'Brooks',
    email: 'demo.taylor.brooks@hr-saas.demo',
    phone: '+1 555-0103',
    jobTitle: 'HR Manager',
    department: 'Human Resources',
    startDate: '2022-03-10',
  },
  {
    firstName: 'Morgan',
    lastName: 'Chen',
    email: 'demo.morgan.chen@hr-saas.demo',
    phone: '+1 555-0104',
    jobTitle: 'Finance Manager',
    department: 'Finance',
    startDate: '2022-04-05',
  },
  {
    firstName: 'Jamie',
    lastName: 'Rivera',
    email: 'demo.jamie.rivera@hr-saas.demo',
    phone: '+1 555-0105',
    jobTitle: 'Software Engineer',
    department: 'Engineering',
    startDate: '2023-01-20',
    managerIndex: 0,
  },
  {
    firstName: 'Casey',
    lastName: 'Kim',
    email: 'demo.casey.kim@hr-saas.demo',
    phone: '+1 555-0106',
    jobTitle: 'Software Engineer',
    department: 'Engineering',
    startDate: '2023-02-14',
    managerIndex: 0,
  },
  {
    firstName: 'Riley',
    lastName: 'Patel',
    email: 'demo.riley.patel@hr-saas.demo',
    phone: '+1 555-0107',
    jobTitle: 'QA Engineer',
    department: 'Engineering',
    startDate: '2023-03-01',
    managerIndex: 0,
  },
  {
    firstName: 'Avery',
    lastName: 'Nguyen',
    email: 'demo.avery.nguyen@hr-saas.demo',
    phone: '+1 555-0108',
    jobTitle: 'DevOps Engineer',
    department: 'Engineering',
    startDate: '2023-04-18',
    managerIndex: 0,
  },
  {
    firstName: 'Quinn',
    lastName: "O'Brien",
    email: 'demo.quinn.obrien@hr-saas.demo',
    phone: '+1 555-0109',
    jobTitle: 'Frontend Developer',
    department: 'Engineering',
    startDate: '2023-05-22',
    managerIndex: 0,
  },
  {
    firstName: 'Blake',
    lastName: 'Santos',
    email: 'demo.blake.santos@hr-saas.demo',
    phone: '+1 555-0110',
    jobTitle: 'Backend Developer',
    department: 'Engineering',
    startDate: '2023-06-30',
    managerIndex: 0,
  },
  {
    firstName: 'Drew',
    lastName: 'Anderson',
    email: 'demo.drew.anderson@hr-saas.demo',
    phone: '+1 555-0111',
    jobTitle: 'Account Executive',
    department: 'Sales',
    startDate: '2023-01-10',
    managerIndex: 1,
  },
  {
    firstName: 'Cameron',
    lastName: 'Wright',
    email: 'demo.cameron.wright@hr-saas.demo',
    phone: '+1 555-0112',
    jobTitle: 'Account Executive',
    department: 'Sales',
    startDate: '2023-02-28',
    managerIndex: 1,
  },
  {
    firstName: 'Parker',
    lastName: 'Evans',
    email: 'demo.parker.evans@hr-saas.demo',
    phone: '+1 555-0113',
    jobTitle: 'Sales Coordinator',
    department: 'Sales',
    startDate: '2023-07-15',
    managerIndex: 1,
  },
  {
    firstName: 'Reese',
    lastName: 'Taylor',
    email: 'demo.reese.taylor@hr-saas.demo',
    phone: '+1 555-0114',
    jobTitle: 'Business Development Rep',
    department: 'Sales',
    startDate: '2023-08-01',
    managerIndex: 1,
  },
  {
    firstName: 'Skyler',
    lastName: 'Moore',
    email: 'demo.skyler.moore@hr-saas.demo',
    phone: '+1 555-0115',
    jobTitle: 'Customer Success Manager',
    department: 'Sales',
    startDate: '2023-09-12',
    managerIndex: 1,
  },
  {
    firstName: 'Avery',
    lastName: 'Clark',
    email: 'demo.avery.clark@hr-saas.demo',
    phone: '+1 555-0116',
    jobTitle: 'HR Specialist',
    department: 'Human Resources',
    startDate: '2023-03-20',
    managerIndex: 2,
  },
  {
    firstName: 'Jordan',
    lastName: 'Hayes',
    email: 'demo.jordan.hayes@hr-saas.demo',
    phone: '+1 555-0117',
    jobTitle: 'Recruiter',
    department: 'Human Resources',
    startDate: '2023-05-05',
    managerIndex: 2,
  },
  {
    firstName: 'Morgan',
    lastName: 'Price',
    email: 'demo.morgan.price@hr-saas.demo',
    phone: '+1 555-0118',
    jobTitle: 'Payroll Analyst',
    department: 'Finance',
    startDate: '2023-04-01',
    managerIndex: 3,
  },
  {
    firstName: 'Riley',
    lastName: 'Foster',
    email: 'demo.riley.foster@hr-saas.demo',
    phone: '+1 555-0119',
    jobTitle: 'Financial Analyst',
    department: 'Finance',
    startDate: '2023-06-15',
    managerIndex: 3,
  },
  {
    firstName: 'Casey',
    lastName: 'Reed',
    email: 'demo.casey.reed@hr-saas.demo',
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

    for (let i = 0; i < DEMO_EMPLOYEES.length; i++) {
      const seed = DEMO_EMPLOYEES[i];
      const existingUser = await User.findOne({ email: seed.email });

      if (existingUser) {
        console.log(`  skip  ${seed.email} — user already exists`);
        skipped += 1;

        const existingEmployee = await Employee.findOne({
          tenantId,
          $or: [{ userId: existingUser._id }, { email: seed.email }],
        });

        if (existingEmployee) {
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
              role: 'employee' as const,
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
        console.log(`  added ${seed.firstName} ${seed.lastName} (${seed.email}) — ${employeeNumber}`);
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    }

    console.log(`\nDone: ${created} created, ${skipped} skipped. Password for all: ${DEMO_PASSWORD}`);
  } finally {
    await disconnectFromDatabase();
  }
};

seedDemoEmployees().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
