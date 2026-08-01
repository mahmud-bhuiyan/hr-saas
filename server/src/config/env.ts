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
}

export const loadServerEnv = (): ServerEnv => {
  return {
    port: Number(process.env.PORT) || 5000,
    mongodbUri: process.env.MONGODB_URI ?? '',
    redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
    clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
    adminJwtSecret: process.env.ADMIN_JWT_SECRET ?? '',
    imgbbApiKey: process.env.IMGBB_API_KEY ?? '',
  };
}
