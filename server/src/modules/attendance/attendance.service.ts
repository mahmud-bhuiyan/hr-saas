import mongoose from 'mongoose';
import type { UserRole } from '../../types/index.js';
import { hasPermission } from '../../utils/permissions.js';
import { writeAuditLog, type AuditContext } from '../audit/audit.service.js';
import { Tenant } from '../auth/tenant.model.js';
import { Employee, type IEmployeeDocument } from '../employees/employee.model.js';
import { resolveEmployeeForUser, LeaveServiceError } from '../leave/leave.service.js';
import {
  AttendanceLog,
  type IAttendanceLogDocument,
  type AttendanceMethod,
} from './attendance.model.js';
import type {
  ClockInInput,
  ListEmployeeAttendanceQuery,
  ListMyAttendanceQuery,
  PatchAttendanceInput,
} from './attendance.validation.js';

export class AttendanceServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'AttendanceServiceError';
  }
}

interface AccessContext {
  userId: string;
  userEmail: string;
  role: UserRole;
}

export interface AttendanceEmployeeSummary {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  jobTitle?: string;
  department?: string;
}

export interface AttendanceLogPublic {
  id: string;
  employeeId: string;
  employee?: AttendanceEmployeeSummary;
  clockIn: string;
  clockOut: string | null;
  method: AttendanceMethod;
  location?: { lat: number; lng: number } | null;
  notes?: string;
  correctedBy?: string;
  durationMinutes: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStatusPublic {
  clockedIn: boolean;
  session: AttendanceLogPublic | null;
}

export interface AttendanceSettingsPublic {
  attendanceGpsEnabled: boolean;
}

export interface PaginatedAttendanceLogs {
  logs: AttendanceLogPublic[];
  total: number;
  page: number;
  limit: number;
}

const toEmployeeSummary = (employee: IEmployeeDocument): AttendanceEmployeeSummary => ({
  id: employee._id.toString(),
  firstName: employee.firstName,
  lastName: employee.lastName,
  email: employee.email,
  jobTitle: employee.jobTitle,
  department: employee.department,
});

const durationMinutes = (clockIn: Date, clockOut: Date | null | undefined): number | null => {
  if (!clockOut) {
    return null;
  }
  return Math.round((clockOut.getTime() - clockIn.getTime()) / 60000);
};

const toAttendanceLogPublic = async (
  log: IAttendanceLogDocument,
  includeEmployee = false
): Promise<AttendanceLogPublic> => {
  let employee: AttendanceEmployeeSummary | undefined;

  if (includeEmployee) {
    const record = await Employee.findById(log.employeeId);
    if (record) {
      employee = toEmployeeSummary(record);
    }
  }

  return {
    id: log._id.toString(),
    employeeId: log.employeeId.toString(),
    employee,
    clockIn: log.clockIn.toISOString(),
    clockOut: log.clockOut ? log.clockOut.toISOString() : null,
    method: log.method,
    location: log.location?.lat !== undefined ? log.location : null,
    notes: log.notes,
    correctedBy: log.correctedBy?.toString(),
    durationMinutes: durationMinutes(log.clockIn, log.clockOut),
    createdAt: log.createdAt.toISOString(),
    updatedAt: log.updatedAt.toISOString(),
  };
};

const attendanceAuditSnapshot = (log: IAttendanceLogDocument): Record<string, unknown> => ({
  employeeId: log.employeeId.toString(),
  clockIn: log.clockIn.toISOString(),
  clockOut: log.clockOut ? log.clockOut.toISOString() : null,
  method: log.method,
  notes: log.notes ?? null,
});

const getTenantGpsEnabled = async (tenantId: string): Promise<boolean> => {
  const tenant = await Tenant.findById(tenantId).select('attendanceGpsEnabled');
  return tenant?.attendanceGpsEnabled ?? false;
};

const assertCanManageEmployee = async (
  tenantId: string,
  employeeId: string,
  access: AccessContext
): Promise<void> => {
  if (hasPermission(access.role, 'attendance:manage')) {
    return;
  }

  if (!hasPermission(access.role, 'attendance:read:team')) {
    throw new AttendanceServiceError('Insufficient permissions', 403);
  }

  const manager = await resolveEmployeeForUser(tenantId, access.userId, access.userEmail);
  const report = await Employee.findOne({
    _id: new mongoose.Types.ObjectId(employeeId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
    managerId: manager._id,
  });

  if (!report) {
    throw new AttendanceServiceError('Insufficient permissions', 403);
  }
};

export const getAttendanceSettings = async (
  tenantId: string
): Promise<AttendanceSettingsPublic> => {
  const gpsEnabled = await getTenantGpsEnabled(tenantId);
  return { attendanceGpsEnabled: gpsEnabled };
};

export const patchAttendanceSettings = async (
  tenantId: string,
  attendanceGpsEnabled: boolean,
  userId: string
): Promise<AttendanceSettingsPublic> => {
  const tenant = await Tenant.findById(tenantId);
  if (!tenant) {
    throw new AttendanceServiceError('Tenant not found', 404);
  }

  tenant.attendanceGpsEnabled = attendanceGpsEnabled;
  tenant.updatedBy = new mongoose.Types.ObjectId(userId);
  await tenant.save();

  return { attendanceGpsEnabled: tenant.attendanceGpsEnabled ?? false };
};

export const clockIn = async (
  tenantId: string,
  input: ClockInInput,
  access: AccessContext
): Promise<AttendanceLogPublic> => {
  const employee = await resolveEmployeeForUser(tenantId, access.userId, access.userEmail);

  const openSession = await AttendanceLog.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    employeeId: employee._id,
    clockOut: null,
  });

  if (openSession) {
    throw new AttendanceServiceError('You are already clocked in', 409);
  }

  const gpsEnabled = await getTenantGpsEnabled(tenantId);
  if (input.location && !gpsEnabled) {
    throw new AttendanceServiceError('GPS location is not enabled for this company', 400);
  }

  const log = await AttendanceLog.create({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    employeeId: employee._id,
    clockIn: new Date(),
    clockOut: null,
    method: 'web' as const,
    location: input.location ?? null,
  });

  return toAttendanceLogPublic(log);
};

export const clockOut = async (
  tenantId: string,
  access: AccessContext
): Promise<AttendanceLogPublic> => {
  const employee = await resolveEmployeeForUser(tenantId, access.userId, access.userEmail);

  const openSession = await AttendanceLog.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    employeeId: employee._id,
    clockOut: null,
  });

  if (!openSession) {
    throw new AttendanceServiceError('No active clock-in session found', 404);
  }

  openSession.clockOut = new Date();
  await openSession.save();

  return toAttendanceLogPublic(openSession);
};

export const getMyAttendanceStatus = async (
  tenantId: string,
  access: AccessContext
): Promise<AttendanceStatusPublic> => {
  const employee = await resolveEmployeeForUser(tenantId, access.userId, access.userEmail);

  const openSession = await AttendanceLog.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    employeeId: employee._id,
    clockOut: null,
  });

  if (!openSession) {
    return { clockedIn: false, session: null };
  }

  return {
    clockedIn: true,
    session: await toAttendanceLogPublic(openSession),
  };
};

export const listMyAttendance = async (
  tenantId: string,
  query: ListMyAttendanceQuery,
  access: AccessContext
): Promise<PaginatedAttendanceLogs> => {
  const employee = await resolveEmployeeForUser(tenantId, access.userId, access.userEmail);

  const filter = {
    tenantId: new mongoose.Types.ObjectId(tenantId),
    employeeId: employee._id,
  };

  const skip = (query.page - 1) * query.limit;

  const [logs, total] = await Promise.all([
    AttendanceLog.find(filter).sort({ clockIn: -1 }).skip(skip).limit(query.limit),
    AttendanceLog.countDocuments(filter),
  ]);

  return {
    logs: await Promise.all(logs.map((log) => toAttendanceLogPublic(log))),
    total,
    page: query.page,
    limit: query.limit,
  };
};

export const listEmployeeAttendance = async (
  tenantId: string,
  employeeId: string,
  query: ListEmployeeAttendanceQuery,
  access: AccessContext
): Promise<PaginatedAttendanceLogs> => {
  await assertCanManageEmployee(tenantId, employeeId, access);

  const filter = {
    tenantId: new mongoose.Types.ObjectId(tenantId),
    employeeId: new mongoose.Types.ObjectId(employeeId),
  };

  const skip = (query.page - 1) * query.limit;

  const [logs, total] = await Promise.all([
    AttendanceLog.find(filter).sort({ clockIn: -1 }).skip(skip).limit(query.limit),
    AttendanceLog.countDocuments(filter),
  ]);

  return {
    logs: await Promise.all(logs.map((log) => toAttendanceLogPublic(log))),
    total,
    page: query.page,
    limit: query.limit,
  };
};

const getTeamEmployeeIds = async (
  tenantId: string,
  access: AccessContext
): Promise<mongoose.Types.ObjectId[] | null> => {
  if (hasPermission(access.role, 'attendance:manage')) {
    return null;
  }

  const manager = await resolveEmployeeForUser(tenantId, access.userId, access.userEmail);
  const reports = await Employee.find({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    managerId: manager._id,
    status: 'active',
  }).select('_id');

  return reports.map((r) => r._id);
};

export const listTeamLive = async (
  tenantId: string,
  access: AccessContext
): Promise<AttendanceLogPublic[]> => {
  const teamIds = await getTeamEmployeeIds(tenantId, access);

  const filter: Record<string, unknown> = {
    tenantId: new mongoose.Types.ObjectId(tenantId),
    clockOut: null,
  };

  if (teamIds) {
    if (teamIds.length === 0) {
      return [];
    }
    filter.employeeId = { $in: teamIds };
  }

  const logs = await AttendanceLog.find(filter).sort({ clockIn: 1 });

  return Promise.all(logs.map((log) => toAttendanceLogPublic(log, true)));
};

export const patchAttendanceLog = async (
  tenantId: string,
  logId: string,
  input: PatchAttendanceInput,
  access: AccessContext,
  auditContext?: AuditContext
): Promise<AttendanceLogPublic> => {
  if (!hasPermission(access.role, 'attendance:manage')) {
    throw new AttendanceServiceError('Insufficient permissions', 403);
  }

  const log = await AttendanceLog.findOne({
    _id: new mongoose.Types.ObjectId(logId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!log) {
    throw new AttendanceServiceError('Attendance record not found', 404);
  }

  const before = attendanceAuditSnapshot(log);

  if (input.clockIn !== undefined) {
    log.clockIn = new Date(input.clockIn);
  }
  if (input.clockOut !== undefined) {
    log.clockOut = input.clockOut ? new Date(input.clockOut) : null;
  }

  if (log.clockOut && log.clockOut < log.clockIn) {
    throw new AttendanceServiceError('Clock-out must be after clock-in', 400);
  }

  log.notes = input.notes;
  log.correctedBy = new mongoose.Types.ObjectId(access.userId);
  await log.save();

  void writeAuditLog({
    tenantId,
    userId: access.userId,
    action: 'update',
    entityType: 'AttendanceLog',
    entityId: log._id.toString(),
    before,
    after: attendanceAuditSnapshot(log),
    context: auditContext,
  });

  return toAttendanceLogPublic(log, true);
};

export const mapAttendanceError = (error: unknown): AttendanceServiceError => {
  if (error instanceof AttendanceServiceError) {
    return error;
  }
  if (error instanceof LeaveServiceError) {
    return new AttendanceServiceError(error.message, error.statusCode);
  }
  throw error;
};
