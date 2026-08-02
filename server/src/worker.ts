import { connectToDatabase } from './config/db.js';
import { loadServerEnv } from './config/env.js';
import { initEmailService } from './modules/notifications/email.service.js';
import { startNotificationWorker } from './modules/notifications/notification.queue.js';
import { runDailyScheduledJobs } from './modules/jobs/scheduled-jobs.service.js';

const SCHEDULED_JOB_INTERVAL_MS = 24 * 60 * 60 * 1000;

const main = async (): Promise<void> => {
  const env = loadServerEnv();

  if (!env.mongodbUri) {
    throw new Error('MONGODB_URI is required');
  }

  await connectToDatabase(env.mongodbUri);
  initEmailService(env);

  const worker = startNotificationWorker(env);
  if (!worker) {
    process.exit(1);
  }

  console.log('Notification worker started');

  const runJobs = (): void => {
    void runDailyScheduledJobs(env).catch((error: unknown) => {
      console.error('[worker] Scheduled job failed:', error);
    });
  };

  runJobs();
  setInterval(runJobs, SCHEDULED_JOB_INTERVAL_MS);
  console.log('Scheduled jobs registered (daily interval)');
};

main().catch((error: unknown) => {
  console.error('Worker failed to start:', error);
  process.exit(1);
});
