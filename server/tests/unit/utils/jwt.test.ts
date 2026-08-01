import { describe, expect, it } from 'vitest';
import { signAccessToken, verifyAccessToken } from '../../../src/utils/jwt.js';

describe('signAccessToken / verifyAccessToken', () => {
  const secret = 'test-jwt-secret';

  it('round-trips payload through sign and verify', () => {
    const payload = {
      sub: 'user-id-1',
      email: 'superadmin@hr.com',
      role: 'super_admin' as const,
    };

    const token = signAccessToken(payload, secret);
    const decoded = verifyAccessToken(token, secret);

    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });

  it('throws for invalid token', () => {
    expect(() => verifyAccessToken('not-a-token', secret)).toThrow();
  });
});
