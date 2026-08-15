import mongoose from "mongoose";
import type { ServerEnv } from "../../config/env.js";
import type { UserRole } from "../../types/index.js";
import { hasPermission } from "../../utils/permissions.js";
import { leaveRequestAuditSnapshot } from "../../utils/audit-snapshot.js";
import { writeAuditLog, type AuditContext } from "../audit/audit.service.js";
import {
  Employee,
  type IEmployeeDocument,
} from "../employees/employee.model.js";
import { ensureEmployeeRecordForUser } from "../employees/employee.service.js";
import { User } from "../admin/user.model.js";
import {
  sendLeaveApprovedEmail,
  sendLeaveDeclinedEmail,
  sendLeaveSubmittedEmail,
} from "../notifications/email.service.js";
import {
  LeaveBalance,
  LeaveRequest,
  type ILeaveRequestDocument,
  type LeaveRequestStatus,
  type LeaveType,
} from "./leave.model.js";
import type {
  CreateLeaveRequestInput,
  LeaveCalendarQuery,
  ListLeaveRequestsQuery,
} from "./leave.validation.js";
import {
  calculateLeaveDays,
  dateRangesOverlap,
  formatDateString,
  parseDateString,
} from "./leave.utils.js";
import {
  ensureLeaveBalanceForYear,
  getTenantLeaveSettings,
} from "./leave-settings.service.js";
import { Shift } from "../rotas/shift.model.js";
import { WorkLocation } from "../locations/location.model.js";
import type { ShiftStatus } from "../rotas/shift.model.js";

export class LeaveServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = "LeaveServiceError";
  }
}

interface AccessContext {
  userId: string;
  userEmail: string;
  role: UserRole;
}

export interface LeaveEmployeeSummary {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface LeaveRequestPublic {
  id: string;
  employeeId: string;
  employee: LeaveEmployeeSummary;
  type: LeaveType;
  startDate: string;
  endDate: string;
  halfDay: boolean;
  days: number;
  reason?: string;
  status: LeaveRequestStatus;
  approverId?: string;
  approvedAt?: string;
  declineReason?: string;
  approvalStep?: number;
  createdAt: string;
  updatedAt: string;
  overlappingRequests?: LeaveOverlapSummary[];
  conflictingShifts?: LeaveShiftConflictSummary[];
}

export interface LeaveShiftConflictSummary {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: ShiftStatus;
  locationName: string;
}

export interface LeaveOverlapSummary {
  id: string;
  employeeId: string;
  employeeName: string;
  status: LeaveRequestStatus;
  startDate: string;
  endDate: string;
  halfDay: boolean;
  reason?: string;
}

export interface LeaveBalancePublic {
  employeeId: string;
  year: number;
  entitlement: number;
  taken: number;
  pending: number;
  carriedOver: number;
  remaining: number;
}

export interface LeaveCalendarEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  halfDay: boolean;
  status: LeaveRequestStatus;
}

const canApproveAll = (role: UserRole): boolean =>
  hasPermission(role, "leave:approve");

const canApproveTeam = (role: UserRole): boolean =>
  hasPermission(role, "leave:approve:team");

const canReadOwn = (role: UserRole): boolean =>
  hasPermission(role, "leave:read:own");

export const resolveEmployeeForUser = async (
  tenantId: string,
  userId: string,
  userEmail: string,
): Promise<IEmployeeDocument> => {
  const tenantObjectId = new mongoose.Types.ObjectId(tenantId);

  let employee = await Employee.findOne({
    tenantId: tenantObjectId,
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!employee && userEmail) {
    employee = await Employee.findOne({
      tenantId: tenantObjectId,
      email: userEmail.toLowerCase().trim(),
    });
  }

  if (employee) {
    return employee;
  }

  const user = await User.findOne({
    _id: new mongoose.Types.ObjectId(userId),
    tenantId: tenantObjectId,
  });

  if (user && user.role !== "super_admin" && user.role !== "company_admin") {
    return ensureEmployeeRecordForUser(tenantId, {
      userId: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  }

  throw new LeaveServiceError(
    "No employee record linked to your account. Contact your administrator.",
    403,
  );
};

const toEmployeeSummary = (
  employee: IEmployeeDocument,
): LeaveEmployeeSummary => ({
  id: employee._id.toString(),
  firstName: employee.firstName,
  lastName: employee.lastName,
  email: employee.email,
});

const toLeaveRequestPublic = async (
  request: ILeaveRequestDocument,
): Promise<LeaveRequestPublic> => {
  const employee = await Employee.findById(request.employeeId);
  if (!employee) {
    throw new LeaveServiceError("Employee not found for leave request", 500);
  }

  return {
    id: request._id.toString(),
    employeeId: request.employeeId.toString(),
    employee: toEmployeeSummary(employee),
    type: request.type,
    startDate: formatDateString(request.startDate),
    endDate: formatDateString(request.endDate),
    halfDay: request.halfDay,
    days: calculateLeaveDays(
      request.startDate,
      request.endDate,
      request.halfDay,
    ),
    reason: request.reason,
    status: request.status,
    approverId: request.approverId?.toString(),
    approvedAt: request.approvedAt?.toISOString(),
    declineReason: request.declineReason,
    approvalStep: request.approvalStep ?? 1,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    overlappingRequests: [],
    conflictingShifts: [],
  };
};

const loadShiftConflictMap = async (
  tenantId: string,
  requests: ILeaveRequestDocument[],
): Promise<Map<string, LeaveShiftConflictSummary[]>> => {
  const conflictMap = new Map<string, LeaveShiftConflictSummary[]>();

  if (requests.length === 0) {
    return conflictMap;
  }

  const employeeIds = [
    ...new Set(requests.map((request) => request.employeeId.toString())),
  ];
  const minDate = formatDateString(
    requests.reduce(
      (earliest, request) =>
        request.startDate < earliest ? request.startDate : earliest,
      requests[0].startDate,
    ),
  );
  const maxDate = formatDateString(
    requests.reduce(
      (latest, request) =>
        request.endDate > latest ? request.endDate : latest,
      requests[0].endDate,
    ),
  );

  const shifts = await Shift.find({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    employeeId: {
      $in: employeeIds.map((id) => new mongoose.Types.ObjectId(id)),
    },
    date: { $gte: minDate, $lte: maxDate },
  });

  const locationIds = [
    ...new Set(shifts.map((shift) => shift.locationId.toString())),
  ];
  const locations = await WorkLocation.find({
    _id: { $in: locationIds },
  }).select("_id name");
  const locationMap = new Map(
    locations.map((location) => [location._id.toString(), location.name]),
  );

  for (const request of requests) {
    const requestStart = formatDateString(request.startDate);
    const requestEnd = formatDateString(request.endDate);
    const employeeId = request.employeeId.toString();

    const conflicts = shifts
      .filter(
        (shift) =>
          shift.employeeId?.toString() === employeeId &&
          shift.date >= requestStart &&
          shift.date <= requestEnd,
      )
      .map((shift) => ({
        id: shift._id.toString(),
        date: shift.date,
        startTime: shift.startTime,
        endTime: shift.endTime,
        status: shift.status,
        locationName:
          locationMap.get(shift.locationId.toString()) ?? "Unknown location",
      }));

    conflictMap.set(request._id.toString(), conflicts);
  }

  return conflictMap;
};

const loadOverlapPool = async (
  tenantId: string,
  access: AccessContext,
): Promise<ILeaveRequestDocument[]> => {
  const filter: Record<string, unknown> = {
    tenantId: new mongoose.Types.ObjectId(tenantId),
    status: { $in: ["pending", "approved"] },
  };

  if (canApproveAll(access.role)) {
    return LeaveRequest.find(filter);
  }

  if (canApproveTeam(access.role)) {
    const selfRecord = await resolveEmployeeForUser(
      tenantId,
      access.userId,
      access.userEmail,
    );
    const teamIds = await getTeamEmployeeIds(
      tenantId,
      selfRecord._id.toString(),
    );
    filter.employeeId = {
      $in: [...teamIds, selfRecord._id.toString()].map(
        (id) => new mongoose.Types.ObjectId(id),
      ),
    };
    return LeaveRequest.find(filter);
  }

  return [];
};

const findOverlapsForRequest = (
  request: ILeaveRequestDocument,
  pool: ILeaveRequestDocument[],
  employeeNameMap: Map<string, string>,
): LeaveOverlapSummary[] =>
  pool
    .filter(
      (other) =>
        other._id.toString() !== request._id.toString() &&
        other.employeeId.toString() !== request.employeeId.toString() &&
        dateRangesOverlap(
          request.startDate,
          request.endDate,
          other.startDate,
          other.endDate,
        ),
    )
    .map((other) => ({
      id: other._id.toString(),
      employeeId: other.employeeId.toString(),
      employeeName:
        employeeNameMap.get(other.employeeId.toString()) ?? "Unknown",
      status: other.status,
      startDate: formatDateString(other.startDate),
      endDate: formatDateString(other.endDate),
      halfDay: other.halfDay,
      reason: other.reason,
    }));

const getOrCreateBalance = async (
  tenantId: string,
  employeeId: string,
  year: number,
): Promise<InstanceType<typeof LeaveBalance>> =>
  ensureLeaveBalanceForYear(tenantId, employeeId, year);

const toBalancePublic = (
  balance: InstanceType<typeof LeaveBalance>,
): LeaveBalancePublic => ({
  employeeId: balance.employeeId.toString(),
  year: balance.year,
  entitlement: balance.entitlement,
  taken: balance.taken,
  pending: balance.pending,
  carriedOver: balance.carriedOver,
  remaining:
    balance.entitlement + balance.carriedOver - balance.taken - balance.pending,
});

const assertNoOverlap = async (
  tenantId: string,
  employeeId: string,
  startDate: Date,
  endDate: Date,
  excludeRequestId?: string,
): Promise<void> => {
  const filter: Record<string, unknown> = {
    tenantId: new mongoose.Types.ObjectId(tenantId),
    employeeId: new mongoose.Types.ObjectId(employeeId),
    status: { $in: ["pending", "approved"] },
  };

  if (excludeRequestId) {
    filter._id = { $ne: new mongoose.Types.ObjectId(excludeRequestId) };
  }

  const existing = await LeaveRequest.find(filter);

  for (const req of existing) {
    if (dateRangesOverlap(startDate, endDate, req.startDate, req.endDate)) {
      throw new LeaveServiceError(
        "Leave request overlaps with an existing pending or approved request",
        409,
      );
    }
  }
};

const getTeamEmployeeIds = async (
  tenantId: string,
  managerEmployeeId: string,
): Promise<string[]> => {
  const reports = await Employee.find({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    managerId: new mongoose.Types.ObjectId(managerEmployeeId),
  }).select("_id");

  return reports.map((r) => r._id.toString());
};

const buildListFilter = async (
  tenantId: string,
  query: ListLeaveRequestsQuery,
  access: AccessContext,
): Promise<Record<string, unknown>> => {
  const filter: Record<string, unknown> = {
    tenantId: new mongoose.Types.ObjectId(tenantId),
  };

  const settings = await getTenantLeaveSettings(tenantId);

  if (query.status) {
    filter.status = query.status;

    if (
      query.status === "pending" &&
      settings.multiStepApprovalEnabled &&
      canApproveTeam(access.role) &&
      !canApproveAll(access.role)
    ) {
      filter.approvalStep = 1;
    }
  }

  if (query.from) {
    filter.endDate = {
      ...(filter.endDate as object),
      $gte: parseDateString(query.from),
    };
  }

  if (query.to) {
    filter.startDate = {
      ...(filter.startDate as object),
      $lte: parseDateString(query.to),
    };
  }

  if (query.mine === "true") {
    try {
      const selfRecord = await resolveEmployeeForUser(
        tenantId,
        access.userId,
        access.userEmail,
      );
      filter.employeeId = selfRecord._id;
    } catch {
      filter._id = new mongoose.Types.ObjectId("000000000000000000000000");
    }
    return filter;
  }

  if (canApproveAll(access.role)) {
    if (query.employeeId) {
      filter.employeeId = new mongoose.Types.ObjectId(query.employeeId);
    }
    return filter;
  }

  if (canApproveTeam(access.role)) {
    const selfRecord = await resolveEmployeeForUser(
      tenantId,
      access.userId,
      access.userEmail,
    );
    const teamIds = await getTeamEmployeeIds(
      tenantId,
      selfRecord._id.toString(),
    );

    if (query.employeeId) {
      if (
        !teamIds.includes(query.employeeId) &&
        query.employeeId !== selfRecord._id.toString()
      ) {
        throw new LeaveServiceError("Insufficient permissions", 403);
      }
      filter.employeeId = new mongoose.Types.ObjectId(query.employeeId);
    } else {
      filter.employeeId = {
        $in: [...teamIds, selfRecord._id.toString()].map(
          (id) => new mongoose.Types.ObjectId(id),
        ),
      };
    }
    return filter;
  }

  if (canReadOwn(access.role)) {
    const selfRecord = await resolveEmployeeForUser(
      tenantId,
      access.userId,
      access.userEmail,
    );
    filter.employeeId = selfRecord._id;
    return filter;
  }

  throw new LeaveServiceError("Insufficient permissions", 403);
};

const assertCanAccessRequest = async (
  tenantId: string,
  request: ILeaveRequestDocument,
  access: AccessContext,
): Promise<void> => {
  if (canApproveAll(access.role)) {
    return;
  }

  if (canApproveTeam(access.role)) {
    const selfRecord = await resolveEmployeeForUser(
      tenantId,
      access.userId,
      access.userEmail,
    );
    const teamIds = await getTeamEmployeeIds(
      tenantId,
      selfRecord._id.toString(),
    );
    const requestEmployeeId = request.employeeId.toString();

    if (
      requestEmployeeId === selfRecord._id.toString() ||
      teamIds.includes(requestEmployeeId)
    ) {
      return;
    }

    throw new LeaveServiceError("Insufficient permissions", 403);
  }

  if (canReadOwn(access.role)) {
    const selfRecord = await resolveEmployeeForUser(
      tenantId,
      access.userId,
      access.userEmail,
    );
    if (request.employeeId.toString() !== selfRecord._id.toString()) {
      throw new LeaveServiceError("Insufficient permissions", 403);
    }
    return;
  }

  throw new LeaveServiceError("Insufficient permissions", 403);
};

const assertCanApproveRequest = async (
  tenantId: string,
  request: ILeaveRequestDocument,
  access: AccessContext,
): Promise<void> => {
  if (request.status !== "pending") {
    throw new LeaveServiceError(
      "Only pending requests can be approved or declined",
      400,
    );
  }

  const settings = await getTenantLeaveSettings(tenantId);
  const step = request.approvalStep ?? 1;

  if (settings.multiStepApprovalEnabled && step >= 2) {
    if (!canApproveAll(access.role)) {
      throw new LeaveServiceError("Insufficient permissions", 403);
    }
    return;
  }

  if (settings.multiStepApprovalEnabled && step === 1) {
    if (canApproveTeam(access.role)) {
      const selfRecord = await resolveEmployeeForUser(
        tenantId,
        access.userId,
        access.userEmail,
      );
      const employee = await Employee.findById(request.employeeId);

      if (!employee) {
        throw new LeaveServiceError("Employee not found", 404);
      }

      const isDirectReport =
        employee.managerId?.toString() === selfRecord._id.toString();
      if (isDirectReport) {
        return;
      }
    }

    if (canApproveAll(access.role)) {
      const employee = await Employee.findById(request.employeeId);
      if (!employee?.managerId) {
        return;
      }
    }

    throw new LeaveServiceError("Insufficient permissions", 403);
  }

  if (canApproveAll(access.role)) {
    return;
  }

  if (canApproveTeam(access.role)) {
    const selfRecord = await resolveEmployeeForUser(
      tenantId,
      access.userId,
      access.userEmail,
    );
    const employee = await Employee.findById(request.employeeId);

    if (!employee) {
      throw new LeaveServiceError("Employee not found", 404);
    }

    const isDirectReport =
      employee.managerId?.toString() === selfRecord._id.toString();
    if (!isDirectReport) {
      throw new LeaveServiceError("Insufficient permissions", 403);
    }
    return;
  }

  throw new LeaveServiceError("Insufficient permissions", 403);
};

const findHrRecipientEmail = async (
  tenantId: string,
): Promise<string | null> => {
  const hrUser = await User.findOne({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    role: { $in: ["hr_manager", "company_admin"] },
  }).sort({ createdAt: 1 });

  return hrUser?.email ?? null;
};

const findApproverRecipientEmail = async (
  tenantId: string,
  employee: IEmployeeDocument,
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

  return findHrRecipientEmail(tenantId);
};

export const listLeaveRequests = async (
  tenantId: string,
  query: ListLeaveRequestsQuery,
  access: AccessContext,
): Promise<LeaveRequestPublic[]> => {
  const filter = await buildListFilter(tenantId, query, access);

  const requests = await LeaveRequest.find(filter).sort({
    startDate: -1,
    createdAt: -1,
  });

  const includeOverlaps =
    query.mine !== "true" &&
    (canApproveAll(access.role) || canApproveTeam(access.role));

  let overlapPool: ILeaveRequestDocument[] = [];
  let employeeNameMap = new Map<string, string>();
  let shiftConflictMap = new Map<string, LeaveShiftConflictSummary[]>();

  if (includeOverlaps && requests.length > 0) {
    overlapPool = await loadOverlapPool(tenantId, access);
    shiftConflictMap = await loadShiftConflictMap(tenantId, requests);
    const employeeIds = [
      ...new Set(overlapPool.map((entry) => entry.employeeId.toString())),
    ];
    const employees = await Employee.find({ _id: { $in: employeeIds } }).select(
      "firstName lastName",
    );
    employeeNameMap = new Map(
      employees.map((employee) => [
        employee._id.toString(),
        `${employee.firstName} ${employee.lastName}`,
      ]),
    );
  }

  return Promise.all(
    requests.map(async (request) => {
      const leaveRequest = await toLeaveRequestPublic(request);

      if (includeOverlaps) {
        leaveRequest.overlappingRequests = findOverlapsForRequest(
          request,
          overlapPool,
          employeeNameMap,
        );
        leaveRequest.conflictingShifts =
          shiftConflictMap.get(request._id.toString()) ?? [];
      }

      return leaveRequest;
    }),
  );
};

export const getLeaveRequestById = async (
  tenantId: string,
  requestId: string,
  access: AccessContext,
): Promise<LeaveRequestPublic> => {
  const request = await LeaveRequest.findOne({
    _id: new mongoose.Types.ObjectId(requestId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!request) {
    throw new LeaveServiceError("Leave request not found", 404);
  }

  await assertCanAccessRequest(tenantId, request, access);

  return toLeaveRequestPublic(request);
};

export const createLeaveRequest = async (
  tenantId: string,
  input: CreateLeaveRequestInput,
  access: AccessContext,
  env: ServerEnv,
  audit?: AuditContext,
): Promise<LeaveRequestPublic> => {
  const employee = await resolveEmployeeForUser(
    tenantId,
    access.userId,
    access.userEmail,
  );

  const startDate = parseDateString(input.startDate);
  const endDate = parseDateString(input.endDate);
  const days = calculateLeaveDays(startDate, endDate, input.halfDay ?? false);

  await assertNoOverlap(tenantId, employee._id.toString(), startDate, endDate);

  if (input.type === "annual") {
    const year = startDate.getUTCFullYear();
    const balance = await getOrCreateBalance(
      tenantId,
      employee._id.toString(),
      year,
    );
    const remaining =
      balance.entitlement +
      balance.carriedOver -
      balance.taken -
      balance.pending;

    if (days > remaining) {
      throw new LeaveServiceError(
        `Insufficient annual leave balance. ${remaining} day(s) remaining.`,
        400,
      );
    }

    balance.pending += days;
    await balance.save();
  }

  const request = await LeaveRequest.create({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    employeeId: employee._id,
    type: input.type,
    startDate,
    endDate,
    halfDay: input.halfDay ?? false,
    reason: input.reason,
    status: "pending",
    approvalStep: 1,
  });

  const recipientEmail = await findApproverRecipientEmail(tenantId, employee);
  if (recipientEmail) {
    void sendLeaveSubmittedEmail(env, {
      to: recipientEmail,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      leaveType: input.type,
      startDate: input.startDate,
      endDate: input.endDate,
      reason: input.reason,
    });
  }

  void writeAuditLog({
    tenantId,
    userId: access.userId,
    action: "create",
    entityType: "LeaveRequest",
    entityId: request._id.toString(),
    after: leaveRequestAuditSnapshot(request),
    context: audit,
  });

  return toLeaveRequestPublic(request);
};

export const cancelLeaveRequest = async (
  tenantId: string,
  requestId: string,
  access: AccessContext,
  audit?: AuditContext,
): Promise<LeaveRequestPublic> => {
  const request = await LeaveRequest.findOne({
    _id: new mongoose.Types.ObjectId(requestId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!request) {
    throw new LeaveServiceError("Leave request not found", 404);
  }

  const selfRecord = await resolveEmployeeForUser(
    tenantId,
    access.userId,
    access.userEmail,
  );

  if (request.employeeId.toString() !== selfRecord._id.toString()) {
    throw new LeaveServiceError(
      "You can only cancel your own leave requests",
      403,
    );
  }

  if (request.status !== "pending") {
    throw new LeaveServiceError("Only pending requests can be cancelled", 400);
  }

  const beforeSnapshot = leaveRequestAuditSnapshot(request);

  if (request.type === "annual") {
    const days = calculateLeaveDays(
      request.startDate,
      request.endDate,
      request.halfDay,
    );
    const year = request.startDate.getUTCFullYear();
    const balance = await getOrCreateBalance(
      tenantId,
      request.employeeId.toString(),
      year,
    );
    balance.pending = Math.max(0, balance.pending - days);
    await balance.save();
  }

  request.status = "cancelled";
  await request.save();

  void writeAuditLog({
    tenantId,
    userId: access.userId,
    action: "update",
    entityType: "LeaveRequest",
    entityId: request._id.toString(),
    before: beforeSnapshot,
    after: leaveRequestAuditSnapshot(request),
    context: audit,
  });

  return toLeaveRequestPublic(request);
};

export const approveLeaveRequest = async (
  tenantId: string,
  requestId: string,
  access: AccessContext,
  env: ServerEnv,
  audit?: AuditContext,
): Promise<LeaveRequestPublic> => {
  const request = await LeaveRequest.findOne({
    _id: new mongoose.Types.ObjectId(requestId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!request) {
    throw new LeaveServiceError("Leave request not found", 404);
  }

  await assertCanApproveRequest(tenantId, request, access);

  const beforeSnapshot = leaveRequestAuditSnapshot(request);
  const settings = await getTenantLeaveSettings(tenantId);
  const step = request.approvalStep ?? 1;

  if (settings.multiStepApprovalEnabled && step === 1) {
    request.approvalStep = 2;
    request.approverId = new mongoose.Types.ObjectId(access.userId);
    await request.save();

    const employee = await Employee.findById(request.employeeId);
    const approver = await User.findById(access.userId);
    const hrEmail = await findHrRecipientEmail(tenantId);

    if (hrEmail && employee) {
      void sendLeaveSubmittedEmail(env, {
        to: hrEmail,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        leaveType: request.type,
        startDate: formatDateString(request.startDate),
        endDate: formatDateString(request.endDate),
        reason: request.reason,
        subjectPrefix: "HR approval needed: ",
        introText: `${approver ? `${approver.firstName ?? ""} ${approver.lastName ?? ""}`.trim() || approver.email : "Manager"} approved step 1. Final HR approval is required.`,
      });
    }

    void writeAuditLog({
      tenantId,
      userId: access.userId,
      action: "update",
      entityType: "LeaveRequest",
      entityId: request._id.toString(),
      before: beforeSnapshot,
      after: leaveRequestAuditSnapshot(request),
      context: audit,
    });

    return toLeaveRequestPublic(request);
  }

  if (request.type === "annual") {
    const days = calculateLeaveDays(
      request.startDate,
      request.endDate,
      request.halfDay,
    );
    const year = request.startDate.getUTCFullYear();
    const balance = await getOrCreateBalance(
      tenantId,
      request.employeeId.toString(),
      year,
    );
    balance.pending = Math.max(0, balance.pending - days);
    balance.taken += days;
    await balance.save();
  }

  request.status = "approved";
  request.approverId = new mongoose.Types.ObjectId(access.userId);
  request.approvedAt = new Date();
  await request.save();

  const employee = await Employee.findById(request.employeeId);
  const approver = await User.findById(access.userId);

  if (employee?.email) {
    void sendLeaveApprovedEmail(env, {
      to: employee.email,
      startDate: formatDateString(request.startDate),
      endDate: formatDateString(request.endDate),
      approverName: approver
        ? `${approver.firstName ?? ""} ${approver.lastName ?? ""}`.trim() ||
          approver.email
        : "Approver",
    });
  }

  void writeAuditLog({
    tenantId,
    userId: access.userId,
    action: "update",
    entityType: "LeaveRequest",
    entityId: request._id.toString(),
    before: beforeSnapshot,
    after: leaveRequestAuditSnapshot(request),
    context: audit,
  });

  return toLeaveRequestPublic(request);
};

export const declineLeaveRequest = async (
  tenantId: string,
  requestId: string,
  declineReason: string | undefined,
  access: AccessContext,
  env: ServerEnv,
  audit?: AuditContext,
): Promise<LeaveRequestPublic> => {
  const request = await LeaveRequest.findOne({
    _id: new mongoose.Types.ObjectId(requestId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!request) {
    throw new LeaveServiceError("Leave request not found", 404);
  }

  await assertCanApproveRequest(tenantId, request, access);

  const beforeSnapshot = leaveRequestAuditSnapshot(request);

  if (request.type === "annual") {
    const days = calculateLeaveDays(
      request.startDate,
      request.endDate,
      request.halfDay,
    );
    const year = request.startDate.getUTCFullYear();
    const balance = await getOrCreateBalance(
      tenantId,
      request.employeeId.toString(),
      year,
    );
    balance.pending = Math.max(0, balance.pending - days);
    await balance.save();
  }

  request.status = "declined";
  request.approverId = new mongoose.Types.ObjectId(access.userId);
  request.approvedAt = new Date();
  request.declineReason = declineReason;
  await request.save();

  const employee = await Employee.findById(request.employeeId);

  if (employee?.email) {
    void sendLeaveDeclinedEmail(env, {
      to: employee.email,
      startDate: formatDateString(request.startDate),
      endDate: formatDateString(request.endDate),
      declineReason,
    });
  }

  void writeAuditLog({
    tenantId,
    userId: access.userId,
    action: "update",
    entityType: "LeaveRequest",
    entityId: request._id.toString(),
    before: beforeSnapshot,
    after: leaveRequestAuditSnapshot(request),
    context: audit,
  });

  return toLeaveRequestPublic(request);
};

export const getMyLeaveBalance = async (
  tenantId: string,
  access: AccessContext,
): Promise<LeaveBalancePublic> => {
  const employee = await resolveEmployeeForUser(
    tenantId,
    access.userId,
    access.userEmail,
  );
  const year = new Date().getUTCFullYear();
  const balance = await getOrCreateBalance(
    tenantId,
    employee._id.toString(),
    year,
  );
  return toBalancePublic(balance);
};

export const getEmployeeLeaveBalance = async (
  tenantId: string,
  employeeId: string,
): Promise<LeaveBalancePublic> => {
  const employee = await Employee.findOne({
    _id: new mongoose.Types.ObjectId(employeeId),
    tenantId: new mongoose.Types.ObjectId(tenantId),
  });

  if (!employee) {
    throw new LeaveServiceError("Employee not found", 404);
  }

  const year = new Date().getUTCFullYear();
  const balance = await getOrCreateBalance(tenantId, employeeId, year);
  return toBalancePublic(balance);
};

export const getLeaveCalendar = async (
  tenantId: string,
  query: LeaveCalendarQuery,
  access: AccessContext,
): Promise<LeaveCalendarEntry[]> => {
  const monthStart = new Date(Date.UTC(query.year, query.month - 1, 1));
  const monthEnd = new Date(Date.UTC(query.year, query.month, 0));

  const filter: Record<string, unknown> = {
    tenantId: new mongoose.Types.ObjectId(tenantId),
    status: { $in: ["pending", "approved"] },
    startDate: { $lte: monthEnd },
    endDate: { $gte: monthStart },
  };

  if (canApproveAll(access.role)) {
    // all employees
  } else if (canApproveTeam(access.role)) {
    const selfRecord = await resolveEmployeeForUser(
      tenantId,
      access.userId,
      access.userEmail,
    );
    const teamIds = await getTeamEmployeeIds(
      tenantId,
      selfRecord._id.toString(),
    );
    filter.employeeId = {
      $in: [...teamIds, selfRecord._id.toString()].map(
        (id) => new mongoose.Types.ObjectId(id),
      ),
    };
  } else {
    throw new LeaveServiceError("Insufficient permissions", 403);
  }

  const requests = await LeaveRequest.find(filter).sort({ startDate: 1 });

  const entries: LeaveCalendarEntry[] = [];

  for (const request of requests) {
    const employee = await Employee.findById(request.employeeId);
    if (!employee) continue;

    entries.push({
      id: request._id.toString(),
      employeeId: request.employeeId.toString(),
      employeeName: `${employee.firstName} ${employee.lastName}`,
      type: request.type,
      startDate: formatDateString(request.startDate),
      endDate: formatDateString(request.endDate),
      halfDay: request.halfDay,
      status: request.status,
    });
  }

  return entries;
};

export const countPendingLeaveRequests = async (
  tenantId: string,
  access: AccessContext,
): Promise<number> => {
  const filter = await buildListFilter(tenantId, { status: "pending" }, access);
  return LeaveRequest.countDocuments(filter);
};
