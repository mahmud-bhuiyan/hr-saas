import { describe, expect, it } from 'vitest';
import { comparePassword, hashPassword } from '../../../src/utils/password.js';

describe('hashPassword', () => {
  it('returns a bcrypt hash different from the plain password', async () => {
    const hash = await hashPassword('User@123');

    expect(hash).not.toBe('User@123');
    expect(hash.startsWith('$2')).toBe(true);
  });
});

describe('comparePassword', () => {
  it('returns true for matching password and hash', async () => {
    const hash = await hashPassword('User@123');

    expect(await comparePassword('User@123', hash)).toBe(true);
  });

  it('returns false for non-matching password', async () => {
    const hash = await hashPassword('User@123');

    expect(await comparePassword('wrong-password', hash)).toBe(false);
  });
});
