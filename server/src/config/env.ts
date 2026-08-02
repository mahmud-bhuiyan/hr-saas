import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

export interface ServerEnv {
  port: number;
  mongodbUri: string;
  redisUrl: string;
  clientUrl: string;
  adminJwtSecret: string;
  imgbbApiKey: string;
  sendgridApiKey: string;
  emailFrom: string;
  s3Endpoint: string;
  s3Region: string;
  s3Bucket: string;
  s3AccessKeyId: string;
  s3SecretAccessKey: string;
  s3ForcePathStyle: boolean;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  stripePriceId: string;
}

export const loadServerEnv = (): ServerEnv => {
  return {
    port: Number(process.env.PORT) || 5000,
    mongodbUri: process.env.MONGODB_URI ?? '',
    redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
    clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
    adminJwtSecret: process.env.ADMIN_JWT_SECRET ?? '',
    imgbbApiKey: process.env.IMGBB_API_KEY ?? '',
    sendgridApiKey: process.env.SENDGRID_API_KEY ?? '',
    emailFrom: process.env.EMAIL_FROM ?? '',
    s3Endpoint: process.env.S3_ENDPOINT ?? '',
    s3Region: process.env.S3_REGION ?? 'us-east-1',
    s3Bucket: process.env.S3_BUCKET ?? '',
    s3AccessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
    s3SecretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
    s3ForcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
    stripePriceId: process.env.STRIPE_PRICE_ID ?? '',
  };
}
