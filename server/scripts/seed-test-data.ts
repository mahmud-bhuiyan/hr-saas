import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectToDatabase, disconnectFromDatabase } from "../src/config/db.js";
import {
  createAdmin,
  findUserByEmail,
  hasSuperAdmin,
} from "../src/modules/admin/admin.service.js";
import { createCompany } from "../src/modules/admin/registration.service.js";
import { User } from "../src/modules/admin/user.model.js";
import { Tenant } from "../src/modules/auth/tenant.model.js";
import { Employee, type IEmployeeDocument } from "../src/modules/employees/employee.model.js";
import {
  createEmployee,
  EmployeeServiceError,
  updateEmployee,
} from "../src/modules/employees/employee.service.js";
import type { UserRole } from "../src/types/index.js";
import { hashPassword } from "../src/utils/password.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

/** Matches docs/postman/hr-saas.postman_collection.json test credentials. */
export const TEST_PASSWORD = "User@123";

const SUPER_ADMIN = {
  email: "superadmin@hr.com",
  firstName: "Super",
  lastName: "Admin",
};

const MARVEL_CONSTRUCT_ADMIN = {
  companyName: "Marvel Construct",
  email: "info@marvelconstruct.co.uk",
  firstName: "Mehedi",
  lastName: "Hasan",
};

interface TestEmployeeSeed {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  department?: string;
  startDate: string;
  role: UserRole;
}

/** Ten employees for Marvel Construct (includes existing Employee One). */
const MARVEL_CONSTRUCT_EMPLOYEES: TestEmployeeSeed[] = [
  {
    employeeNumber: "EMP-0001",
    firstName: "Employee",
    lastName: "One",
    email: "employee@one.com",
    phone: "5550100001",
    jobTitle: "Test",
    startDate: "2024-01-01",
    role: "employee",
  },
  {
    employeeNumber: "EMP-0002",
    firstName: "James",
    lastName: "Wilson",
    email: "james.wilson@marvelconstruct.co.uk",
    phone: "5550100002",
    jobTitle: "Site Manager",
    department: "Operations",
    startDate: "2024-02-01",
    role: "manager",
  },
  {
    employeeNumber: "EMP-0003",
    firstName: "Sarah",
    lastName: "Mitchell",
    email: "sarah.mitchell@marvelconstruct.co.uk",
    phone: "5550100003",
    jobTitle: "Project Manager",
    department: "Projects",
    startDate: "2024-03-15",
    role: "manager",
  },
  {
    employeeNumber: "EMP-0004",
    firstName: "David",
    lastName: "Chen",
    email: "david.chen@marvelconstruct.co.uk",
    phone: "5550100004",
    jobTitle: "Civil Engineer",
    department: "Engineering",
    startDate: "2024-04-01",
    role: "employee",
  },
  {
    employeeNumber: "EMP-0005",
    firstName: "Emma",
    lastName: "Thompson",
    email: "emma.thompson@marvelconstruct.co.uk",
    phone: "5550100005",
    jobTitle: "Quantity Surveyor",
    department: "Finance",
    startDate: "2024-05-10",
    role: "employee",
  },
  {
    employeeNumber: "EMP-0006",
    firstName: "Michael",
    lastName: "O'Brien",
    email: "michael.obrien@marvelconstruct.co.uk",
    phone: "5550100006",
    jobTitle: "Health & Safety Officer",
    department: "Safety",
    startDate: "2024-06-01",
    role: "employee",
  },
  {
    employeeNumber: "EMP-0007",
    firstName: "Lisa",
    lastName: "Patel",
    email: "lisa.patel@marvelconstruct.co.uk",
    phone: "5550100007",
    jobTitle: "HR Coordinator",
    department: "Human Resources",
    startDate: "2024-01-20",
    role: "hr_manager",
  },
  {
    employeeNumber: "EMP-0008",
    firstName: "Tom",
    lastName: "Baker",
    email: "tom.baker@marvelconstruct.co.uk",
    phone: "5550100008",
    jobTitle: "Electrician",
    department: "Trades",
    startDate: "2024-07-01",
    role: "employee",
  },
  {
    employeeNumber: "EMP-0009",
    firstName: "Rachel",
    lastName: "Green",
    email: "rachel.green@marvelconstruct.co.uk",
    phone: "5550100009",
    jobTitle: "Architect",
    department: "Design",
    startDate: "2024-08-15",
    role: "employee",
  },
  {
    employeeNumber: "EMP-0010",
    firstName: "Oliver",
    lastName: "Hughes",
    email: "oliver.hughes@marvelconstruct.co.uk",
    phone: "5550100010",
    jobTitle: "Plant Operator",
    department: "Operations",
    startDate: "2024-09-01",
    role: "employee",
  },
];

const ensureSuperAdmin = async (): Promise<string> => {
  if (!(await hasSuperAdmin())) {
    const admin = await createAdmin({
      email: SUPER_ADMIN.email,
      password: TEST_PASSWORD,
      role: "super_admin",
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

  const anySuperAdmin = await User.findOne({ role: "super_admin" }).select(
    "+passwordHash",
  );
  if (!anySuperAdmin) {
    throw new Error("Super admin flag set but no super_admin user found");
  }

  anySuperAdmin.passwordHash = await hashPassword(TEST_PASSWORD);
  await anySuperAdmin.save();
  console.log(`Super admin password reset: ${anySuperAdmin.email}`);
  return anySuperAdmin._id.toString();
};

const ensureMarvelConstructCompany = async (
  superAdminId: string,
): Promise<{ tenantId: string; adminUserId: string }> => {
  const existingAdmin = await findUserByEmail(MARVEL_CONSTRUCT_ADMIN.email);

  if (existingAdmin?.tenantId) {
    existingAdmin.passwordHash = await hashPassword(TEST_PASSWORD);
    await existingAdmin.save();

    const tenant = await Tenant.findById(existingAdmin.tenantId);
    if (tenant) {
      tenant.approvalStatus = "approved";
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
      companyName: MARVEL_CONSTRUCT_ADMIN.companyName,
      email: MARVEL_CONSTRUCT_ADMIN.email,
      password: TEST_PASSWORD,
      firstName: MARVEL_CONSTRUCT_ADMIN.firstName,
      lastName: MARVEL_CONSTRUCT_ADMIN.lastName,
    },
    superAdminId,
  );

  const admin = await findUserByEmail(MARVEL_CONSTRUCT_ADMIN.email);
  if (!admin) {
    throw new Error("Failed to create Marvel Construct company admin");
  }

  console.log(
    `Company created: ${registration.companyName} (${registration.tenantId})`,
  );
  return {
    tenantId: registration.tenantId,
    adminUserId: admin._id.toString(),
  };
};

/** Company admins are login accounts only — never employee records. */
const removeCompanyAdminEmployeeRecords = async (
  tenantId: string,
): Promise<void> => {
  const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
  const companyAdmins = await User.find({
    tenantId: tenantObjectId,
    role: "company_admin",
  }).select("email _id");

  if (companyAdmins.length === 0) {
    return;
  }

  const adminEmails = companyAdmins.map((user) => user.email.toLowerCase());
  const adminUserIds = companyAdmins.map((user) => user._id);

  const result = await Employee.deleteMany({
    tenantId: tenantObjectId,
    $or: [{ email: { $in: adminEmails } }, { userId: { $in: adminUserIds } }],
  });

  if (result.deletedCount > 0) {
    console.log(
      `Removed ${result.deletedCount} company admin employee record(s)`,
    );
  }
};

const findEmployeeForSeed = async (
  tenantObjectId: mongoose.Types.ObjectId,
  seed: TestEmployeeSeed,
  tenantUserId?: mongoose.Types.ObjectId,
): Promise<IEmployeeDocument | null> => {
  const normalizedEmail = seed.email.toLowerCase();

  const byEmail = await Employee.findOne({
    tenantId: tenantObjectId,
    email: normalizedEmail,
  });
  if (byEmail) {
    return byEmail;
  }

  const byNumber = await Employee.findOne({
    tenantId: tenantObjectId,
    employeeNumber: seed.employeeNumber,
  });
  if (byNumber) {
    return byNumber;
  }

  if (tenantUserId) {
    return Employee.findOne({
      tenantId: tenantObjectId,
      userId: tenantUserId,
    });
  }

  return null;
};

const ensureEmployeeRecord = async (
  tenantId: string,
  seed: TestEmployeeSeed,
  adminUserId: string,
): Promise<void> => {
  const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
  const normalizedEmail = seed.email.toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail }).select(
    "role tenantId _id",
  );
  if (existingUser?.role === "company_admin") {
    console.log(`Skipped company admin (not an employee): ${normalizedEmail}`);
    return;
  }

  const tenantUserId =
    existingUser?.tenantId?.toString() === tenantId
      ? existingUser._id
      : undefined;

  let employee = await findEmployeeForSeed(
    tenantObjectId,
    seed,
    tenantUserId,
  );

  if (!employee) {
    try {
      await createEmployee(
        tenantId,
        {
          firstName: seed.firstName,
          lastName: seed.lastName,
          email: normalizedEmail,
          phone: seed.phone,
          jobTitle: seed.jobTitle,
          department: seed.department,
          startDate: seed.startDate,
          employeeNumber: seed.employeeNumber,
        },
        adminUserId,
      );
      console.log(`Employee record created: ${normalizedEmail}`);
    } catch (error) {
      if (
        error instanceof EmployeeServiceError &&
        (error.statusCode === 409 || error.statusCode === 400)
      ) {
        employee = await findEmployeeForSeed(
          tenantObjectId,
          seed,
          tenantUserId,
        );
        if (!employee) {
          throw error;
        }
        console.log(`Employee record matched after conflict: ${normalizedEmail}`);
      } else {
        throw error;
      }
    }

    if (!employee) {
      employee = await findEmployeeForSeed(
        tenantObjectId,
        seed,
        tenantUserId,
      );
    }
  } else {
    await updateEmployee(
      tenantId,
      employee._id.toString(),
      {
        firstName: seed.firstName,
        lastName: seed.lastName,
        email: normalizedEmail,
        phone: seed.phone,
        jobTitle: seed.jobTitle,
        department: seed.department,
        startDate: seed.startDate,
      },
      adminUserId,
    );
    console.log(`Employee record updated: ${normalizedEmail}`);
    employee = await Employee.findById(employee._id);
  }

  if (!employee) {
    throw new Error(`Failed to create employee record for ${seed.email}`);
  }

  let user = await User.findOne({ email: normalizedEmail }).select(
    "+passwordHash",
  );

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
    throw new Error("MONGODB_URI is required");
  }

  await connectToDatabase(uri);

  try {
    const superAdminId = await ensureSuperAdmin();
    const { tenantId, adminUserId } =
      await ensureMarvelConstructCompany(superAdminId);

    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      throw new Error("Marvel Construct tenant not found after seed");
    }

    for (const seed of MARVEL_CONSTRUCT_EMPLOYEES) {
      await ensureEmployeeRecord(tenantId, seed, adminUserId);
    }

    await removeCompanyAdminEmployeeRecords(tenantId);

    const employeeCount = await Employee.countDocuments({
      tenantId: new mongoose.Types.ObjectId(tenantId),
    });

    console.log("");
    console.log("Test data ready. All accounts use password:", TEST_PASSWORD);
    console.log("  super_admin   -> superadmin@hr.com");
    console.log("  company_admin -> info@marvelconstruct.co.uk");
    console.log("  hr_manager    -> lisa.patel@marvelconstruct.co.uk");
    console.log(
      "  manager       -> james.wilson@marvelconstruct.co.uk, sarah.mitchell@marvelconstruct.co.uk",
    );
    console.log(
      "  employee      -> employee@one.com, david.chen@marvelconstruct.co.uk, …",
    );
    console.log(`  Marvel Construct employees in DB: ${employeeCount}`);
    console.log("");
    console.log(
      "Use Auth > Login (Employee) in docs/postman/hr-saas.postman_collection.json",
    );
  } finally {
    await disconnectFromDatabase();
  }
};

seedTestData().catch((error: unknown) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
