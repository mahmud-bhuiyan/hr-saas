import { describe, expect, it, vi } from 'vitest';
import { loadServerEnv } from '../../../src/config/env.js';

describe('loadServerEnv', () => {
  it('reads PORT from environment', () => {
    vi.stubEnv('PORT', '5000');
    expect(loadServerEnv().port).toBe(5000);
    vi.unstubAllEnvs();
  });

  it('defaults PORT to 5000 when unset', () => {
    vi.stubEnv('PORT', '');
    expect(loadServerEnv().port).toBe(5000);
    vi.unstubAllEnvs();
  });

  it('reads CLIENT_URL from environment', () => {
    vi.stubEnv('CLIENT_URL', 'http://localhost:5173');
    expect(loadServerEnv().clientUrl).toBe('http://localhost:5173');
    vi.unstubAllEnvs();
  });

  it('reads ADMIN_JWT_SECRET from environment', () => {
    vi.stubEnv('ADMIN_JWT_SECRET', 'test-admin-secret');
    expect(loadServerEnv().adminJwtSecret).toBe('test-admin-secret');
    vi.unstubAllEnvs();
  });

  it('reads MONGODB_URI from environment', () => {
    vi.stubEnv('MONGODB_URI', 'mongodb://localhost:27017/hr-saas');
    expect(loadServerEnv().mongodbUri).toBe('mongodb://localhost:27017/hr-saas');
    vi.unstubAllEnvs();
  });
});
