import mongoose from 'mongoose';
import { User } from '../admin/user.model.js';
import type { AuditAction, AuditEntityType } from './audit.model.js';
import { AuditLog } from './audit.model.js';
import type { ListAuditLogsQuery } from './audit.validation.js';

export interface AuditContext {
  ip?: string;
  userAgent?: string;
}

export interface AuditLogPublic {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ip?: string;
  createdAt: string;
}

export interface WriteAuditLogInput {
  tenantId: string;
  userId: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  context?: AuditContext;
}

export class AuditServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'AuditServiceError';
  }
}

export const writeAuditLog = async (input: WriteAuditLogInput): Promise<void> => {
  await AuditLog.create({
    tenantId: new mongoose.Types.ObjectId(input.tenantId),
    userId: new mongoose.Types.ObjectId(input.userId),
    action: input.action,
    entityType: input.entityType,
    entityId: new mongoose.Types.ObjectId(input.entityId),
    before: input.before ?? null,
    after: input.after ?? null,
    ip: input.context?.ip,
    userAgent: input.context?.userAgent,
  });
};

const toAuditLogPublic = (
  log: {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    action: AuditAction;
    entityType: AuditEntityType;
    entityId: mongoose.Types.ObjectId;
    before?: Record<string, unknown> | null;
    after?: Record<string, unknown> | null;
    ip?: string;
    createdAt: Date;
  },
  user?: { email: string; firstName?: string; lastName?: string } | null
): AuditLogPublic => ({
  id: log._id.toString(),
  userId: log.userId.toString(),
  userEmail: user?.email ?? 'unknown',
  userName:
    user && (user.firstName || user.lastName)
      ? [user.firstName, user.lastName].filter(Boolean).join(' ')
      : (user?.email ?? 'Unknown'),
  action: log.action,
  entityType: log.entityType,
  entityId: log.entityId.toString(),
  before: log.before ?? null,
  after: log.after ?? null,
  ip: log.ip,
  createdAt: log.createdAt.toISOString(),
});

export const listAuditLogs = async (
  tenantId: string,
  query: ListAuditLogsQuery
): Promise<{ logs: AuditLogPublic[]; total: number }> => {
  const filter: Record<string, unknown> = {
    tenantId: new mongoose.Types.ObjectId(tenantId),
  };

  if (query.entityType) {
    filter.entityType = query.entityType;
  }

  if (query.entityId) {
    filter.entityId = new mongoose.Types.ObjectId(query.entityId);
  }

  if (query.userId) {
    filter.userId = new mongoose.Types.ObjectId(query.userId);
  }

  if (query.from || query.to) {
    const createdAt: Record<string, Date> = {};
    if (query.from) {
      createdAt.$gte = new Date(query.from);
    }
    if (query.to) {
      createdAt.$lte = new Date(query.to);
    }
    filter.createdAt = createdAt;
  }

  const page = query.page ?? 1;
  const limit = query.limit ?? 25;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AuditLog.countDocuments(filter),
  ]);

  const userIds = [...new Set(logs.map((log) => log.userId.toString()))];
  const users = await User.find({ _id: { $in: userIds } })
    .select('email firstName lastName')
    .lean();
  const userMap = new Map(users.map((user) => [user._id.toString(), user]));

  return {
    logs: logs.map((log) => toAuditLogPublic(log, userMap.get(log.userId.toString()))),
    total,
  };
};
