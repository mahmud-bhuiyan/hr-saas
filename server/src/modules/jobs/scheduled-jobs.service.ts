import type { ServerEnv } from '../../config/env.js';
import { Tenant } from '../auth/tenant.model.js';
import { User } from '../admin/user.model.js';
import { Employee } from '../employees/employee.model.js';
import { HrDocument } from '../documents/document.model.js';
import { formatDateString } from '../leave/leave.utils.js';
import { processCarryOverAllTenants } from '../leave/leave-settings.service.js';
import { sendDocumentExpiryReminderEmail } from '../notifications/email.service.js';

const EXPIRY_LOOKAHEAD_DAYS = 30;

export const runDocumentExpiryReminders = async (env: ServerEnv): Promise<void> => {
  const now = new Date();
  const until = new Date(now);
  until.setUTCDate(until.getUTCDate() + EXPIRY_LOOKAHEAD_DAYS);

  const tenants = await Tenant.find({ approvalStatus: 'approved', isActive: true }).select('_id');

  for (const tenant of tenants) {
    const docs = await HrDocument.find({
      tenantId: tenant._id,
      expiryDate: { $gte: now, $lte: until },
    });

    if (docs.length === 0) {
      continue;
    }

    const hrUser = await User.findOne({
      tenantId: tenant._id,
      role: { $in: ['hr_manager', 'company_admin'] },
    }).sort({ createdAt: 1 });

    if (!hrUser?.email) {
      continue;
    }

    const documentSummaries = await Promise.all(
      docs.map(async (doc) => {
        let employeeName: string | undefined;
        if (doc.employeeId) {
          const employee = await Employee.findById(doc.employeeId).select('firstName lastName');
          if (employee) {
            employeeName = `${employee.firstName} ${employee.lastName}`;
          }
        }

        return {
          fileName: doc.fileName,
          expiryDate: doc.expiryDate ? formatDateString(doc.expiryDate) : 'unknown',
          employeeName,
        };
      })
    );

    await sendDocumentExpiryReminderEmail(env, {
      to: hrUser.email,
      documents: documentSummaries,
    });
  }
};

export const runLeaveCarryOverJob = async (): Promise<void> => {
  const now = new Date();
  if (now.getUTCMonth() !== 0 || now.getUTCDate() !== 1) {
    return;
  }

  await processCarryOverAllTenants(now.getUTCFullYear());
};

export const runDailyScheduledJobs = async (env: ServerEnv): Promise<void> => {
  await runDocumentExpiryReminders(env);
  await runLeaveCarryOverJob();
};
