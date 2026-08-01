import { createApp } from './src/app.js';
import { connectToDatabase } from './src/config/db.js';
import { loadServerEnv } from './src/config/env.js';

const env = loadServerEnv();
const app = createApp();

if (env.mongodbUri) {
  void connectToDatabase(env.mongodbUri).catch((error: unknown) => {
    console.error('MongoDB connection failed:', error);
  });
}

export default app;
