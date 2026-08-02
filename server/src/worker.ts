import { connectToDatabase } from './config/db.js';
import { loadServerEnv } from './config/env.js';
import { initEmailService } from './modules/notifications/email.service.js';
import { startNotificationWorker } from './modules/notifications/notification.queue.js';

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
};

main().catch((error: unknown) => {
  console.error('Worker failed to start:', error);
  process.exit(1);
});
