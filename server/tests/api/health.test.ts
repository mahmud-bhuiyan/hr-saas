import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';

describe('GET /api/health', () => {
  const app = createApp();

  it('returns 200 and ok status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('returns service name HR SaaS', async () => {
    const response = await request(app).get('/api/health');

    expect(response.body.service).toBe('HR SaaS');
  });

  it('returns ISO timestamp', async () => {
    const response = await request(app).get('/api/health');

    expect(response.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
