import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import type { UserRole } from '../types/index.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  type?: 'access' | 'refresh';
}

const ACCESS_EXPIRY: SignOptions['expiresIn'] = '15m';
const REFRESH_EXPIRY: SignOptions['expiresIn'] = '7d';

export function signAccessToken(
  payload: Omit<JwtPayload, 'type'>,
  secret: Secret,
  expiresIn: SignOptions['expiresIn'] = ACCESS_EXPIRY
): string {
  return jwt.sign({ ...payload, type: 'access' }, secret, { expiresIn });
}

export function signRefreshToken(
  payload: Omit<JwtPayload, 'type'>,
  secret: Secret,
  expiresIn: SignOptions['expiresIn'] = REFRESH_EXPIRY
): string {
  return jwt.sign({ ...payload, type: 'refresh' }, secret, { expiresIn });
}

export function verifyAccessToken(token: string, secret: string): JwtPayload {
  const payload = jwt.verify(token, secret) as JwtPayload;
  if (payload.type && payload.type !== 'access') {
    throw new Error('Invalid token type');
  }
  return payload;
}

export function verifyRefreshToken(token: string, secret: string): JwtPayload {
  const payload = jwt.verify(token, secret) as JwtPayload;
  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type');
  }
  return payload;
}
