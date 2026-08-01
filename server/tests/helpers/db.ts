import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { afterAll, beforeAll } from 'vitest';
import { connectToDatabase, disconnectFromDatabase } from '../../src/config/db.js';

let mongoServer: MongoMemoryServer;

export async function setupTestDatabase(): Promise<string> {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await connectToDatabase(uri);
  return uri;
}

export async function teardownTestDatabase(): Promise<void> {
  await mongoose.connection.dropDatabase();
  await disconnectFromDatabase();
  await mongoServer.stop();
}

export function useTestDatabase(): void {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });
}
