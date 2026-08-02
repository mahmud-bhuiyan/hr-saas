const SENSITIVE_KEYS = new Set(['passwordHash', 'password', 'token', 'tokenHash', '__v']);

export const sanitizeAuditPayload = (
  value: Record<string, unknown> | null | undefined
): Record<string, unknown> | null => {
  if (!value) {
    return null;
  }

  const result: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(value)) {
    if (SENSITIVE_KEYS.has(key)) {
      continue;
    }

    if (entry instanceof Date) {
      result[key] = entry.toISOString();
    } else if (entry && typeof entry === 'object' && '_id' in (entry as object)) {
      result[key] = String((entry as { _id: unknown })._id);
    } else {
      result[key] = entry;
    }
  }

  return result;
};

export const employeeAuditSnapshot = (employee: {
  employeeNumber?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  startDate?: Date;
  managerId?: unknown;
  status?: string;
  userId?: unknown;
}): Record<string, unknown> =>
  sanitizeAuditPayload({
    employeeNumber: employee.employeeNumber,
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phone: employee.phone,
    jobTitle: employee.jobTitle,
    department: employee.department,
    startDate: employee.startDate,
    managerId: employee.managerId,
    status: employee.status,
    userId: employee.userId,
  }) ?? {};

export const leaveRequestAuditSnapshot = (request: {
  employeeId?: unknown;
  type?: string;
  startDate?: Date;
  endDate?: Date;
  halfDay?: boolean;
  reason?: string;
  status?: string;
  approverId?: unknown;
  declineReason?: string;
  approvalStep?: number;
}): Record<string, unknown> =>
  sanitizeAuditPayload({
    employeeId: request.employeeId,
    type: request.type,
    startDate: request.startDate,
    endDate: request.endDate,
    halfDay: request.halfDay,
    reason: request.reason,
    status: request.status,
    approverId: request.approverId,
    declineReason: request.declineReason,
    approvalStep: request.approvalStep,
  }) ?? {};

export const documentAuditSnapshot = (doc: {
  employeeId?: unknown;
  category?: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  expiryDate?: Date | null;
}): Record<string, unknown> =>
  sanitizeAuditPayload({
    employeeId: doc.employeeId,
    category: doc.category,
    fileName: doc.fileName,
    mimeType: doc.mimeType,
    fileSize: doc.fileSize,
    expiryDate: doc.expiryDate,
  }) ?? {};

export const userAuditSnapshot = (user: {
  email?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}): Record<string, unknown> =>
  sanitizeAuditPayload({
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: user.isActive,
  }) ?? {};
