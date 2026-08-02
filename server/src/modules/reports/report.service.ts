import mongoose from 'mongoose';
import { calculateLeaveDays, parseDateString } from '../leave/leave.utils.js';
import { LeaveRequest } from '../leave/leave.model.js';
import { Employee } from '../employees/employee.model.js';
import type { AbsenceSummaryQuery, HeadcountQuery } from './report.validation.js';

export interface HeadcountDepartmentBreakdown {
  department: string;
  active: number;
  onLeave: number;
  terminated: number;
}

export interface HeadcountReport {
  total: number;
  byDepartment: HeadcountDepartmentBreakdown[];
  byStatus: {
    active: number;
    on_leave: number;
    terminated: number;
  };
}

export interface AbsenceTypeBreakdown {
  type: string;
  days: number;
}

export interface AbsenceDepartmentBreakdown {
  department: string;
  totalDays: number;
  byType: AbsenceTypeBreakdown[];
}

export interface AbsenceSummaryReport {
  from: string;
  to: string;
  totalDays: number;
  byType: AbsenceTypeBreakdown[];
  byDepartment: AbsenceDepartmentBreakdown[];
}

export class ReportServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'ReportServiceError';
  }
}

const UNASSIGNED_DEPARTMENT = 'Unassigned';

const normalizeDepartment = (department?: string | null): string =>
  department?.trim() || UNASSIGNED_DEPARTMENT;

export const getHeadcountReport = async (
  tenantId: string,
  query: HeadcountQuery
): Promise<HeadcountReport> => {
  const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
  const filter: Record<string, unknown> = { tenantId: tenantObjectId };

  if (query.department) {
    filter.department = query.department;
  }

  const employees = await Employee.find(filter).select('department status').lean();

  const departmentMap = new Map<string, HeadcountDepartmentBreakdown>();
  const byStatus = {
    active: 0,
    on_leave: 0,
    terminated: 0,
  };

  for (const employee of employees) {
    const department = normalizeDepartment(employee.department);
    const existing = departmentMap.get(department) ?? {
      department,
      active: 0,
      onLeave: 0,
      terminated: 0,
    };

    if (employee.status === 'active') {
      existing.active += 1;
      byStatus.active += 1;
    } else if (employee.status === 'on_leave') {
      existing.onLeave += 1;
      byStatus.on_leave += 1;
    } else if (employee.status === 'terminated') {
      existing.terminated += 1;
      byStatus.terminated += 1;
    }

    departmentMap.set(department, existing);
  }

  const byDepartment = [...departmentMap.values()].sort((a, b) =>
    a.department.localeCompare(b.department)
  );

  return {
    total: employees.length,
    byDepartment,
    byStatus,
  };
};

const clipLeaveToRange = (
  leaveStart: Date,
  leaveEnd: Date,
  rangeStart: Date,
  rangeEnd: Date
): { start: Date; end: Date } | null => {
  const start = leaveStart > rangeStart ? leaveStart : rangeStart;
  const end = leaveEnd < rangeEnd ? leaveEnd : rangeEnd;

  if (start > end) {
    return null;
  }

  return { start, end };
};

export const getAbsenceSummaryReport = async (
  tenantId: string,
  query: AbsenceSummaryQuery
): Promise<AbsenceSummaryReport> => {
  const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
  const rangeStart = parseDateString(query.from);
  const rangeEnd = parseDateString(query.to);

  if (rangeStart > rangeEnd) {
    throw new ReportServiceError('Start date must be before end date', 400);
  }

  const maxRangeMs = 366 * 24 * 60 * 60 * 1000;
  if (rangeEnd.getTime() - rangeStart.getTime() > maxRangeMs) {
    throw new ReportServiceError('Date range cannot exceed one year', 400);
  }

  const employeeFilter: Record<string, unknown> = { tenantId: tenantObjectId };
  if (query.department) {
    employeeFilter.department = query.department;
  }

  const employees = await Employee.find(employeeFilter).select('_id department').lean();
  const employeeDepartmentMap = new Map<string, string>();

  for (const employee of employees) {
    employeeDepartmentMap.set(employee._id.toString(), normalizeDepartment(employee.department));
  }

  const employeeIds = employees.map((employee) => employee._id);

  if (employeeIds.length === 0) {
    return {
      from: query.from,
      to: query.to,
      totalDays: 0,
      byType: [],
      byDepartment: [],
    };
  }

  const leaveRequests = await LeaveRequest.find({
    tenantId: tenantObjectId,
    employeeId: { $in: employeeIds },
    status: 'approved',
    startDate: { $lte: rangeEnd },
    endDate: { $gte: rangeStart },
  })
    .select('employeeId type startDate endDate halfDay')
    .lean();

  const typeTotals = new Map<string, number>();
  const departmentTotals = new Map<string, { totalDays: number; byType: Map<string, number> }>();

  let totalDays = 0;

  for (const request of leaveRequests) {
    const clipped = clipLeaveToRange(
      request.startDate,
      request.endDate,
      rangeStart,
      rangeEnd
    );

    if (!clipped) {
      continue;
    }

    const days = calculateLeaveDays(clipped.start, clipped.end, request.halfDay);
    if (days <= 0) {
      continue;
    }

    const department = employeeDepartmentMap.get(request.employeeId.toString()) ?? UNASSIGNED_DEPARTMENT;
    const leaveType = request.type;

    totalDays += days;
    typeTotals.set(leaveType, (typeTotals.get(leaveType) ?? 0) + days);

    const departmentEntry = departmentTotals.get(department) ?? {
      totalDays: 0,
      byType: new Map<string, number>(),
    };
    departmentEntry.totalDays += days;
    departmentEntry.byType.set(leaveType, (departmentEntry.byType.get(leaveType) ?? 0) + days);
    departmentTotals.set(department, departmentEntry);
  }

  const byType = [...typeTotals.entries()]
    .map(([type, days]) => ({ type, days: Math.round(days * 10) / 10 }))
    .sort((a, b) => a.type.localeCompare(b.type));

  const byDepartment = [...departmentTotals.entries()]
    .map(([department, entry]) => ({
      department,
      totalDays: Math.round(entry.totalDays * 10) / 10,
      byType: [...entry.byType.entries()]
        .map(([type, days]) => ({ type, days: Math.round(days * 10) / 10 }))
        .sort((a, b) => a.type.localeCompare(b.type)),
    }))
    .sort((a, b) => a.department.localeCompare(b.department));

  return {
    from: query.from,
    to: query.to,
    totalDays: Math.round(totalDays * 10) / 10,
    byType,
    byDepartment,
  };
};
