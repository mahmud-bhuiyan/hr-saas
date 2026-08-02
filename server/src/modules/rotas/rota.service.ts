import mongoose from 'mongoose';
import type { ServerEnv } from '../../config/env.js';
import type { UserRole } from '../../types/index.js';
import { hasPermission } from '../../utils/permissions.js';
import { shiftAuditSnapshot } from '../../utils/audit-snapshot.js';
import { writeAuditLog, type AuditContext } from '../audit/audit.service.js';
import { Employee, type IEmployeeDocument } from '../employees/employee.model.js';
import { LeaveRequest } from '../leave/leave.model.js';
import { resolveEmployeeForUser, LeaveServiceError } from '../leave/leave.service.js';
import {
  assertActiveWorkLocation,
  LocationServiceError,
} from '../locations/location.service.js';
import { WorkLocation } from '../locations/location.model.js';
import { User } from '../admin/user.model.js';
import {
  sendRotaPublishedEmail,
  sendShiftClaimedEmail,
} from '../notifications/email.service.js';
import { createInAppNotification } from '../notifications/notification.service.js';
import { Shift, type IShiftDocument, type ShiftStatus } from './shift.model.js';
import type { CopyWeekInput, CreateShiftInput, PatchShiftInput } from './rota.validation.js';
import {
  formatDateOnly,
  getWeekDateStrings,
  parseDateOnly,
  parseWeekOf,
  timesOverlap,
} from './rota.utils.js';

export class RotaServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'RotaServiceError';
  }
}

interface AccessContext {
  userId: string;
  userEmail: string;
  role: UserRole;
}

export interface ShiftEmployeeSummary {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface ShiftLocationSummary {
  id: string;
  name: string;
}

export interface ShiftPublic {
  id: string;
  employeeId: string | null;
  employee?: ShiftEmployeeSummary;
  date: string;
  startTime: string;
  endTime: string;
  role?: string;
  locationId: string;
  location?: ShiftLocationSummary;
  status: ShiftStatus;
  publishedAt?: string;
  claimedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WeekRotaPublic {
  weekOf: string;
  shifts: ShiftPublic[];
}

export interface PublishRotaResult {
  weekOf: string;
  publishedCount: number;
}

export interface CopyRotaResult {
  weekOf: string;
  copiedCount: number;
}

const canReadAll = (role: UserRole): boolean => hasPermission(role, 'rota:read');

const canManageAll = (role: UserRole): boolean => hasPermission(role, 'employee:read');

const canManageTeam = (role: UserRole): boolean =>
  hasPermission(role, 'rota:manage') && hasPermission(role, 'employee:read:team');

const toEmployeeSummary = (employee: IEmployeeDocument): ShiftEmployeeSummary => ({
  id: employee._id.toString(),
  firstName: employee.firstName,
  lastName: employee.lastName,
  email: employee.email,
});

const toShiftPublic = (
  shift: IShiftDocument,
  employee?: IEmployeeDocument | null,
  location?: { _id: mongoose.Types.ObjectId; name: string } | null
): ShiftPublic => ({
  id: shift._id.toString(),
  employeeId: shift.employeeId?.toString() ?? null,
  employee: employee ? toEmployeeSummary(employee) : undefined,
  date: shift.date,
  startTime: shift.startTime,
  endTime: shift.endTime,
  role: shift.role,
  locationId: shift.locationId.toString(),
  location: location
    ? { id: location._id.toString(), name: location.name }
    : undefined,
  status: shift.status,
  publishedAt: shift.publishedAt?.toISOString(),
  claimedBy: shift.claimedBy?.toString() ?? null,
  createdAt: shift.createdAt.toISOString(),
  updatedAt: shift.updatedAt.toISOString(),
});

const getTeamEmployeeIds = async (
  tenantId: string,
  managerEmployeeId: string
): Promise<string[]> => {
  const reports = await Employee.find({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    managerId: new mongoose.Types.ObjectId(managerEmployeeId),
  }).select('_id');

  return reports.map((report) => report._id.toString());
};

const assertActiveEmployee = async (
  tenantId: string,
  employeeId: string
): Promise<IEmployeeDocument> => {
  const employee = await Employee.findOne({
    _id: new mongoose.Types.ObjectId(employeeId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
    status: 'active',
  });

  if (!employee) {
    throw new RotaServiceError('Employee not found or inactive', 400);
  }

  return employee;
};

const assertCanManageEmployee = async (
  tenantId: string,
  access: AccessContext,
  employeeId: string | null | undefined
): Promise<void> => {
  if (!employeeId) {
    return;
  }

  if (canManageAll(access.role)) {
    return;
  }

  if (canManageTeam(access.role)) {
    const selfRecord = await resolveEmployeeForUser(tenantId, access.userId, access.userEmail);
    const teamIds = await getTeamEmployeeIds(tenantId, selfRecord._id.toString());

    if (!teamIds.includes(employeeId)) {
      throw new RotaServiceError('You can only manage shifts for your direct reports', 403);
    }

    return;
  }

  throw new RotaServiceError('Forbidden', 403);
};

const assertNoLeaveConflict = async (
  tenantId: string,
  employeeId: string,
  date: string
): Promise<void> => {
  const shiftDate = parseDateOnly(date);

  const conflictingLeave = await LeaveRequest.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    employeeId: new mongoose.Types.ObjectId(employeeId),
    status: 'approved',
    startDate: { $lte: shiftDate },
    endDate: { $gte: shiftDate },
  });

  if (conflictingLeave) {
    throw new RotaServiceError('Shift overlaps with approved leave for this employee', 409);
  }
};

const assertNoDoubleBooking = async (
  tenantId: string,
  employeeId: string,
  date: string,
  startTime: string,
  endTime: string,
  excludeShiftId?: string
): Promise<void> => {
  const existingShifts = await Shift.find({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    employeeId: new mongoose.Types.ObjectId(employeeId),
    date,
  });

  for (const existing of existingShifts) {
    if (excludeShiftId && existing._id.toString() === excludeShiftId) {
      continue;
    }

    if (timesOverlap(startTime, endTime, existing.startTime, existing.endTime)) {
      throw new RotaServiceError('Employee already has an overlapping shift on this date', 409);
    }
  }
};

const validateShiftAssignment = async (
  tenantId: string,
  access: AccessContext,
  employeeId: string | null | undefined,
  date: string,
  startTime: string,
  endTime: string,
  locationId: string,
  excludeShiftId?: string
): Promise<void> => {
  try {
    await assertActiveWorkLocation(tenantId, locationId);
  } catch (error) {
    if (error instanceof LocationServiceError) {
      throw new RotaServiceError(error.message, error.statusCode);
    }
    throw error;
  }

  await assertCanManageEmployee(tenantId, access, employeeId ?? null);

  if (!employeeId) {
    return;
  }

  await assertActiveEmployee(tenantId, employeeId);
  await assertNoLeaveConflict(tenantId, employeeId, date);
  await assertNoDoubleBooking(tenantId, employeeId, date, startTime, endTime, excludeShiftId);
};

const buildWeekFilter = async (
  tenantId: string,
  weekOf: string,
  access: AccessContext
): Promise<Record<string, unknown>> => {
  const weekDates = getWeekDateStrings(weekOf);

  const filter: Record<string, unknown> = {
    tenantId: new mongoose.Types.ObjectId(tenantId),
    date: { $in: weekDates },
  };

  if (canReadAll(access.role) && canManageAll(access.role)) {
    return filter;
  }

  if (canReadAll(access.role) && canManageTeam(access.role)) {
    const selfRecord = await resolveEmployeeForUser(tenantId, access.userId, access.userEmail);
    const teamIds = await getTeamEmployeeIds(tenantId, selfRecord._id.toString());

    filter.$or = [
      { employeeId: { $in: teamIds.map((id) => new mongoose.Types.ObjectId(id)) } },
      { employeeId: null },
      { status: 'open' },
    ];

    return filter;
  }

  try {
    const selfRecord = await resolveEmployeeForUser(tenantId, access.userId, access.userEmail);

    if (hasPermission(access.role, 'rota:claim:own')) {
      filter.$or = [
        { employeeId: selfRecord._id },
        { status: 'open', employeeId: null },
      ];
    } else {
      filter.employeeId = selfRecord._id;
    }
  } catch (error) {
    if (error instanceof LeaveServiceError) {
      filter._id = new mongoose.Types.ObjectId('000000000000000000000000');
      return filter;
    }
    throw error;
  }

  return filter;
};

const loadShiftRelations = async (
  shifts: IShiftDocument[]
): Promise<Map<string, { employee?: IEmployeeDocument; location?: { _id: mongoose.Types.ObjectId; name: string } }>> => {
  const employeeIds = [
    ...new Set(
      shifts
        .map((shift) => shift.employeeId?.toString())
        .filter((id): id is string => Boolean(id))
    ),
  ];
  const locationIds = [...new Set(shifts.map((shift) => shift.locationId.toString()))];

  const [employees, locations] = await Promise.all([
    employeeIds.length
      ? Employee.find({ _id: { $in: employeeIds } })
      : Promise.resolve([]),
    locationIds.length
      ? WorkLocation.find({ _id: { $in: locationIds } }).select('_id name')
      : Promise.resolve([]),
  ]);

  const employeeMap = new Map(employees.map((employee) => [employee._id.toString(), employee]));
  const locationMap = new Map(locations.map((location) => [location._id.toString(), location]));

  const relationMap = new Map<
    string,
    { employee?: IEmployeeDocument; location?: { _id: mongoose.Types.ObjectId; name: string } }
  >();

  for (const shift of shifts) {
    relationMap.set(shift._id.toString(), {
      employee: shift.employeeId
        ? employeeMap.get(shift.employeeId.toString())
        : undefined,
      location: locationMap.get(shift.locationId.toString()),
    });
  }

  return relationMap;
};

export const getRotaWeek = async (
  tenantId: string,
  weekOfStr: string,
  access: AccessContext
): Promise<WeekRotaPublic> => {
  let weekOf: string;

  try {
    weekOf = formatDateOnly(parseWeekOf(weekOfStr));
  } catch {
    throw new RotaServiceError('weekOf must be a Monday (YYYY-MM-DD)', 400);
  }

  const filter = await buildWeekFilter(tenantId, weekOf, access);
  const shifts = await Shift.find(filter).sort({ date: 1, startTime: 1 });
  const relations = await loadShiftRelations(shifts);

  return {
    weekOf,
    shifts: shifts.map((shift) => {
      const relation = relations.get(shift._id.toString());
      return toShiftPublic(shift, relation?.employee, relation?.location ?? null);
    }),
  };
};

export const createShift = async (
  tenantId: string,
  input: CreateShiftInput,
  userId: string,
  access: AccessContext,
  audit?: AuditContext
): Promise<ShiftPublic> => {
  const employeeId = input.employeeId ?? null;

  await validateShiftAssignment(
    tenantId,
    access,
    employeeId,
    input.date,
    input.startTime,
    input.endTime,
    input.locationId
  );

  const shift = await Shift.create({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    employeeId: employeeId ? new mongoose.Types.ObjectId(employeeId) : null,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    role: input.role?.trim() || undefined,
    locationId: new mongoose.Types.ObjectId(input.locationId),
    status: 'draft',
    createdBy: new mongoose.Types.ObjectId(userId),
    updatedBy: new mongoose.Types.ObjectId(userId),
  });

  void writeAuditLog({
    tenantId,
    userId,
    action: 'create',
    entityType: 'Shift',
    entityId: shift._id.toString(),
    after: shiftAuditSnapshot(shift),
    context: audit,
  });

  const [employee, location] = await Promise.all([
    employeeId ? Employee.findById(employeeId) : Promise.resolve(null),
    WorkLocation.findById(input.locationId).select('_id name'),
  ]);

  return toShiftPublic(shift, employee, location);
};

export const patchShift = async (
  tenantId: string,
  shiftId: string,
  input: PatchShiftInput,
  userId: string,
  access: AccessContext,
  audit?: AuditContext
): Promise<ShiftPublic> => {
  const shift = await Shift.findOne({
    _id: new mongoose.Types.ObjectId(shiftId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!shift) {
    throw new RotaServiceError('Shift not found', 404);
  }

  const beforeSnapshot = shiftAuditSnapshot(shift);

  const nextEmployeeId =
    input.employeeId !== undefined ? input.employeeId : (shift.employeeId?.toString() ?? null);
  const nextDate = input.date ?? shift.date;
  const nextStartTime = input.startTime ?? shift.startTime;
  const nextEndTime = input.endTime ?? shift.endTime;
  const nextLocationId = input.locationId ?? shift.locationId.toString();

  if (input.endTime !== undefined || input.startTime !== undefined) {
    if (nextEndTime <= nextStartTime) {
      throw new RotaServiceError('endTime must be after startTime', 400);
    }
  }

  await validateShiftAssignment(
    tenantId,
    access,
    nextEmployeeId,
    nextDate,
    nextStartTime,
    nextEndTime,
    nextLocationId,
    shiftId
  );

  if (input.employeeId !== undefined) {
    shift.employeeId = input.employeeId
      ? new mongoose.Types.ObjectId(input.employeeId)
      : null;
  }

  if (input.date !== undefined) {
    shift.date = input.date;
  }

  if (input.startTime !== undefined) {
    shift.startTime = input.startTime;
  }

  if (input.endTime !== undefined) {
    shift.endTime = input.endTime;
  }

  if (input.role !== undefined) {
    shift.role = input.role.trim() || undefined;
  }

  if (input.locationId !== undefined) {
    shift.locationId = new mongoose.Types.ObjectId(input.locationId);
  }

  if (input.status !== undefined) {
    shift.status = input.status;
    if (input.status === 'published' || input.status === 'open') {
      shift.publishedAt = shift.publishedAt ?? new Date();
    }
  }

  shift.updatedBy = new mongoose.Types.ObjectId(userId);
  await shift.save();

  void writeAuditLog({
    tenantId,
    userId,
    action: 'update',
    entityType: 'Shift',
    entityId: shift._id.toString(),
    before: beforeSnapshot,
    after: shiftAuditSnapshot(shift),
    context: audit,
  });

  const [employee, location] = await Promise.all([
    shift.employeeId ? Employee.findById(shift.employeeId) : Promise.resolve(null),
    WorkLocation.findById(shift.locationId).select('_id name'),
  ]);

  return toShiftPublic(shift, employee, location);
};

export const deleteShift = async (
  tenantId: string,
  shiftId: string,
  userId: string,
  access: AccessContext,
  audit?: AuditContext
): Promise<void> => {
  const shift = await Shift.findOne({
    _id: new mongoose.Types.ObjectId(shiftId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!shift) {
    throw new RotaServiceError('Shift not found', 404);
  }

  if (shift.status !== 'draft') {
    throw new RotaServiceError('Only draft shifts can be deleted', 400);
  }

  await assertCanManageEmployee(
    tenantId,
    access,
    shift.employeeId?.toString() ?? null
  );

  const beforeSnapshot = shiftAuditSnapshot(shift);

  await Shift.deleteOne({ _id: shift._id });

  void writeAuditLog({
    tenantId,
    userId,
    action: 'delete',
    entityType: 'Shift',
    entityId: shift._id.toString(),
    before: beforeSnapshot,
    context: audit,
  });
};

export const publishRotaWeek = async (
  tenantId: string,
  weekOfStr: string,
  userId: string,
  access: AccessContext,
  env: ServerEnv,
  audit?: AuditContext
): Promise<PublishRotaResult> => {
  if (!hasPermission(access.role, 'rota:manage')) {
    throw new RotaServiceError('Forbidden', 403);
  }

  let weekOf: string;

  try {
    weekOf = formatDateOnly(parseWeekOf(weekOfStr));
  } catch {
    throw new RotaServiceError('weekOf must be a Monday (YYYY-MM-DD)', 400);
  }

  const weekDates = getWeekDateStrings(weekOf);
  const draftShifts = await Shift.find({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    date: { $in: weekDates },
    status: 'draft',
  });

  for (const shift of draftShifts) {
    await assertCanManageEmployee(
      tenantId,
      access,
      shift.employeeId?.toString() ?? null
    );

    if (shift.employeeId) {
      await assertNoLeaveConflict(tenantId, shift.employeeId.toString(), shift.date);
    }
  }

  const publishedAt = new Date();
  let publishedCount = 0;
  const publishedByEmployee = new Map<string, number>();
  const openShifts: IShiftDocument[] = [];

  for (const shift of draftShifts) {
    const beforeSnapshot = shiftAuditSnapshot(shift);

    shift.status = shift.employeeId ? 'published' : 'open';
    shift.publishedAt = publishedAt;
    shift.updatedBy = new mongoose.Types.ObjectId(userId);
    await shift.save();
    publishedCount += 1;

    if (shift.employeeId) {
      const employeeKey = shift.employeeId.toString();
      publishedByEmployee.set(employeeKey, (publishedByEmployee.get(employeeKey) ?? 0) + 1);
    } else {
      openShifts.push(shift);
    }

    void writeAuditLog({
      tenantId,
      userId,
      action: 'update',
      entityType: 'Shift',
      entityId: shift._id.toString(),
      before: beforeSnapshot,
      after: shiftAuditSnapshot(shift),
      context: audit,
    });
  }

  if (publishedCount > 0) {
    void notifyRotaPublished(tenantId, weekOf, publishedByEmployee, openShifts, env);
  }

  return { weekOf, publishedCount };
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

const findActiveEmployeeUserIds = async (tenantId: string): Promise<string[]> => {
  const employees = await Employee.find({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    status: 'active',
    userId: { $ne: null },
  }).select('userId email');

  return employees
    .filter((employee) => employee.userId)
    .map((employee) => employee.userId!.toString());
};

const notifyRotaPublished = async (
  tenantId: string,
  weekOf: string,
  publishedByEmployee: Map<string, number>,
  openShifts: IShiftDocument[],
  env: ServerEnv
): Promise<void> => {
  const employeeIds = [...publishedByEmployee.keys()];
  const employees = employeeIds.length
    ? await Employee.find({ _id: { $in: employeeIds } })
    : [];

  for (const employee of employees) {
    if (!employee.userId) {
      continue;
    }

    const shiftCount = publishedByEmployee.get(employee._id.toString()) ?? 0;
    void createInAppNotification({
      tenantId,
      userId: employee.userId.toString(),
      type: 'rota_published',
      title: 'Rota published',
      body: `Your shifts for week of ${weekOf} are now available (${shiftCount} shift${shiftCount === 1 ? '' : 's'}).`,
      metadata: { weekOf, shiftCount },
    });

    if (employee.email) {
      void sendRotaPublishedEmail(env, {
        to: employee.email,
        weekOf,
        shiftCount,
      });
    }
  }

  if (openShifts.length === 0) {
    return;
  }

  const employeeUserIds = await findActiveEmployeeUserIds(tenantId);

  if (employeeUserIds.length > 0) {
    const openCount = openShifts.length;
    const summaryBody =
      openCount === 1
        ? `1 open shift is available for week of ${weekOf} — claim it in Rotas.`
        : `${openCount} open shifts are available for week of ${weekOf} — claim them in Rotas.`;

    for (const userId of employeeUserIds) {
      void createInAppNotification({
        tenantId,
        userId,
        type: 'open_shift_available',
        title: 'Open shifts available',
        body: summaryBody,
        metadata: { weekOf, openCount },
      });
    }
  }
};

export const claimShift = async (
  tenantId: string,
  shiftId: string,
  access: AccessContext,
  env: ServerEnv,
  audit?: AuditContext
): Promise<ShiftPublic> => {
  if (!hasPermission(access.role, 'rota:claim:own')) {
    throw new RotaServiceError('Forbidden', 403);
  }

  const shift = await Shift.findOne({
    _id: new mongoose.Types.ObjectId(shiftId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!shift) {
    throw new RotaServiceError('Shift not found', 404);
  }

  if (shift.status !== 'open' || shift.employeeId) {
    throw new RotaServiceError('Shift is not available to claim', 400);
  }

  const employee = await resolveEmployeeForUser(tenantId, access.userId, access.userEmail);
  const beforeSnapshot = shiftAuditSnapshot(shift);

  await assertNoLeaveConflict(tenantId, employee._id.toString(), shift.date);
  await assertNoDoubleBooking(
    tenantId,
    employee._id.toString(),
    shift.date,
    shift.startTime,
    shift.endTime,
    shiftId
  );

  shift.employeeId = employee._id;
  shift.claimedBy = employee._id;
  shift.status = 'published';
  shift.updatedBy = new mongoose.Types.ObjectId(access.userId);
  await shift.save();

  void writeAuditLog({
    tenantId,
    userId: access.userId,
    action: 'update',
    entityType: 'Shift',
    entityId: shift._id.toString(),
    before: beforeSnapshot,
    after: shiftAuditSnapshot(shift),
    context: audit,
  });

  const location = await WorkLocation.findById(shift.locationId).select('_id name');
  const locationName = location?.name ?? 'Unknown location';
  const employeeName = `${employee.firstName} ${employee.lastName}`;

  const approverUserIds = await findApproverUserIds(tenantId, employee);
  for (const approverUserId of approverUserIds) {
    void createInAppNotification({
      tenantId,
      userId: approverUserId,
      type: 'shift_claimed',
      title: 'Shift claimed',
      body: `${employeeName} claimed ${shift.date} ${shift.startTime}–${shift.endTime} at ${locationName}.`,
      metadata: { shiftId: shift._id.toString(), employeeId: employee._id.toString() },
    });
  }

  const hrUsers = await User.find({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    role: { $in: ['hr_manager', 'company_admin'] },
    isActive: true,
    email: { $exists: true, $ne: '' },
  }).select('email');

  for (const hrUser of hrUsers) {
    if (!hrUser.email) {
      continue;
    }

    void sendShiftClaimedEmail(env, {
      to: hrUser.email,
      employeeName,
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      locationName,
    });
  }

  return toShiftPublic(shift, employee, location);
};

export const copyRotaWeek = async (
  tenantId: string,
  input: CopyWeekInput,
  userId: string,
  access: AccessContext,
  audit?: AuditContext
): Promise<CopyRotaResult> => {
  if (!hasPermission(access.role, 'rota:manage')) {
    throw new RotaServiceError('Forbidden', 403);
  }

  let weekOf: string;

  try {
    weekOf = formatDateOnly(parseWeekOf(input.weekOf));
  } catch {
    throw new RotaServiceError('weekOf must be a Monday (YYYY-MM-DD)', 400);
  }

  const targetDates = getWeekDateStrings(weekOf);
  const sourceMonday = parseWeekOf(weekOf);
  sourceMonday.setUTCDate(sourceMonday.getUTCDate() - 7);
  const sourceWeekOf = formatDateOnly(sourceMonday);
  const sourceDates = getWeekDateStrings(sourceWeekOf);
  const dateMap = new Map(sourceDates.map((date, index) => [date, targetDates[index]!]));

  const sourceShifts = await Shift.find({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    date: { $in: sourceDates },
  }).sort({ date: 1, startTime: 1 });

  let copiedCount = 0;

  for (const source of sourceShifts) {
    await assertCanManageEmployee(
      tenantId,
      access,
      source.employeeId?.toString() ?? null
    );

    const targetDate = dateMap.get(source.date);
    if (!targetDate) {
      continue;
    }

    const shift = await Shift.create({
      tenantId: new mongoose.Types.ObjectId(tenantId),
      employeeId: source.employeeId ?? null,
      date: targetDate,
      startTime: source.startTime,
      endTime: source.endTime,
      role: source.role,
      locationId: source.locationId,
      status: 'draft',
      createdBy: new mongoose.Types.ObjectId(userId),
      updatedBy: new mongoose.Types.ObjectId(userId),
    });

    copiedCount += 1;

    void writeAuditLog({
      tenantId,
      userId,
      action: 'create',
      entityType: 'Shift',
      entityId: shift._id.toString(),
      after: shiftAuditSnapshot(shift),
      context: audit,
    });
  }

  return { weekOf, copiedCount };
};
