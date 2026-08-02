import mongoose from 'mongoose';
import { Redis } from 'ioredis';
import type { ServerEnv } from './env.js';
import { APP_NAME } from '../constants/app.js';
import type { ApiHealthResponse } from '../types/index.js';

const pingRedis = async (redisUrl: string): Promise<'ok' | 'error'> => {
  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    connectTimeout: 3000,
    lazyConnect: true,
  });
  redis.on('error', () => {
    // handled in catch below
  });
  try {
    await redis.connect();
    const pong = await redis.ping();
    return pong === 'PONG' ? 'ok' : 'error';
  } catch {
    return 'error';
  } finally {
    redis.disconnect();
  }
};

export const buildHealthResponse = async (env: ServerEnv): Promise<ApiHealthResponse> => {
  const checks: NonNullable<ApiHealthResponse['checks']> = {
    mongodb: mongoose.connection.readyState === 1 ? 'ok' : 'error',
    redis: env.redisUrl ? await pingRedis(env.redisUrl) : 'skipped',
    stripe:
      env.stripeSecretKey && env.stripeWebhookSecret && env.stripePriceId
        ? 'configured'
        : 'not_configured',
  };

  const status = checks.mongodb === 'ok' ? 'ok' : 'degraded';

  return {
    status,
    service: APP_NAME,
    timestamp: new Date().toISOString(),
    checks,
  };
};
