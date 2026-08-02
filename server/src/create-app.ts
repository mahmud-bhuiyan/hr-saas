import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { loadServerEnv } from './config/env.js';
import { APP_NAME } from './constants/app.js';
import { createAdminRoutes } from './modules/admin/admin.routes.js';
import { createRegistrationRoutes } from './modules/admin/registration.routes.js';
import { createAuthRoutes } from './modules/auth/auth.routes.js';
import { createEmployeeRoutes } from './modules/employees/employee.routes.js';
import { createPlatformAdminRoutes } from './modules/platform/platform-admin.routes.js';
import { createPlatformRoutes } from './modules/platform/platform.routes.js';
import { createSettingsRoutes } from './modules/settings/settings.routes.js';
import { createLeaveRoutes } from './modules/leave/leave.routes.js';
import { createDocumentRoutes } from './modules/documents/document.routes.js';
import { createAuditRoutes } from './modules/audit/audit.routes.js';
import { createNotificationRoutes } from './modules/notifications/notification.routes.js';
import { createAttendanceRoutes } from './modules/attendance/attendance.routes.js';
import { createTimesheetRoutes } from './modules/timesheets/timesheet.routes.js';
import { createExpenseRoutes } from './modules/expenses/expense.routes.js';
import type { ApiHealthResponse } from './types/index.js';

export const createApp = () => {
  const env = loadServerEnv();
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get('/', (_req, res) => {
    res.type('text').send('Server is running');
  });

  app.get('/api/v1/health', (_req, res) => {
    const response: ApiHealthResponse = {
      status: 'ok',
      service: APP_NAME,
      timestamp: new Date().toISOString(),
    };
    res.json(response);
  });

  app.use('/api/v1/auth', createAuthRoutes(env));
  app.use('/api/v1/admins', createAdminRoutes(env));
  app.use('/api/v1/admin/registrations', createRegistrationRoutes(env));
  app.use('/api/v1/employees', createEmployeeRoutes(env));
  app.use('/api/v1/platform', createPlatformRoutes());
  app.use('/api/v1/admin/platform', createPlatformAdminRoutes(env));
  app.use('/api/v1/settings', createSettingsRoutes(env));
  app.use('/api/v1/leave', createLeaveRoutes(env));
  app.use('/api/v1/documents', createDocumentRoutes(env));
  app.use('/api/v1/audit-logs', createAuditRoutes(env));
  app.use('/api/v1/notifications', createNotificationRoutes(env));
  app.use('/api/v1/attendance', createAttendanceRoutes(env));
  app.use('/api/v1/timesheets', createTimesheetRoutes(env));
  app.use('/api/v1/expenses', createExpenseRoutes(env));

  return app;
}
