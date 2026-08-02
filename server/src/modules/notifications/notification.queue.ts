import { Queue, Worker, type Job } from 'bullmq';
import { Redis } from 'ioredis';
import type { ServerEnv } from '../../config/env.js';
import { sendEmail, type SendEmailOptions } from './email.service.js';
import {
  createInAppNotification,
  type CreateInAppNotificationInput,
} from './notification.service.js';

const QUEUE_NAME = 'notifications';

export type EmailJobPayload = SendEmailOptions;

export type InAppJobPayload = CreateInAppNotificationInput;

type NotificationJob =
  | { type: 'email'; payload: EmailJobPayload }
  | { type: 'in-app'; payload: InAppJobPayload };

let queue: Queue<NotificationJob> | null = null;
let redisConnection: Redis | null = null;

const getRedisConnection = (env: ServerEnv): Redis | null => {
  if (!env.redisUrl) {
    return null;
  }

  if (!redisConnection) {
    redisConnection = new Redis(env.redisUrl, { maxRetriesPerRequest: null });
  }

  return redisConnection;
};

export const getNotificationQueue = (env: ServerEnv): Queue<NotificationJob> | null => {
  const connection = getRedisConnection(env);
  if (!connection) {
    return null;
  }

  if (!queue) {
    queue = new Queue<NotificationJob>(QUEUE_NAME, { connection });
  }

  return queue;
};

export const enqueueEmail = async (env: ServerEnv, options: EmailJobPayload): Promise<void> => {
  const notificationQueue = getNotificationQueue(env);

  if (notificationQueue) {
    await notificationQueue.add('dispatch', { type: 'email', payload: options });
    return;
  }

  await sendEmail(env, options);
};

export const enqueueInAppNotification = async (
  env: ServerEnv,
  input: InAppJobPayload
): Promise<void> => {
  const notificationQueue = getNotificationQueue(env);

  if (notificationQueue) {
    await notificationQueue.add('dispatch', { type: 'in-app', payload: input });
    return;
  }

  await createInAppNotification(input);
};

export const processNotificationJob = async (
  env: ServerEnv,
  job: Job<NotificationJob>
): Promise<void> => {
  const data = job.data;

  if (data.type === 'email') {
    await sendEmail(env, data.payload);
    return;
  }

  await createInAppNotification(data.payload);
};

export const startNotificationWorker = (env: ServerEnv): Worker<NotificationJob> | null => {
  const connection = getRedisConnection(env);
  if (!connection) {
    console.warn('[worker] REDIS_URL not set — notification worker not started');
    return null;
  }

  const worker = new Worker<NotificationJob>(
    QUEUE_NAME,
    async (job) => {
      await processNotificationJob(env, job);
    },
    { connection }
  );

  worker.on('failed', (job, error) => {
    console.error('[worker] Job failed:', job?.id, error);
  });

  return worker;
};
