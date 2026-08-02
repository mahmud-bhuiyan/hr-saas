import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../middleware/auth.js';
import {
  NotificationServiceError,
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from './notification.service.js';

export const listNotificationsHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const notifications = await listNotifications(req.tenantId!, req.user!.sub);
    res.json({ status: 'ok', data: { notifications } });
  } catch (error) {
    if (error instanceof NotificationServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }

    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const unreadCountHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const count = await getUnreadNotificationCount(req.tenantId!, req.user!.sub);
    res.json({ status: 'ok', data: { count } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const markReadHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const notification = await markNotificationRead(
      req.tenantId!,
      req.user!.sub,
      req.params.id!
    );
    res.json({ status: 'ok', data: notification });
  } catch (error) {
    if (error instanceof NotificationServiceError) {
      res.status(error.statusCode).json({ status: 'error', message: error.message });
      return;
    }

    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

export const markAllReadHandler = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const count = await markAllNotificationsRead(req.tenantId!, req.user!.sub);
    res.json({ status: 'ok', data: { count } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
