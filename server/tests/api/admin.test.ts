import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/index.js';
import { loadServerEnv } from '../../src/config/env.js';
import { User } from '../../src/modules/admin/user.model.js';
import { signAccessToken } from '../../src/utils/jwt.js';
import { useTestDatabase } from '../helpers/db.js';

describe('POST /api/v1/admins', () => {
  useTestDatabase();

  const app = createApp();
  const env = loadServerEnv();

  beforeEach(async () => {
    await User.deleteMany({});
  });

  const validBody = {
    email: 'superadmin@hr.com',
    password: 'User@123',
    role: 'super_admin',
    firstName: 'Super',
    lastName: 'Admin',
  };

  it('creates the first super_admin without auth (bootstrap)', async () => {
    const response = await request(app).post('/api/v1/admins').send(validBody);

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('ok');
    expect(response.body.data.email).toBe('superadmin@hr.com');
    expect(response.body.data.role).toBe('super_admin');
    expect(response.body.data.passwordHash).toBeUndefined();
  });

  it('rejects duplicate email with 409', async () => {
    const bootstrap = await request(app).post('/api/v1/admins').send(validBody);
    expect(bootstrap.status).toBe(201);

    const token = signAccessToken(
      {
        sub: bootstrap.body.data.id,
        email: 'superadmin@hr.com',
        role: 'super_admin',
      },
      env.adminJwtSecret || 'test-secret'
    );

    const response = await request(app)
      .post('/api/v1/admins')
      .set('Authorization', `Bearer ${token}`)
      .send(validBody);

    expect(response.status).toBe(409);
    expect(response.body.message).toBe('Email already in use');
  });

  it('requires auth when users already exist', async () => {
    await request(app).post('/api/v1/admins').send(validBody);

    const response = await request(app)
      .post('/api/v1/admins')
      .send({
        email: 'other@hr.com',
        password: 'User@123',
        role: 'company_admin',
      });

    expect(response.status).toBe(401);
  });

  it('allows super_admin to create another admin', async () => {
    const bootstrap = await request(app).post('/api/v1/admins').send(validBody);
    const superAdminId = bootstrap.body.data.id;

    const token = signAccessToken(
      {
        sub: superAdminId,
        email: 'superadmin@hr.com',
        role: 'super_admin',
      },
      env.adminJwtSecret || 'test-secret'
    );

    const response = await request(app)
      .post('/api/v1/admins')
      .set('Authorization', `Bearer ${token}`)
      .send({
        email: 'admin@acme.com',
        password: 'User@123',
        role: 'company_admin',
        firstName: 'Company',
        lastName: 'Admin',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.email).toBe('admin@acme.com');
    expect(response.body.data.role).toBe('company_admin');
  });

  it('rejects bootstrap when role is not super_admin', async () => {
    const response = await request(app).post('/api/v1/admins').send({
      email: 'admin@acme.com',
      password: 'User@123',
      role: 'company_admin',
    });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Bootstrap admin must be super_admin');
  });

  it('returns 400 for invalid email', async () => {
    const response = await request(app).post('/api/v1/admins').send({
      email: 'not-an-email',
      password: 'User@123',
      role: 'super_admin',
    });

    expect(response.status).toBe(400);
  });

  it('returns 400 for short password', async () => {
    const response = await request(app).post('/api/v1/admins').send({
      email: 'superadmin@hr.com',
      password: 'short',
      role: 'super_admin',
    });

    expect(response.status).toBe(400);
  });
});
