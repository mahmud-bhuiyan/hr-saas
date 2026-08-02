import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { loadServerEnv } from './config/env.js';
import { buildHealthResponse } from './config/health.js';
import { createAdminRoutes } from './modules/admin/admin.routes.js';
import { createRegistrationRoutes } from './modules/admin/registration.routes.js';
import { stripeWebhookHandler } from './modules/billing/billing.controller.js';
import { createBillingRoutes } from './modules/billing/billing.routes.js';
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
import { createReportRoutes } from './modules/reports/report.routes.js';

export const createApp = () => {
  const env = loadServerEnv();
  const app = express();

  app.use(
    cors({
      origin: env.clientUrl,
      credentials: true,
    })
  );

  app.post(
    '/api/v1/billing/webhook',
    express.raw({ type: 'application/json' }),
    stripeWebhookHandler(env)
  );

  app.use(express.json());
  app.use(cookieParser());

  app.get('/', (_req, res) => {
    res.type('text').send('Server is running');
  });

  app.get('/api/v1/health', async (_req, res) => {
    const response = await buildHealthResponse(env);
    res.status(response.status === 'ok' ? 200 : 503).json(response);
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
  app.use('/api/v1/reports', createReportRoutes(env));
  app.use('/api/v1/billing', createBillingRoutes(env));

  return app;
}
