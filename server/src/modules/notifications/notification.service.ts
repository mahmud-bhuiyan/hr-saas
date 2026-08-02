import mongoose from 'mongoose';
import { Notification } from './notification.model.js';

export interface NotificationPublic {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface CreateInAppNotificationInput {
  tenantId: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export class NotificationServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'NotificationServiceError';
  }
}

const toNotificationPublic = (doc: {
  _id: mongoose.Types.ObjectId;
  type: string;
  title: string;
  body: string;
  readAt?: Date | null;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}): NotificationPublic => ({
  id: doc._id.toString(),
  type: doc.type,
  title: doc.title,
  body: doc.body,
  readAt: doc.readAt?.toISOString(),
  metadata: doc.metadata,
  createdAt: doc.createdAt.toISOString(),
});

export const createInAppNotification = async (
  input: CreateInAppNotificationInput
): Promise<NotificationPublic> => {
  const doc = await Notification.create({
    tenantId: new mongoose.Types.ObjectId(input.tenantId),
    userId: new mongoose.Types.ObjectId(input.userId),
    type: input.type,
    title: input.title,
    body: input.body,
    metadata: input.metadata ?? {},
  });

  return toNotificationPublic(doc);
};

export const listNotifications = async (
  tenantId: string,
  userId: string,
  limit = 20
): Promise<NotificationPublic[]> => {
  const docs = await Notification.find({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    userId: new mongoose.Types.ObjectId(userId),
  })
    .sort({ createdAt: -1 })
    .limit(limit);

  return docs.map(toNotificationPublic);
};

export const getUnreadNotificationCount = async (
  tenantId: string,
  userId: string
): Promise<number> => {
  return Notification.countDocuments({
    tenantId: new mongoose.Types.ObjectId(tenantId),
    userId: new mongoose.Types.ObjectId(userId),
    readAt: null,
  });
};

export const markNotificationRead = async (
  tenantId: string,
  userId: string,
  notificationId: string
): Promise<NotificationPublic> => {
  const doc = await Notification.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(notificationId),
      tenantId: new mongoose.Types.ObjectId(tenantId),
      userId: new mongoose.Types.ObjectId(userId),
    },
    { readAt: new Date() },
    { new: true }
  );

  if (!doc) {
    throw new NotificationServiceError('Notification not found', 404);
  }

  return toNotificationPublic(doc);
};

export const markAllNotificationsRead = async (
  tenantId: string,
  userId: string
): Promise<number> => {
  const result = await Notification.updateMany(
    {
      tenantId: new mongoose.Types.ObjectId(tenantId),
      userId: new mongoose.Types.ObjectId(userId),
      readAt: null,
    },
    { readAt: new Date() }
  );

  return result.modifiedCount;
};
