import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/index.js';

describe('GET /', () => {
  const app = createApp();

  it('returns 200', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
  });

  it('returns server is running message', async () => {
    const response = await request(app).get('/');

    expect(response.text).toBe('Server is running');
  });
});
