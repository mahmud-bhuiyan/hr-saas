import { randomBytes } from "node:crypto";
import mongoose from "mongoose";
import type { UserRole } from "../../types/index.js";
import { hasPermission } from "../../utils/permissions.js";
import { hashPassword } from "../../utils/password.js";
import { employeeAuditSnapshot } from "../../utils/audit-snapshot.js";
import { writeAuditLog, type AuditContext } from "../audit/audit.service.js";
import { syncSeatCount } from "../billing/billing.service.js";
import { findUserByEmail } from "../admin/admin.service.js";
import { User } from "../admin/user.model.js";
import type { ServerEnv } from "../../config/env.js";
import {
  createPasswordResetTokenForUser,
  sendInviteSetPasswordEmail,
} from "../auth/password-reset.service.js";
import {
  assertActiveDepartmentName,
  DepartmentServiceError,
  listActiveDepartmentNames,
} from "../settings/department.service.js";
import {
  assertActiveWorkLocation,
  LocationServiceError,
} from "../locations/location.service.js";
import { WorkLocation } from "../locations/location.model.js";
import { Tenant } from "../auth/tenant.model.js";
import { listCountryDialCodes } from "../settings/country-dial-code.service.js";
import { validatePhoneNationalLength } from "../../utils/phone.js";
import { refreshBalanceEntitlement } from "../leave/leave-settings.service.js";
import {
  Employee,
  type EmployeeStatus,
  type IEmployeeDocument,
} from "./employee.model.js";
import type {
  CreateEmployeeInput,
  InviteEmployeeInput,
  ListEmployeesQuery,
  UpdateEmployeeInput,
} from "./employee.validation.js";

export interface EmployeeManagerSummary {
  id: string;
  firstName: string;
  lastName: string;
}

export interface EmployeePublic {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  startDate?: string;
  managerId?: string;
  manager?: EmployeeManagerSummary;
  status: EmployeeStatus;
  userId?: string;
  payRate?: number;
  payRateType?: "hourly" | "salary";
  payCurrency?: string;
  fteFactor?: number;
  defaultLocationId?: string;
  createdByName?: string;
  updatedByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MyEmployeeProfile {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  status: EmployeeStatus;
  defaultLocationName?: string;
}

interface AuditUserSummary {
  firstName?: string;
  lastName?: string;
  email: string;
}

interface AccessContext {
  userId: string;
  role: UserRole;
}

const auditUserDisplayName = (
  user?: AuditUserSummary | null,
): string | undefined => {
  if (!user) {
    return undefined;
  }

  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(" ");
  }

  return user.email;
};

const loadAuditUsers = async (
  employees: IEmployeeDocument[],
): Promise<Map<string, AuditUserSummary>> => {
  const userIds = new Set<string>();

  for (const employee of employees) {
    if (employee.createdBy) {
      userIds.add(employee.createdBy.toString());
    }
    if (employee.updatedBy) {
      userIds.add(employee.updatedBy.toString());
    }
  }

  if (userIds.size === 0) {
    return new Map();
  }

  const users = await User.find({ _id: { $in: [...userIds] } })
    .select("email firstName lastName")
    .lean();

  return new Map(
    users.map((user) => [
      user._id.toString(),
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    ]),
  );
};

const canViewPayFields = (role: UserRole): boolean =>
  hasPermission(role, "payroll:read");

const toEmployeePublic = (
  employee: IEmployeeDocument,
  manager?: EmployeeManagerSummary | null,
  auditUsers?: Map<string, AuditUserSummary>,
  includePayFields = false,
): EmployeePublic => {
  const createdBy = employee.createdBy
    ? auditUsers?.get(employee.createdBy.toString())
    : undefined;
  const updatedBy = employee.updatedBy
    ? auditUsers?.get(employee.updatedBy.toString())
    : undefined;

  return {
    id: employee._id.toString(),
    employeeNumber: employee.employeeNumber,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phone: employee.phone,
    jobTitle: employee.jobTitle,
    department: employee.department,
    startDate: employee.startDate?.toISOString().slice(0, 10),
    managerId: employee.managerId?.toString(),
    manager: manager ?? undefined,
    status: employee.status,
    userId: employee.userId?.toString(),
    ...(includePayFields
      ? {
          payRate: employee.payRate,
          payRateType: employee.payRateType,
          payCurrency: employee.payCurrency,
          fteFactor: employee.fteFactor,
          defaultLocationId: employee.defaultLocationId?.toString(),
        }
      : {}),
    createdByName: auditUserDisplayName(createdBy),
    updatedByName: auditUserDisplayName(updatedBy),
    createdAt: employee.createdAt.toISOString(),
    updatedAt: employee.updatedAt.toISOString(),
  };
};

const canReadAllEmployees = (role: UserRole): boolean => {
  return hasPermission(role, "employee:read");
};

const canReadTeamEmployees = (role: UserRole): boolean => {
  return hasPermission(role, "employee:read:team");
};

const findEmployeeRecordForUser = async (
  tenantId: string,
  userId: string,
): Promise<IEmployeeDocument | null> => {
  return Employee.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    userId: new mongoose.Types.ObjectId(userId),
  });
};

export interface EnsureEmployeeForUserInput {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

const deriveEmployeeNames = (
  user: EnsureEmployeeForUserInput,
): { firstName: string; lastName: string } => {
  const firstName = user.firstName?.trim();
  const lastName = user.lastName?.trim();

  if (firstName && lastName) {
    return { firstName, lastName };
  }

  if (firstName) {
    return { firstName, lastName: "User" };
  }

  if (lastName) {
    return { firstName: "User", lastName };
  }

  const localPart = user.email.split("@")[0] || "user";
  return { firstName: localPart, lastName: "User" };
};

const generateEmployeeNumber = async (tenantId: string): Promise<string> => {
  const count = await Employee.countDocuments({
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });
  return `EMP-${String(count + 1).padStart(4, "0")}`;
};

/** Ensures a tenant user has a linked employee record (create or link by email). */
export const ensureEmployeeRecordForUser = async (
  tenantId: string,
  user: EnsureEmployeeForUserInput,
  options?: { createdByUserId?: string; audit?: AuditContext },
): Promise<IEmployeeDocument> => {
  const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
  const userObjectId = new mongoose.Types.ObjectId(user.userId);

  const linked = await Employee.findOne({
    tenantId: tenantObjectId,
    userId: userObjectId,
  });

  if (linked) {
    return linked;
  }

  const normalizedEmail = user.email.toLowerCase().trim();

  const byEmail = await Employee.findOne({
    tenantId: tenantObjectId,
    email: normalizedEmail,
  });

  if (byEmail) {
    if (!byEmail.userId) {
      byEmail.userId = userObjectId;
      byEmail.updatedBy = options?.createdByUserId
        ? new mongoose.Types.ObjectId(options.createdByUserId)
        : userObjectId;
      await byEmail.save();
    }

    return byEmail;
  }

  const { firstName, lastName } = deriveEmployeeNames(user);
  const actorId = options?.createdByUserId
    ? new mongoose.Types.ObjectId(options.createdByUserId)
    : userObjectId;

  const employee = await Employee.create({
    tenantId: tenantObjectId,
    userId: userObjectId,
    employeeNumber: await generateEmployeeNumber(tenantId),
    firstName,
    lastName,
    email: normalizedEmail,
    status: "active",
    createdBy: actorId,
    updatedBy: actorId,
  });

  void writeAuditLog({
    tenantId,
    userId: options?.createdByUserId ?? user.userId,
    action: "create",
    entityType: "Employee",
    entityId: employee._id.toString(),
    after: employeeAuditSnapshot(employee),
    context: options?.audit,
  });

  return employee;
};

const loadManagerSummaries = async (
  employees: IEmployeeDocument[],
): Promise<Map<string, EmployeeManagerSummary>> => {
  const managerIds = [
    ...new Set(
      employees
        .map((e) => e.managerId?.toString())
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  if (managerIds.length === 0) {
    return new Map();
  }

  const managers = await Employee.find({
    _id: { $in: managerIds.map((id) => new mongoose.Types.ObjectId(id)) },
  }).lean();

  const map = new Map<string, EmployeeManagerSummary>();
  for (const manager of managers) {
    map.set(manager._id.toString(), {
      id: manager._id.toString(),
      firstName: manager.firstName,
      lastName: manager.lastName,
    });
  }

  return map;
};

const toPublicList = async (
  employees: IEmployeeDocument[],
  includePayFields = false,
): Promise<EmployeePublic[]> => {
  const managerMap = await loadManagerSummaries(employees);
  const auditUsers = await loadAuditUsers(employees);
  return employees.map((employee) =>
    toEmployeePublic(
      employee,
      employee.managerId
        ? managerMap.get(employee.managerId.toString())
        : undefined,
      auditUsers,
      includePayFields,
    ),
  );
};

const validateManagerId = async (
  tenantId: string,
  managerId: string | null | undefined,
  employeeId?: string,
): Promise<void> => {
  if (!managerId) {
    return;
  }

  if (employeeId && managerId === employeeId) {
    throw new EmployeeServiceError("Employee cannot be their own manager", 400);
  }

  const manager = await Employee.findOne({
    _id: new mongoose.Types.ObjectId(managerId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
    status: { $ne: "terminated" },
  });

  if (!manager) {
    throw new EmployeeServiceError("Manager not found", 404);
  }
};

const assertCanAccessEmployee = async (
  tenantId: string,
  employee: IEmployeeDocument,
  access: AccessContext,
): Promise<void> => {
  if (canReadAllEmployees(access.role)) {
    return;
  }

  if (!canReadTeamEmployees(access.role)) {
    throw new EmployeeServiceError("Insufficient permissions", 403);
  }

  const selfRecord = await findEmployeeRecordForUser(tenantId, access.userId);
  if (!selfRecord) {
    throw new EmployeeServiceError("Insufficient permissions", 403);
  }

  const isSelf = employee._id.toString() === selfRecord._id.toString();
  const isDirectReport =
    employee.managerId?.toString() === selfRecord._id.toString();

  if (!isSelf && !isDirectReport) {
    throw new EmployeeServiceError("Insufficient permissions", 403);
  }
};

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildEmployeeSearchFilter = (search: string): Record<string, unknown> => {
  const trimmed = search.trim();
  const escaped = escapeRegex(trimmed);
  const regex = new RegExp(escaped, "i");

  const fieldMatch = (pattern: RegExp): Record<string, unknown>[] => [
    { firstName: pattern },
    { lastName: pattern },
    { email: pattern },
    { phone: pattern },
    { jobTitle: pattern },
    { department: pattern },
    { employeeNumber: pattern },
  ];

  const fullNameMatch = (): Record<string, unknown>[] => [
    {
      $expr: {
        $regexMatch: {
          input: { $concat: ["$firstName", " ", "$lastName"] },
          regex: escaped,
          options: "i",
        },
      },
    },
    {
      $expr: {
        $regexMatch: {
          input: { $concat: ["$lastName", " ", "$firstName"] },
          regex: escaped,
          options: "i",
        },
      },
    },
  ];

  const terms = trimmed.split(/\s+/).filter(Boolean);
  const matchAllTerms = terms.length > 1 && !trimmed.includes("@");

  if (matchAllTerms) {
    const termFilters = terms.map((term) => ({
      $or: fieldMatch(new RegExp(escapeRegex(term), "i")),
    }));

    return { $and: termFilters };
  }

  return {
    $or: [...fieldMatch(regex), ...fullNameMatch()],
  };
};

const buildListFilter = (
  tenantId: string,
  query: ListEmployeesQuery,
  teamManagerId?: string,
): Record<string, unknown> => {
  const filter: Record<string, unknown> = {
    tenantId: new mongoose.Types.ObjectId(tenantId),
  };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.department) {
    filter.department = query.department;
  }

  if (query.search) {
    Object.assign(filter, buildEmployeeSearchFilter(query.search));
  }

  if (teamManagerId) {
    filter.managerId = new mongoose.Types.ObjectId(teamManagerId);
  }

  return filter;
};

const buildMongoSort = (
  sortBy?: ListEmployeesQuery["sortBy"],
  sortOrder?: ListEmployeesQuery["sortOrder"],
): Record<string, 1 | -1> => {
  const dir: 1 | -1 = sortOrder === "desc" ? -1 : 1;

  switch (sortBy) {
    case "employeeNumber":
      return { employeeNumber: dir };
    case "jobTitle":
      return { jobTitle: dir, lastName: 1, firstName: 1 };
    case "department":
      return { department: dir, lastName: 1, firstName: 1 };
    case "name":
    default:
      return { firstName: dir, lastName: dir };
  }
};

const sortByManager = (
  employees: EmployeePublic[],
  sortOrder?: ListEmployeesQuery["sortOrder"],
): EmployeePublic[] => {
  const dir = sortOrder === "desc" ? -1 : 1;

  return [...employees].sort((a, b) => {
    const aName = a.manager
      ? `${a.manager.firstName} ${a.manager.lastName}`
      : "";
    const bName = b.manager
      ? `${b.manager.firstName} ${b.manager.lastName}`
      : "";
    const cmp = aName.localeCompare(bName, undefined, { sensitivity: "base" });
    if (cmp !== 0) {
      return cmp * dir;
    }

    const nameCmp =
      a.firstName.localeCompare(b.firstName, undefined, {
        sensitivity: "base",
      }) ||
      a.lastName.localeCompare(b.lastName, undefined, { sensitivity: "base" });
    return nameCmp * dir;
  });
};

export const listEmployees = async (
  tenantId: string,
  query: ListEmployeesQuery,
  access: AccessContext,
): Promise<EmployeePublic[]> => {
  let teamManagerId: string | undefined;

  if (!canReadAllEmployees(access.role)) {
    if (!canReadTeamEmployees(access.role)) {
      throw new EmployeeServiceError("Insufficient permissions", 403);
    }

    const selfRecord = await findEmployeeRecordForUser(tenantId, access.userId);
    if (!selfRecord) {
      return [];
    }

    teamManagerId = selfRecord._id.toString();
  }

  const filter = buildListFilter(tenantId, query, teamManagerId);
  const sortBy = query.sortBy ?? "name";
  const sortOrder = query.sortOrder ?? "asc";

  const employees = await Employee.find(filter).sort(
    sortBy === "manager"
      ? { firstName: 1, lastName: 1 }
      : buildMongoSort(sortBy, sortOrder),
  );

  const publicEmployees = await toPublicList(
    employees,
    canViewPayFields(access.role),
  );

  if (sortBy === "manager") {
    return sortByManager(publicEmployees, sortOrder);
  }

  return publicEmployees;
};

const validateDepartment = async (
  tenantId: string,
  department?: string,
): Promise<void> => {
  try {
    await assertActiveDepartmentName(tenantId, department);
  } catch (error) {
    if (error instanceof DepartmentServiceError) {
      throw new EmployeeServiceError(error.message, error.statusCode);
    }
    throw error;
  }
};

const validateDefaultLocation = async (
  tenantId: string,
  locationId?: string | null,
): Promise<void> => {
  try {
    await assertActiveWorkLocation(tenantId, locationId ?? undefined);
  } catch (error) {
    if (error instanceof LocationServiceError) {
      throw new EmployeeServiceError(error.message, error.statusCode);
    }
    throw error;
  }
};

export const listDepartments = async (tenantId: string): Promise<string[]> => {
  return listActiveDepartmentNames(tenantId);
};

export const getMyEmployee = async (
  tenantId: string,
  userId: string,
): Promise<MyEmployeeProfile> => {
  const employee = await findEmployeeRecordForUser(tenantId, userId);

  if (!employee) {
    throw new EmployeeServiceError(
      "No employee record linked to your account",
      404,
    );
  }

  let defaultLocationName: string | undefined;

  if (employee.defaultLocationId) {
    const location = await WorkLocation.findById(
      employee.defaultLocationId,
    ).select("name");
    defaultLocationName = location?.name;
  }

  return {
    id: employee._id.toString(),
    employeeNumber: employee.employeeNumber,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phone: employee.phone,
    jobTitle: employee.jobTitle,
    department: employee.department,
    status: employee.status,
    defaultLocationName,
  };
};

export const getEmployeeById = async (
  tenantId: string,
  employeeId: string,
  access: AccessContext,
): Promise<EmployeePublic> => {
  const employee = await Employee.findOne({
    _id: new mongoose.Types.ObjectId(employeeId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!employee) {
    throw new EmployeeServiceError("Employee not found", 404);
  }

  await assertCanAccessEmployee(tenantId, employee, access);

  let manager: EmployeeManagerSummary | undefined;
  if (employee.managerId) {
    const managerDoc = await Employee.findById(employee.managerId);
    if (managerDoc) {
      manager = {
        id: managerDoc._id.toString(),
        firstName: managerDoc.firstName,
        lastName: managerDoc.lastName,
      };
    }
  }

  return toEmployeePublic(
    employee,
    manager,
    await loadAuditUsers([employee]),
    canViewPayFields(access.role),
  );
};

export const listDirectReports = async (
  tenantId: string,
  employeeId: string,
  access: AccessContext,
): Promise<EmployeePublic[]> => {
  const employee = await Employee.findOne({
    _id: new mongoose.Types.ObjectId(employeeId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!employee) {
    throw new EmployeeServiceError("Employee not found", 404);
  }

  await assertCanAccessEmployee(tenantId, employee, access);

  const reports = await Employee.find({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    managerId: employee._id,
  }).sort({ lastName: 1, firstName: 1 });

  return toPublicList(reports, canViewPayFields(access.role));
};

const assertEmployeePhone = async (
  tenantId: string,
  phone: string,
): Promise<void> => {
  const countries = await listCountryDialCodes(false);
  const tenant = await Tenant.findById(tenantId).select("defaultPhoneDialCode");
  const fallbackDialCode = tenant?.defaultPhoneDialCode ?? "1";
  const error = validatePhoneNationalLength(phone, countries, fallbackDialCode);

  if (error) {
    throw new EmployeeServiceError(error, 400);
  }
};

export const createEmployee = async (
  tenantId: string,
  input: CreateEmployeeInput,
  createdByUserId: string,
  audit?: AuditContext,
): Promise<EmployeePublic> => {
  await validateManagerId(tenantId, input.managerId);
  await validateDepartment(tenantId, input.department);

  const employeeNumber =
    input.employeeNumber?.trim() || (await generateEmployeeNumber(tenantId));

  const existingNumber = await Employee.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    employeeNumber,
  });

  if (existingNumber) {
    throw new EmployeeServiceError("Employee number already in use", 409);
  }

  if (input.email) {
    const existingEmail = await Employee.findOne({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      email: input.email,
    });

    if (existingEmail) {
      throw new EmployeeServiceError(
        "Email already in use for an employee",
        409,
      );
    }
  }

  if (input.phone) {
    await assertEmployeePhone(tenantId, input.phone);
  }

  const actorId = new mongoose.Types.ObjectId(createdByUserId);

  const employee = await Employee.create({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    employeeNumber,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email || undefined,
    phone: input.phone || undefined,
    jobTitle: input.jobTitle || undefined,
    department: input.department || undefined,
    startDate: input.startDate ? new Date(input.startDate) : undefined,
    managerId: input.managerId
      ? new mongoose.Types.ObjectId(input.managerId)
      : null,
    status: input.status ?? "active",
    createdBy: actorId,
    updatedBy: actorId,
  });

  void writeAuditLog({
    tenantId,
    userId: createdByUserId,
    action: "create",
    entityType: "Employee",
    entityId: employee._id.toString(),
    after: employeeAuditSnapshot(employee),
    context: audit,
  });

  void syncSeatCount(tenantId);

  return getEmployeeById(tenantId, employee._id.toString(), {
    userId: "",
    role: "company_admin",
  });
};

export const updateEmployee = async (
  tenantId: string,
  employeeId: string,
  input: UpdateEmployeeInput,
  updatedByUserId: string,
  audit?: AuditContext,
): Promise<EmployeePublic> => {
  const employee = await Employee.findOne({
    _id: new mongoose.Types.ObjectId(employeeId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!employee) {
    throw new EmployeeServiceError("Employee not found", 404);
  }

  const beforeSnapshot = employeeAuditSnapshot(employee);

  if (input.managerId !== undefined) {
    await validateManagerId(tenantId, input.managerId, employeeId);
    employee.managerId = input.managerId
      ? new mongoose.Types.ObjectId(input.managerId)
      : null;
  }

  if (input.firstName !== undefined) {
    employee.firstName = input.firstName;
  }

  if (input.lastName !== undefined) {
    employee.lastName = input.lastName;
  }

  if (input.email !== undefined) {
    const email = input.email || undefined;
    if (email) {
      const existingEmail = await Employee.findOne({
        tenantId: new mongoose.Types.ObjectId(tenantId),
        email,
        _id: { $ne: employee._id },
      });

      if (existingEmail) {
        throw new EmployeeServiceError(
          "Email already in use for an employee",
          409,
        );
      }
    }
    employee.email = email;
  }

  if (input.phone !== undefined) {
    if (input.phone) {
      await assertEmployeePhone(tenantId, input.phone);
    }
    employee.phone = input.phone || undefined;
  }

  if (input.jobTitle !== undefined) {
    employee.jobTitle = input.jobTitle || undefined;
  }

  if (input.department !== undefined) {
    await validateDepartment(tenantId, input.department || undefined);
    employee.department = input.department || undefined;
  }

  if (input.startDate !== undefined) {
    employee.startDate = input.startDate
      ? new Date(input.startDate)
      : undefined;
  }

  if (input.status !== undefined) {
    employee.status = input.status;
  }

  if (input.payRate !== undefined) {
    employee.payRate = input.payRate ?? undefined;
  }

  if (input.payRateType !== undefined) {
    employee.payRateType = input.payRateType ?? undefined;
  }

  if (input.payCurrency !== undefined) {
    employee.payCurrency = input.payCurrency
      ? input.payCurrency.toUpperCase()
      : undefined;
  }

  if (input.fteFactor !== undefined) {
    employee.fteFactor = input.fteFactor;
  }

  if (input.defaultLocationId !== undefined) {
    await validateDefaultLocation(tenantId, input.defaultLocationId);
    employee.defaultLocationId = input.defaultLocationId
      ? new mongoose.Types.ObjectId(input.defaultLocationId)
      : null;
  }

  const statusChanged =
    input.status !== undefined && input.status !== beforeSnapshot.status;

  employee.updatedBy = new mongoose.Types.ObjectId(updatedByUserId);

  await employee.save();

  void writeAuditLog({
    tenantId,
    userId: updatedByUserId,
    action: "update",
    entityType: "Employee",
    entityId: employee._id.toString(),
    before: beforeSnapshot,
    after: employeeAuditSnapshot(employee),
    context: audit,
  });

  if (statusChanged) {
    void syncSeatCount(tenantId);
  }

  const entitlementFieldsChanged =
    input.startDate !== undefined || input.fteFactor !== undefined;

  if (entitlementFieldsChanged) {
    const year = new Date().getUTCFullYear();
    void refreshBalanceEntitlement(tenantId, employeeId, year);
  }

  return getEmployeeById(tenantId, employeeId, {
    userId: "",
    role: "company_admin",
  });
};

export const inviteEmployee = async (
  tenantId: string,
  employeeId: string,
  input: InviteEmployeeInput,
  invitedByUserId: string,
  env: ServerEnv,
  audit?: AuditContext,
): Promise<EmployeePublic> => {
  const employee = await Employee.findOne({
    _id: new mongoose.Types.ObjectId(employeeId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!employee) {
    throw new EmployeeServiceError("Employee not found", 404);
  }

  if (!employee.email) {
    throw new EmployeeServiceError(
      "Employee must have an email address to invite",
      400,
    );
  }

  if (employee.userId) {
    throw new EmployeeServiceError("Employee already has a login account", 409);
  }

  const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
  let user = await User.findOne({ email: employee.email });

  if (user) {
    if (user.tenantId?.toString() !== tenantId) {
      throw new EmployeeServiceError("Email already in use", 409);
    }

    const linkedElsewhere = await Employee.findOne({
      tenantId: tenantObjectId,
      userId: user._id,
      _id: { $ne: employee._id },
    });

    if (linkedElsewhere) {
      throw new EmployeeServiceError(
        "User is already linked to another employee",
        409,
      );
    }
  } else {
    const passwordHash = await hashPassword(randomBytes(24).toString("hex"));
    user = await User.create({
      email: employee.email,
      passwordHash,
      role: input.role ?? "employee",
      tenantId: tenantObjectId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      isActive: true,
    });
  }

  employee.userId = user._id;
  employee.updatedBy = new mongoose.Types.ObjectId(invitedByUserId);
  await employee.save();

  const token = await createPasswordResetTokenForUser(user._id.toString());
  await sendInviteSetPasswordEmail(env, user.email, token);

  void writeAuditLog({
    tenantId,
    userId: invitedByUserId,
    action: "update",
    entityType: "Employee",
    entityId: employee._id.toString(),
    after: employeeAuditSnapshot(employee),
    context: audit,
  });

  return getEmployeeById(tenantId, employeeId, {
    userId: invitedByUserId,
    role: "company_admin",
  });
};

export class EmployeeServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "EmployeeServiceError";
  }
}
