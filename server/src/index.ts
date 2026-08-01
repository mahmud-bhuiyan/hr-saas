import { createApp } from './app.js';
import { loadServerEnv } from './config/env.js';

const env = loadServerEnv();
const app = createApp();

app.listen(env.port, () => {
  console.log(`Server running at http://localhost:${env.port}`);
});
