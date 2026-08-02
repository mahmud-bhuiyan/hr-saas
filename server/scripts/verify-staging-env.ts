import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Redis } from 'ioredis';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

type CheckResult = { name: string; ok: boolean; detail: string };

const requiredVars = ['MONGODB_URI', 'CLIENT_URL', 'ADMIN_JWT_SECRET'] as const;

const recommendedVars = [
  'REDIS_URL',
  'SENDGRID_API_KEY',
  'EMAIL_FROM',
  'S3_BUCKET',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRICE_ID',
] as const;

const verifyStagingEnv = async (): Promise<void> => {
  const results: CheckResult[] = [];

  for (const name of requiredVars) {
    const value = process.env[name]?.trim();
    results.push({
      name,
      ok: Boolean(value),
      detail: value ? 'set' : 'missing',
    });
  }

  for (const name of recommendedVars) {
    const value = process.env[name]?.trim();
    results.push({
      name,
      ok: Boolean(value),
      detail: value ? 'set' : 'missing (recommended for staging)',
    });
  }

  const mongodbUri = process.env.MONGODB_URI;
  if (mongodbUri) {
    try {
      await mongoose.connect(mongodbUri);
      results.push({ name: 'mongodb_connect', ok: true, detail: 'connected' });
      await mongoose.disconnect();
    } catch (error: unknown) {
      results.push({
        name: 'mongodb_connect',
        ok: false,
        detail: error instanceof Error ? error.message : 'connection failed',
      });
    }
  }

  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    const redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      lazyConnect: true,
    });
    redis.on('error', () => {
      // handled in ping catch below
    });
    try {
      await redis.connect();
      const pong = await redis.ping();
      results.push({
        name: 'redis_connect',
        ok: pong === 'PONG',
        detail: pong === 'PONG' ? 'connected' : `unexpected response: ${pong}`,
      });
    } catch (error: unknown) {
      results.push({
        name: 'redis_connect',
        ok: false,
        detail: error instanceof Error ? error.message : 'connection failed',
      });
    } finally {
      redis.disconnect();
    }
  }

  const failedRequired = results.filter(
    (result) => !result.ok && requiredVars.includes(result.name as (typeof requiredVars)[number])
  );
  const failedRecommended = results.filter(
    (result) =>
      !result.ok &&
      (recommendedVars.includes(result.name as (typeof recommendedVars)[number]) ||
        result.name.endsWith('_connect'))
  );

  for (const result of results) {
    const marker = result.ok ? '✓' : '✗';
    console.log(`${marker} ${result.name}: ${result.detail}`);
  }

  if (failedRequired.length > 0) {
    console.error('\nStaging verification failed — fix required env vars above.');
    process.exit(1);
  }

  if (failedRecommended.length > 0) {
    console.warn('\nStaging verification passed with warnings — review recommended vars for Stage 2.');
    process.exit(0);
  }

  console.log('\nStaging verification passed.');
};

verifyStagingEnv().catch((error: unknown) => {
  console.error('Verification failed:', error);
  process.exit(1);
});
