import mongoose from 'mongoose';
import type { ServerEnv } from '../../config/env.js';
import type { UserRole } from '../../types/index.js';
import { hasPermission } from '../../utils/permissions.js';
import { writeAuditLog, type AuditContext } from '../audit/audit.service.js';
import { User } from '../admin/user.model.js';
import { Tenant } from '../auth/tenant.model.js';
import { Employee, type IEmployeeDocument } from '../employees/employee.model.js';
import { AttendanceLog } from '../attendance/attendance.model.js';
import { resolveEmployeeForUser, LeaveServiceError } from '../leave/leave.service.js';
import { createInAppNotification } from '../notifications/notification.service.js';
import {
  sendTimesheetApprovedEmail,
  sendTimesheetDeclinedEmail,
  sendTimesheetSubmittedEmail,
} from '../notifications/email.service.js';
import {
  Timesheet,
  type ITimesheetDocument,
  type ITimesheetEntry,
  type TimesheetStatus,
} from './timesheet.model.js';
import type {
  GenerateTimesheetInput,
  ListMyTimesheetsQuery,
  ListTimesheetsQuery,
  PatchTimesheetInput,
} from './timesheet.validation.js';
import {
  DEFAULT_OVERTIME_THRESHOLD_HOURS,
  formatDateOnly,
  getWeekDays,
  getWeekEndExclusive,
  parseDateOnly,
  parseWeekOf,
  roundHours,
} from './timesheet.utils.js';

export class TimesheetServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'TimesheetServiceError';
  }
}

interface AccessContext {
  userId: string;
  userEmail: string;
  role: UserRole;
}

export interface TimesheetEmployeeSummary {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface TimesheetEntryPublic {
  date: string;
  hours: number;
  source: 'attendance' | 'manual';
  attendanceLogId?: string | null;
  notes?: string;
}

export interface TimesheetPublic {
  id: string;
  employeeId: string;
  employee?: TimesheetEmployeeSummary;
  weekOf: string;
  entries: TimesheetEntryPublic[];
  totalHours: number;
  overtimeHours: number;
  overtimeThresholdHours: number;
  status: TimesheetStatus;
  submittedAt?: string;
  approverId?: string;
  approvedAt?: string;
  declineReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTimesheets {
  timesheets: TimesheetPublic[];
  total: number;
  page: number;
  limit: number;
}

const canApproveAll = (role: UserRole): boolean => hasPermission(role, 'timesheet:approve');

const canApproveTeam = (role: UserRole): boolean => hasPermission(role, 'timesheet:approve:team');

const toEmployeeSummary = (employee: IEmployeeDocument): TimesheetEmployeeSummary => ({
  id: employee._id.toString(),
  firstName: employee.firstName,
  lastName: employee.lastName,
  email: employee.email,
});

const getOvertimeThreshold = async (tenantId: string): Promise<number> => {
  const tenant = await Tenant.findById(tenantId).select('overtimeThresholdHours');
  return tenant?.overtimeThresholdHours ?? DEFAULT_OVERTIME_THRESHOLD_HOURS;
};

const recalculateTotals = (timesheet: ITimesheetDocument, threshold: number): void => {
  const total = timesheet.entries.reduce((sum, entry) => sum + entry.hours, 0);
  timesheet.totalHours = roundHours(total);
  timesheet.overtimeHours = roundHours(Math.max(0, total - threshold));
};

const toEntryPublic = (entry: ITimesheetEntry): TimesheetEntryPublic => ({
  date: formatDateOnly(entry.date),
  hours: entry.hours,
  source: entry.source,
  attendanceLogId: entry.attendanceLogId?.toString() ?? null,
  notes: entry.notes ?? '',
});

const timesheetAuditSnapshot = (timesheet: ITimesheetDocument): Record<string, unknown> => ({
  employeeId: timesheet.employeeId.toString(),
  weekOf: formatDateOnly(timesheet.weekOf),
  totalHours: timesheet.totalHours,
  overtimeHours: timesheet.overtimeHours,
  status: timesheet.status,
  entries: timesheet.entries.map(toEntryPublic),
});

const toTimesheetPublic = async (
  timesheet: ITimesheetDocument,
  threshold: number,
  includeEmployee = false
): Promise<TimesheetPublic> => {
  let employee: TimesheetEmployeeSummary | undefined;

  if (includeEmployee) {
    const record = await Employee.findById(timesheet.employeeId);
    if (record) {
      employee = toEmployeeSummary(record);
    }
  }

  return {
    id: timesheet._id.toString(),
    employeeId: timesheet.employeeId.toString(),
    employee,
    weekOf: formatDateOnly(timesheet.weekOf),
    entries: timesheet.entries.map(toEntryPublic),
    totalHours: timesheet.totalHours,
    overtimeHours: timesheet.overtimeHours,
    overtimeThresholdHours: threshold,
    status: timesheet.status,
    submittedAt: timesheet.submittedAt?.toISOString(),
    approverId: timesheet.approverId?.toString(),
    approvedAt: timesheet.approvedAt?.toISOString(),
    declineReason: timesheet.declineReason ?? undefined,
    createdAt: timesheet.createdAt.toISOString(),
    updatedAt: timesheet.updatedAt.toISOString(),
  };
};

const buildAttendanceEntries = async (
  tenantId: string,
  employeeId: mongoose.Types.ObjectId,
  weekOf: Date,
  weekEnd: Date
): Promise<ITimesheetEntry[]> => {
  const logs = await AttendanceLog.find({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    employeeId,
    clockIn: { $gte: weekOf, $lt: weekEnd },
    clockOut: { $ne: null },
  });

  const hoursByDay = new Map<string, { hours: number; logId: string | null }>();

  for (const log of logs) {
    const dayKey = formatDateOnly(log.clockIn);
    const hours = (log.clockOut!.getTime() - log.clockIn.getTime()) / 3600000;
    const existing = hoursByDay.get(dayKey) ?? { hours: 0, logId: null };
    existing.hours += hours;
    existing.logId = log._id.toString();
    hoursByDay.set(dayKey, existing);
  }

  return getWeekDays(weekOf).map((day) => {
    const dayKey = formatDateOnly(day);
    const data = hoursByDay.get(dayKey);
    return {
      date: day,
      hours: roundHours(data?.hours ?? 0),
      source: 'attendance' as const,
      attendanceLogId: data?.logId ? new mongoose.Types.ObjectId(data.logId) : null,
      notes: '',
    };
  });
};

const mergeEntries = (
  existingEntries: ITimesheetEntry[],
  attendanceEntries: ITimesheetEntry[]
): ITimesheetEntry[] => {
  const manualByDay = new Map<string, ITimesheetEntry>();
  for (const entry of existingEntries) {
    if (entry.source === 'manual') {
      manualByDay.set(formatDateOnly(entry.date), entry);
    }
  }

  return attendanceEntries.map((attendanceEntry) => {
    const dayKey = formatDateOnly(attendanceEntry.date);
    return manualByDay.get(dayKey) ?? attendanceEntry;
  });
};

const assertOwnTimesheet = async (
  tenantId: string,
  timesheet: ITimesheetDocument,
  access: AccessContext
): Promise<IEmployeeDocument> => {
  const employee = await resolveEmployeeForUser(tenantId, access.userId, access.userEmail);
  if (timesheet.employeeId.toString() !== employee._id.toString()) {
    throw new TimesheetServiceError('Insufficient permissions', 403);
  }
  return employee;
};

const assertCanApproveTimesheet = async (
  tenantId: string,
  timesheet: ITimesheetDocument,
  access: AccessContext
): Promise<void> => {
  if (timesheet.status !== 'submitted') {
    throw new TimesheetServiceError('Only submitted timesheets can be approved or declined', 400);
  }

  if (canApproveAll(access.role)) {
    return;
  }

  if (canApproveTeam(access.role)) {
    const manager = await resolveEmployeeForUser(tenantId, access.userId, access.userEmail);
    const employee = await Employee.findById(timesheet.employeeId);

    if (!employee) {
      throw new TimesheetServiceError('Employee not found', 404);
    }

    const isDirectReport = employee.managerId?.toString() === manager._id.toString();
    if (!isDirectReport) {
      throw new TimesheetServiceError('Insufficient permissions', 403);
    }
    return;
  }

  throw new TimesheetServiceError('Insufficient permissions', 403);
};

const findApproverRecipientEmail = async (
  tenantId: string,
  employee: IEmployeeDocument
): Promise<string | null> => {
  if (employee.managerId) {
    const manager = await Employee.findOne({
      _id: employee.managerId,
      tenantId: new mongoose.Types.ObjectId(tenantId),
    });
    if (manager?.email) {
      return manager.email;
    }
  }

  const hrUser = await User.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    role: { $in: ['hr_manager', 'company_admin'] },
  }).sort({ createdAt: 1 });

  return hrUser?.email ?? null;
};

const findApproverUserIds = async (
  tenantId: string,
  employee: IEmployeeDocument
): Promise<string[]> => {
  if (employee.managerId) {
    const manager = await Employee.findOne({
      _id: employee.managerId,
      tenantId: new mongoose.Types.ObjectId(tenantId),
    });
    if (manager?.userId) {
      return [manager.userId.toString()];
    }
  }

  const hrUsers = await User.find({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    role: { $in: ['hr_manager', 'company_admin'] },
    isActive: true,
  }).select('_id');

  return hrUsers.map((user) => user._id.toString());
};

const getTeamEmployeeIds = async (
  tenantId: string,
  access: AccessContext
): Promise<mongoose.Types.ObjectId[] | null> => {
  if (canApproveAll(access.role)) {
    return null;
  }

  const manager = await resolveEmployeeForUser(tenantId, access.userId, access.userEmail);
  const reports = await Employee.find({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    managerId: manager._id,
    status: 'active',
  }).select('_id');

  return reports.map((report) => report._id);
};

export const generateTimesheet = async (
  tenantId: string,
  input: GenerateTimesheetInput,
  access: AccessContext,
  audit?: AuditContext
): Promise<TimesheetPublic> => {
  let weekOf: Date;
  try {
    weekOf = parseWeekOf(input.weekOf);
  } catch {
    throw new TimesheetServiceError('weekOf must be a Monday in YYYY-MM-DD format', 400);
  }

  const employee = await resolveEmployeeForUser(tenantId, access.userId, access.userEmail);
  const weekEnd = getWeekEndExclusive(weekOf);
  const threshold = await getOvertimeThreshold(tenantId);

  const attendanceEntries = await buildAttendanceEntries(
    tenantId,
    employee._id,
    weekOf,
    weekEnd
  );

  let timesheet = await Timesheet.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    employeeId: employee._id,
    weekOf,
  });

  if (timesheet && !['draft', 'declined'].includes(timesheet.status)) {
    throw new TimesheetServiceError('Cannot regenerate a submitted or approved timesheet', 400);
  }

  const before = timesheet ? timesheetAuditSnapshot(timesheet) : null;
  const entries = timesheet ? mergeEntries(timesheet.entries, attendanceEntries) : attendanceEntries;

  if (timesheet) {
    timesheet.entries = entries;
    timesheet.status = 'draft';
    timesheet.submittedAt = null;
    timesheet.approverId = null;
    timesheet.approvedAt = null;
    timesheet.declineReason = null;
    recalculateTotals(timesheet, threshold);
    await timesheet.save();
  } else {
    timesheet = await Timesheet.create({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      employeeId: employee._id,
      weekOf,
      entries,
      totalHours: 0,
      overtimeHours: 0,
      status: 'draft',
    });
    recalculateTotals(timesheet, threshold);
    await timesheet.save();
  }

  void writeAuditLog({
    tenantId,
    userId: access.userId,
    action: before ? 'update' : 'create',
    entityType: 'Timesheet',
    entityId: timesheet._id.toString(),
    before,
    after: timesheetAuditSnapshot(timesheet),
    context: audit,
  });

  return toTimesheetPublic(timesheet, threshold);
};

export const listMyTimesheets = async (
  tenantId: string,
  query: ListMyTimesheetsQuery,
  access: AccessContext
): Promise<PaginatedTimesheets> => {
  const employee = await resolveEmployeeForUser(tenantId, access.userId, access.userEmail);
  const threshold = await getOvertimeThreshold(tenantId);
  const filter = {
    tenantId: new mongoose.Types.ObjectId(tenantId),
    employeeId: employee._id,
  };

  const skip = (query.page - 1) * query.limit;
  const [docs, total] = await Promise.all([
    Timesheet.find(filter).sort({ weekOf: -1 }).skip(skip).limit(query.limit),
    Timesheet.countDocuments(filter),
  ]);

  return {
    timesheets: await Promise.all(docs.map((doc) => toTimesheetPublic(doc, threshold))),
    total,
    page: query.page,
    limit: query.limit,
  };
};

export const getMyTimesheetForWeek = async (
  tenantId: string,
  weekOfStr: string,
  access: AccessContext
): Promise<TimesheetPublic | null> => {
  let weekOf: Date;
  try {
    weekOf = parseWeekOf(weekOfStr);
  } catch {
    throw new TimesheetServiceError('weekOf must be a Monday in YYYY-MM-DD format', 400);
  }

  const employee = await resolveEmployeeForUser(tenantId, access.userId, access.userEmail);
  const threshold = await getOvertimeThreshold(tenantId);

  const timesheet = await Timesheet.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    employeeId: employee._id,
    weekOf,
  });

  if (!timesheet) {
    return null;
  }

  return toTimesheetPublic(timesheet, threshold);
};

export const listTimesheets = async (
  tenantId: string,
  query: ListTimesheetsQuery,
  access: AccessContext
): Promise<PaginatedTimesheets> => {
  if (!canApproveAll(access.role) && !canApproveTeam(access.role)) {
    throw new TimesheetServiceError('Insufficient permissions', 403);
  }

  const threshold = await getOvertimeThreshold(tenantId);
  const teamIds = await getTeamEmployeeIds(tenantId, access);

  const filter: Record<string, unknown> = {
    tenantId: new mongoose.Types.ObjectId(tenantId),
  };

  if (query.status) {
    filter.status = query.status;
  } else {
    filter.status = 'submitted';
  }

  if (teamIds) {
    if (teamIds.length === 0) {
      return { timesheets: [], total: 0, page: query.page, limit: query.limit };
    }
    filter.employeeId = { $in: teamIds };
  }

  const skip = (query.page - 1) * query.limit;
  const [docs, total] = await Promise.all([
    Timesheet.find(filter).sort({ submittedAt: -1 }).skip(skip).limit(query.limit),
    Timesheet.countDocuments(filter),
  ]);

  return {
    timesheets: await Promise.all(docs.map((doc) => toTimesheetPublic(doc, threshold, true))),
    total,
    page: query.page,
    limit: query.limit,
  };
};

export const patchTimesheet = async (
  tenantId: string,
  timesheetId: string,
  input: PatchTimesheetInput,
  access: AccessContext,
  audit?: AuditContext
): Promise<TimesheetPublic> => {
  const timesheet = await Timesheet.findOne({
    _id: new mongoose.Types.ObjectId(timesheetId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!timesheet) {
    throw new TimesheetServiceError('Timesheet not found', 404);
  }

  await assertOwnTimesheet(tenantId, timesheet, access);

  if (!['draft', 'declined'].includes(timesheet.status)) {
    throw new TimesheetServiceError('Only draft or declined timesheets can be edited', 400);
  }

  const weekEnd = getWeekEndExclusive(timesheet.weekOf);
  const before = timesheetAuditSnapshot(timesheet);
  const threshold = await getOvertimeThreshold(tenantId);

  for (const patchEntry of input.entries) {
    let entryDate: Date;
    try {
      entryDate = parseDateOnly(patchEntry.date);
    } catch {
      throw new TimesheetServiceError('Invalid entry date format', 400);
    }

    if (entryDate < timesheet.weekOf || entryDate >= weekEnd) {
      throw new TimesheetServiceError('Entry date must fall within the timesheet week', 400);
    }

    const dayKey = patchEntry.date;
    const idx = timesheet.entries.findIndex((entry) => formatDateOnly(entry.date) === dayKey);
    const updatedEntry: ITimesheetEntry = {
      date: entryDate,
      hours: roundHours(patchEntry.hours),
      source: 'manual',
      attendanceLogId: null,
      notes: patchEntry.notes ?? '',
    };

    if (idx >= 0) {
      timesheet.entries[idx] = updatedEntry;
    } else {
      timesheet.entries.push(updatedEntry);
    }
  }

  timesheet.entries.sort((a, b) => a.date.getTime() - b.date.getTime());
  timesheet.status = 'draft';
  timesheet.submittedAt = null;
  timesheet.approverId = null;
  timesheet.approvedAt = null;
  timesheet.declineReason = null;
  recalculateTotals(timesheet, threshold);
  await timesheet.save();

  void writeAuditLog({
    tenantId,
    userId: access.userId,
    action: 'update',
    entityType: 'Timesheet',
    entityId: timesheet._id.toString(),
    before,
    after: timesheetAuditSnapshot(timesheet),
    context: audit,
  });

  return toTimesheetPublic(timesheet, threshold);
};

export const submitTimesheet = async (
  tenantId: string,
  timesheetId: string,
  access: AccessContext,
  env: ServerEnv,
  audit?: AuditContext
): Promise<TimesheetPublic> => {
  const timesheet = await Timesheet.findOne({
    _id: new mongoose.Types.ObjectId(timesheetId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!timesheet) {
    throw new TimesheetServiceError('Timesheet not found', 404);
  }

  const employee = await assertOwnTimesheet(tenantId, timesheet, access);

  if (timesheet.status !== 'draft') {
    throw new TimesheetServiceError('Only draft timesheets can be submitted', 400);
  }

  if (!timesheet.entries.some((entry) => entry.hours > 0)) {
    throw new TimesheetServiceError('Timesheet must have at least one day with hours greater than zero', 400);
  }

  const before = timesheetAuditSnapshot(timesheet);
  const threshold = await getOvertimeThreshold(tenantId);

  timesheet.status = 'submitted';
  timesheet.submittedAt = new Date();
  await timesheet.save();

  const recipientEmail = await findApproverRecipientEmail(tenantId, employee);
  if (recipientEmail) {
    void sendTimesheetSubmittedEmail(env, {
      to: recipientEmail,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      weekOf: formatDateOnly(timesheet.weekOf),
      totalHours: timesheet.totalHours,
    });
  }

  const approverUserIds = await findApproverUserIds(tenantId, employee);
  for (const approverUserId of approverUserIds) {
    void createInAppNotification({
      tenantId,
      userId: approverUserId,
      type: 'timesheet_submitted',
      title: 'Timesheet submitted',
      body: `${employee.firstName} ${employee.lastName} submitted a timesheet for week of ${formatDateOnly(timesheet.weekOf)} (${timesheet.totalHours}h).`,
      metadata: { timesheetId: timesheet._id.toString(), employeeId: employee._id.toString() },
    });
  }

  void writeAuditLog({
    tenantId,
    userId: access.userId,
    action: 'update',
    entityType: 'Timesheet',
    entityId: timesheet._id.toString(),
    before,
    after: timesheetAuditSnapshot(timesheet),
    context: audit,
  });

  return toTimesheetPublic(timesheet, threshold);
};

export const approveTimesheet = async (
  tenantId: string,
  timesheetId: string,
  access: AccessContext,
  env: ServerEnv,
  audit?: AuditContext
): Promise<TimesheetPublic> => {
  const timesheet = await Timesheet.findOne({
    _id: new mongoose.Types.ObjectId(timesheetId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!timesheet) {
    throw new TimesheetServiceError('Timesheet not found', 404);
  }

  await assertCanApproveTimesheet(tenantId, timesheet, access);

  const before = timesheetAuditSnapshot(timesheet);
  const threshold = await getOvertimeThreshold(tenantId);

  timesheet.status = 'approved';
  timesheet.approverId = new mongoose.Types.ObjectId(access.userId);
  timesheet.approvedAt = new Date();
  await timesheet.save();

  const employee = await Employee.findById(timesheet.employeeId);
  const approver = await User.findById(access.userId);

  if (employee?.email) {
    void sendTimesheetApprovedEmail(env, {
      to: employee.email,
      weekOf: formatDateOnly(timesheet.weekOf),
      totalHours: timesheet.totalHours,
      approverName: approver
        ? `${approver.firstName ?? ''} ${approver.lastName ?? ''}`.trim() || approver.email
        : 'Approver',
    });
  }

  if (employee?.userId) {
    void createInAppNotification({
      tenantId,
      userId: employee.userId.toString(),
      type: 'timesheet_approved',
      title: 'Timesheet approved',
      body: `Your timesheet for week of ${formatDateOnly(timesheet.weekOf)} was approved (${timesheet.totalHours}h).`,
      metadata: { timesheetId: timesheet._id.toString() },
    });
  }

  void writeAuditLog({
    tenantId,
    userId: access.userId,
    action: 'update',
    entityType: 'Timesheet',
    entityId: timesheet._id.toString(),
    before,
    after: timesheetAuditSnapshot(timesheet),
    context: audit,
  });

  return toTimesheetPublic(timesheet, threshold, true);
};

export const declineTimesheet = async (
  tenantId: string,
  timesheetId: string,
  declineReason: string | undefined,
  access: AccessContext,
  env: ServerEnv,
  audit?: AuditContext
): Promise<TimesheetPublic> => {
  const timesheet = await Timesheet.findOne({
    _id: new mongoose.Types.ObjectId(timesheetId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!timesheet) {
    throw new TimesheetServiceError('Timesheet not found', 404);
  }

  await assertCanApproveTimesheet(tenantId, timesheet, access);

  const before = timesheetAuditSnapshot(timesheet);
  const threshold = await getOvertimeThreshold(tenantId);

  timesheet.status = 'declined';
  timesheet.approverId = new mongoose.Types.ObjectId(access.userId);
  timesheet.approvedAt = new Date();
  timesheet.declineReason = declineReason ?? null;
  await timesheet.save();

  const employee = await Employee.findById(timesheet.employeeId);

  if (employee?.email) {
    void sendTimesheetDeclinedEmail(env, {
      to: employee.email,
      weekOf: formatDateOnly(timesheet.weekOf),
      declineReason,
    });
  }

  if (employee?.userId) {
    void createInAppNotification({
      tenantId,
      userId: employee.userId.toString(),
      type: 'timesheet_declined',
      title: 'Timesheet declined',
      body: `Your timesheet for week of ${formatDateOnly(timesheet.weekOf)} was declined.${declineReason ? ` Reason: ${declineReason}` : ''}`,
      metadata: { timesheetId: timesheet._id.toString() },
    });
  }

  void writeAuditLog({
    tenantId,
    userId: access.userId,
    action: 'update',
    entityType: 'Timesheet',
    entityId: timesheet._id.toString(),
    before,
    after: timesheetAuditSnapshot(timesheet),
    context: audit,
  });

  return toTimesheetPublic(timesheet, threshold, true);
};

export const mapTimesheetError = (error: unknown): TimesheetServiceError => {
  if (error instanceof TimesheetServiceError) {
    return error;
  }
  if (error instanceof LeaveServiceError) {
    return new TimesheetServiceError(error.message, error.statusCode);
  }
  throw error;
};
