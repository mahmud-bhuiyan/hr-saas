import type { ServerEnv } from '../../config/env.js';
import { findUserByEmail } from '../admin/admin.service.js';
import { User } from '../admin/user.model.js';
import { enqueueEmail } from '../notifications/notification.queue.js';
import {
  PasswordResetToken,
  RESET_TOKEN_TTL_MS,
  generateResetToken,
  hashResetToken,
} from './password-reset.model.js';
import { AuthServiceError } from './auth.service.js';
import { hashPassword } from '../../utils/password.js';

export interface PasswordResetRequestResult {
  message: string;
}

const buildResetLink = (env: ServerEnv, token: string): string => {
  const base = env.clientUrl.replace(/\/$/, '');
  return `${base}/reset-password?token=${encodeURIComponent(token)}`;
};

export const requestPasswordReset = async (
  email: string,
  env: ServerEnv
): Promise<PasswordResetRequestResult> => {
  const user = await findUserByEmail(email);

  if (user) {
    const { token, tokenHash } = generateResetToken();

    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });

    const resetLink = buildResetLink(env, token);

    await enqueueEmail(env, {
      to: user.email,
      subject: 'Reset your password',
      text: [
        'You requested a password reset for your HR SaaS account.',
        '',
        `Reset your password: ${resetLink}`,
        '',
        'This link expires in 1 hour. If you did not request this, ignore this email.',
      ].join('\n'),
    });
  }

  return {
    message: 'If an account exists for that email, a reset link has been sent.',
  };
};

export const resetPasswordWithToken = async (
  token: string,
  newPassword: string
): Promise<PasswordResetRequestResult> => {
  const tokenHash = hashResetToken(token);

  const resetRecord = await PasswordResetToken.findOne({
    tokenHash,
    usedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!resetRecord) {
    throw new AuthServiceError('Invalid or expired reset token', 400);
  }

  const user = await User.findById(resetRecord.userId).select('+passwordHash');
  if (!user) {
    throw new AuthServiceError('Invalid or expired reset token', 400);
  }

  user.passwordHash = await hashPassword(newPassword);
  await user.save();

  resetRecord.usedAt = new Date();
  await resetRecord.save();

  await PasswordResetToken.updateMany(
    { userId: user._id, usedAt: null },
    { usedAt: new Date() }
  );

  return { message: 'Password updated successfully. You can sign in now.' };
};

export const sendInviteSetPasswordEmail = async (
  env: ServerEnv,
  email: string,
  token: string
): Promise<void> => {
  const resetLink = buildResetLink(env, token);

  await enqueueEmail(env, {
    to: email,
    subject: 'You have been invited to HR SaaS',
    text: [
      'You have been invited to join your company on HR SaaS.',
      '',
      `Set your password to activate your account: ${resetLink}`,
      '',
      'This link expires in 1 hour.',
    ].join('\n'),
  });
};

export const createPasswordResetTokenForUser = async (
  userId: string
): Promise<string> => {
  const { token, tokenHash } = generateResetToken();

  await PasswordResetToken.create({
    userId,
    tokenHash,
    expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
  });

  return token;
};
