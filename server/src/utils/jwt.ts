import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import type { UserRole } from '../types/index.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  tenantId?: string;
}

export function signAccessToken(
  payload: JwtPayload,
  secret: Secret,
  expiresIn: SignOptions['expiresIn'] = '15m'
): string {
  return jwt.sign(payload, secret, { expiresIn });
}

export function verifyAccessToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret) as JwtPayload;
}
