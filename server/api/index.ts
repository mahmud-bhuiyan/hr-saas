import { pathToFileURL } from 'node:url';
import { createApp } from '../src/app.js';
import { connectToDatabase } from '../src/config/db.js';
import { loadServerEnv } from '../src/config/env.js';

const env = loadServerEnv();
const app = createApp();

export default app;

const isDirectRun = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;

if (isDirectRun) {
  async function start(): Promise<void> {
    if (env.mongodbUri) {
      await connectToDatabase(env.mongodbUri);
    }

    app.listen(env.port, () => {
      console.log(`Server running at http://localhost:${env.port}`);
    });
  }

  start().catch((error: unknown) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
} else if (env.mongodbUri) {
  void connectToDatabase(env.mongodbUri).catch((error: unknown) => {
    console.error('MongoDB connection failed:', error);
  });
}
