import mongoose from 'mongoose';
import type { UserRole } from '../../types/index.js';
import { hasPermission } from '../../utils/permissions.js';
import { User } from '../admin/user.model.js';
import {
  Employee,
  type EmployeeStatus,
  type IEmployeeDocument,
} from './employee.model.js';
import type {
  CreateEmployeeInput,
  ListEmployeesQuery,
  UpdateEmployeeInput,
} from './employee.validation.js';

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
  createdByName?: string;
  updatedByName?: string;
  createdAt: string;
  updatedAt: string;
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

const auditUserDisplayName = (user?: AuditUserSummary | null): string | undefined => {
  if (!user) {
    return undefined;
  }

  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
  }

  return user.email;
};

const loadAuditUsers = async (
  employees: IEmployeeDocument[]
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
    .select('email firstName lastName')
    .lean();

  return new Map(
    users.map((user) => [
      user._id.toString(),
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    ])
  );
};

const toEmployeePublic = (
  employee: IEmployeeDocument,
  manager?: EmployeeManagerSummary | null,
  auditUsers?: Map<string, AuditUserSummary>
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
    createdByName: auditUserDisplayName(createdBy),
    updatedByName: auditUserDisplayName(updatedBy),
    createdAt: employee.createdAt.toISOString(),
    updatedAt: employee.updatedAt.toISOString(),
  };
}

const canReadAllEmployees = (role: UserRole): boolean => {
  return hasPermission(role, 'employee:read');
}

const canReadTeamEmployees = (role: UserRole): boolean => {
  return hasPermission(role, 'employee:read:team');
}

const findEmployeeRecordForUser = async (
  tenantId: string,
  userId: string
): Promise<IEmployeeDocument | null> => {
  return Employee.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    userId: new mongoose.Types.ObjectId(userId),
  });
}

const loadManagerSummaries = async (
  employees: IEmployeeDocument[]
): Promise<Map<string, EmployeeManagerSummary>> => {
  const managerIds = [
    ...new Set(
      employees
        .map((e) => e.managerId?.toString())
        .filter((id): id is string => Boolean(id))
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
}

const toPublicList = async (employees: IEmployeeDocument[]): Promise<EmployeePublic[]> => {
  const managerMap = await loadManagerSummaries(employees);
  const auditUsers = await loadAuditUsers(employees);
  return employees.map((employee) =>
    toEmployeePublic(
      employee,
      employee.managerId ? managerMap.get(employee.managerId.toString()) : undefined,
      auditUsers
    )
  );
}

const generateEmployeeNumber = async (tenantId: string): Promise<string> => {
  const count = await Employee.countDocuments({
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });
  return `EMP-${String(count + 1).padStart(4, '0')}`;
}

const validateManagerId = async (
  tenantId: string,
  managerId: string | null | undefined,
  employeeId?: string
): Promise<void> => {
  if (!managerId) {
    return;
  }

  if (employeeId && managerId === employeeId) {
    throw new EmployeeServiceError('Employee cannot be their own manager', 400);
  }

  const manager = await Employee.findOne({
    _id: new mongoose.Types.ObjectId(managerId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
    status: { $ne: 'terminated' },
  });

  if (!manager) {
    throw new EmployeeServiceError('Manager not found', 404);
  }
}

const assertCanAccessEmployee = async (
  tenantId: string,
  employee: IEmployeeDocument,
  access: AccessContext
): Promise<void> => {
  if (canReadAllEmployees(access.role)) {
    return;
  }

  if (!canReadTeamEmployees(access.role)) {
    throw new EmployeeServiceError('Insufficient permissions', 403);
  }

  const selfRecord = await findEmployeeRecordForUser(tenantId, access.userId);
  if (!selfRecord) {
    throw new EmployeeServiceError('Insufficient permissions', 403);
  }

  const isSelf = employee._id.toString() === selfRecord._id.toString();
  const isDirectReport = employee.managerId?.toString() === selfRecord._id.toString();

  if (!isSelf && !isDirectReport) {
    throw new EmployeeServiceError('Insufficient permissions', 403);
  }
}

const buildListFilter = (
  tenantId: string,
  query: ListEmployeesQuery,
  teamManagerId?: string
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
    const regex = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [
      { firstName: regex },
      { lastName: regex },
      { email: regex },
      { jobTitle: regex },
      { employeeNumber: regex },
    ];
  }

  if (teamManagerId) {
    filter.managerId = new mongoose.Types.ObjectId(teamManagerId);
  }

  return filter;
}

const buildMongoSort = (
  sortBy?: ListEmployeesQuery['sortBy'],
  sortOrder?: ListEmployeesQuery['sortOrder']
): Record<string, 1 | -1> => {
  const dir: 1 | -1 = sortOrder === 'desc' ? -1 : 1;

  switch (sortBy) {
    case 'employeeNumber':
      return { employeeNumber: dir };
    case 'jobTitle':
      return { jobTitle: dir, lastName: 1, firstName: 1 };
    case 'department':
      return { department: dir, lastName: 1, firstName: 1 };
    case 'name':
    default:
      return { firstName: dir, lastName: dir };
  }
};

const sortByManager = (
  employees: EmployeePublic[],
  sortOrder?: ListEmployeesQuery['sortOrder']
): EmployeePublic[] => {
  const dir = sortOrder === 'desc' ? -1 : 1;

  return [...employees].sort((a, b) => {
    const aName = a.manager ? `${a.manager.firstName} ${a.manager.lastName}` : '';
    const bName = b.manager ? `${b.manager.firstName} ${b.manager.lastName}` : '';
    const cmp = aName.localeCompare(bName, undefined, { sensitivity: 'base' });
    if (cmp !== 0) {
      return cmp * dir;
    }

    const nameCmp =
      a.firstName.localeCompare(b.firstName, undefined, { sensitivity: 'base' }) ||
      a.lastName.localeCompare(b.lastName, undefined, { sensitivity: 'base' });
    return nameCmp * dir;
  });
};

export const listEmployees = async (
  tenantId: string,
  query: ListEmployeesQuery,
  access: AccessContext
): Promise<EmployeePublic[]> => {
  let teamManagerId: string | undefined;

  if (!canReadAllEmployees(access.role)) {
    if (!canReadTeamEmployees(access.role)) {
      throw new EmployeeServiceError('Insufficient permissions', 403);
    }

    const selfRecord = await findEmployeeRecordForUser(tenantId, access.userId);
    if (!selfRecord) {
      return [];
    }

    teamManagerId = selfRecord._id.toString();
  }

  const filter = buildListFilter(tenantId, query, teamManagerId);
  const sortBy = query.sortBy ?? 'name';
  const sortOrder = query.sortOrder ?? 'asc';

  const employees = await Employee.find(filter).sort(
    sortBy === 'manager' ? { firstName: 1, lastName: 1 } : buildMongoSort(sortBy, sortOrder)
  );

  const publicEmployees = await toPublicList(employees);

  if (sortBy === 'manager') {
    return sortByManager(publicEmployees, sortOrder);
  }

  return publicEmployees;
}

export const listDepartments = async (tenantId: string): Promise<string[]> => {
  const departments = await Employee.distinct('department', {
    tenantId: new mongoose.Types.ObjectId(tenantId),
    department: { $exists: true, $nin: [null, ''] },
  });

  return (departments as string[]).sort((a, b) => a.localeCompare(b));
}

export const getEmployeeById = async (
  tenantId: string,
  employeeId: string,
  access: AccessContext
): Promise<EmployeePublic> => {
  const employee = await Employee.findOne({
    _id: new mongoose.Types.ObjectId(employeeId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!employee) {
    throw new EmployeeServiceError('Employee not found', 404);
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

  return toEmployeePublic(employee, manager, await loadAuditUsers([employee]));
}

export const listDirectReports = async (
  tenantId: string,
  employeeId: string,
  access: AccessContext
): Promise<EmployeePublic[]> => {
  const employee = await Employee.findOne({
    _id: new mongoose.Types.ObjectId(employeeId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!employee) {
    throw new EmployeeServiceError('Employee not found', 404);
  }

  await assertCanAccessEmployee(tenantId, employee, access);

  const reports = await Employee.find({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    managerId: employee._id,
  }).sort({ lastName: 1, firstName: 1 });

  return toPublicList(reports);
}

export const createEmployee = async (
  tenantId: string,
  input: CreateEmployeeInput,
  createdByUserId: string
): Promise<EmployeePublic> => {
  await validateManagerId(tenantId, input.managerId);

  const employeeNumber =
    input.employeeNumber?.trim() ||
    (await generateEmployeeNumber(tenantId));

  const existingNumber = await Employee.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    employeeNumber,
  });

  if (existingNumber) {
    throw new EmployeeServiceError('Employee number already in use', 409);
  }

  if (input.email) {
    const existingEmail = await Employee.findOne({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      email: input.email,
    });

    if (existingEmail) {
      throw new EmployeeServiceError('Email already in use for an employee', 409);
    }
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
    managerId: input.managerId ? new mongoose.Types.ObjectId(input.managerId) : null,
    status: input.status ?? 'active',
    createdBy: actorId,
    updatedBy: actorId,
  });

  return getEmployeeById(tenantId, employee._id.toString(), {
    userId: '',
    role: 'company_admin',
  });
}

export const updateEmployee = async (
  tenantId: string,
  employeeId: string,
  input: UpdateEmployeeInput,
  updatedByUserId: string
): Promise<EmployeePublic> => {
  const employee = await Employee.findOne({
    _id: new mongoose.Types.ObjectId(employeeId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!employee) {
    throw new EmployeeServiceError('Employee not found', 404);
  }

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
        throw new EmployeeServiceError('Email already in use for an employee', 409);
      }
    }
    employee.email = email;
  }

  if (input.phone !== undefined) {
    employee.phone = input.phone || undefined;
  }

  if (input.jobTitle !== undefined) {
    employee.jobTitle = input.jobTitle || undefined;
  }

  if (input.department !== undefined) {
    employee.department = input.department || undefined;
  }

  if (input.startDate !== undefined) {
    employee.startDate = input.startDate ? new Date(input.startDate) : undefined;
  }

  if (input.status !== undefined) {
    employee.status = input.status;
  }

  employee.updatedBy = new mongoose.Types.ObjectId(updatedByUserId);

  await employee.save();

  return getEmployeeById(tenantId, employeeId, {
    userId: '',
    role: 'company_admin',
  });
}

export class EmployeeServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'EmployeeServiceError';
  }
}
