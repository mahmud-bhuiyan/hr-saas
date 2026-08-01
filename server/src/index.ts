import { createApp } from './app.js';
import { connectToDatabase } from './config/db.js';
import { loadServerEnv } from './config/env.js';

const env = loadServerEnv();

async function start(): Promise<void> {
  await connectToDatabase(env.mongodbUri);

  const app = createApp();

  app.listen(env.port, () => {
    console.log(`Server running at http://localhost:${env.port}`);
  });
}

start().catch((error: unknown) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
