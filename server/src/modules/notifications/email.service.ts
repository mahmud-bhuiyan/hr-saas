import sgMail from '@sendgrid/mail';
import type { ServerEnv } from '../../config/env.js';

export interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

let configured = false;

export const initEmailService = (env: ServerEnv): void => {
  if (env.sendgridApiKey) {
    sgMail.setApiKey(env.sendgridApiKey);
    configured = true;
  }
};

export const sendEmail = async (env: ServerEnv, options: SendEmailOptions): Promise<void> => {
  if (!env.sendgridApiKey || !env.emailFrom) {
    console.info('[email] Skipped (SendGrid not configured):', {
      to: options.to,
      subject: options.subject,
      text: options.text,
    });
    return;
  }

  if (!configured) {
    initEmailService(env);
  }

  try {
    await sgMail.send({
      to: options.to,
      from: env.emailFrom,
      subject: options.subject,
      text: options.text,
      html: options.html ?? options.text.replace(/\n/g, '<br>'),
    });
  } catch (error) {
    console.error('[email] Failed to send:', options.subject, 'to', options.to, error);
  }
};

export const sendLeaveSubmittedEmail = async (
  env: ServerEnv,
  params: {
    to: string;
    employeeName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason?: string;
  }
): Promise<void> => {
  const text = [
    `${params.employeeName} has submitted a leave request.`,
    '',
    `Type: ${params.leaveType}`,
    `Dates: ${params.startDate} to ${params.endDate}`,
    params.reason ? `Reason: ${params.reason}` : '',
    '',
    'Please review and approve or decline in the HR platform.',
  ]
    .filter(Boolean)
    .join('\n');

  await sendEmail(env, {
    to: params.to,
    subject: `Leave request from ${params.employeeName}`,
    text,
  });
};

export const sendLeaveApprovedEmail = async (
  env: ServerEnv,
  params: {
    to: string;
    startDate: string;
    endDate: string;
    approverName: string;
  }
): Promise<void> => {
  const text = [
    'Your leave request has been approved.',
    '',
    `Dates: ${params.startDate} to ${params.endDate}`,
    `Approved by: ${params.approverName}`,
  ].join('\n');

  await sendEmail(env, {
    to: params.to,
    subject: 'Leave request approved',
    text,
  });
};

export const sendLeaveDeclinedEmail = async (
  env: ServerEnv,
  params: {
    to: string;
    startDate: string;
    endDate: string;
    declineReason?: string;
  }
): Promise<void> => {
  const text = [
    'Your leave request has been declined.',
    '',
    `Dates: ${params.startDate} to ${params.endDate}`,
    params.declineReason ? `Reason: ${params.declineReason}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  await sendEmail(env, {
    to: params.to,
    subject: 'Leave request declined',
    text,
  });
};

export const sendTimesheetSubmittedEmail = async (
  env: ServerEnv,
  params: {
    to: string;
    employeeName: string;
    weekOf: string;
    totalHours: number;
  }
): Promise<void> => {
  const text = [
    `${params.employeeName} has submitted a timesheet for approval.`,
    '',
    `Week of: ${params.weekOf}`,
    `Total hours: ${params.totalHours}`,
    '',
    'Please review and approve or decline in the HR platform.',
  ].join('\n');

  await sendEmail(env, {
    to: params.to,
    subject: `Timesheet submitted by ${params.employeeName}`,
    text,
  });
};

export const sendTimesheetApprovedEmail = async (
  env: ServerEnv,
  params: {
    to: string;
    weekOf: string;
    totalHours: number;
    approverName: string;
  }
): Promise<void> => {
  const text = [
    'Your timesheet has been approved.',
    '',
    `Week of: ${params.weekOf}`,
    `Total hours: ${params.totalHours}`,
    `Approved by: ${params.approverName}`,
  ].join('\n');

  await sendEmail(env, {
    to: params.to,
    subject: 'Timesheet approved',
    text,
  });
};

export const sendTimesheetDeclinedEmail = async (
  env: ServerEnv,
  params: {
    to: string;
    weekOf: string;
    declineReason?: string;
  }
): Promise<void> => {
  const text = [
    'Your timesheet has been declined.',
    '',
    `Week of: ${params.weekOf}`,
    params.declineReason ? `Reason: ${params.declineReason}` : '',
    '',
    'You can edit and resubmit your timesheet in the HR platform.',
  ]
    .filter(Boolean)
    .join('\n');

  await sendEmail(env, {
    to: params.to,
    subject: 'Timesheet declined',
    text,
  });
};

export const sendExpenseSubmittedEmail = async (
  env: ServerEnv,
  params: {
    to: string;
    employeeName: string;
    category: string;
    amount: number;
    currency: string;
    date: string;
    description: string;
  }
): Promise<void> => {
  const text = [
    `${params.employeeName} has submitted an expense claim.`,
    '',
    `Category: ${params.category}`,
    `Amount: ${params.currency} ${params.amount.toFixed(2)}`,
    `Date: ${params.date}`,
    `Description: ${params.description}`,
    '',
    'Please review and approve or decline in the HR platform.',
  ].join('\n');

  await sendEmail(env, {
    to: params.to,
    subject: `Expense claim from ${params.employeeName}`,
    text,
  });
};

export const sendExpenseApprovedEmail = async (
  env: ServerEnv,
  params: {
    to: string;
    category: string;
    amount: number;
    currency: string;
    date: string;
    approverName: string;
  }
): Promise<void> => {
  const text = [
    'Your expense claim has been approved.',
    '',
    `Category: ${params.category}`,
    `Amount: ${params.currency} ${params.amount.toFixed(2)}`,
    `Date: ${params.date}`,
    `Approved by: ${params.approverName}`,
  ].join('\n');

  await sendEmail(env, {
    to: params.to,
    subject: 'Expense claim approved',
    text,
  });
};

export const sendExpenseDeclinedEmail = async (
  env: ServerEnv,
  params: {
    to: string;
    category: string;
    amount: number;
    currency: string;
    date: string;
    declineReason?: string;
  }
): Promise<void> => {
  const text = [
    'Your expense claim has been declined.',
    '',
    `Category: ${params.category}`,
    `Amount: ${params.currency} ${params.amount.toFixed(2)}`,
    `Date: ${params.date}`,
    params.declineReason ? `Reason: ${params.declineReason}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  await sendEmail(env, {
    to: params.to,
    subject: 'Expense claim declined',
    text,
  });
};
