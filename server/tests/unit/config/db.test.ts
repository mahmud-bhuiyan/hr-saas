import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { afterEach, describe, expect, it } from 'vitest';
import { connectToDatabase, disconnectFromDatabase } from '../../../src/config/db.js';

describe('connectToDatabase', () => {
  let mongoServer: MongoMemoryServer;

  afterEach(async () => {
    if (mongoose.connection.readyState !== 0) {
      await disconnectFromDatabase();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it('throws when MONGODB_URI is empty', async () => {
    await expect(connectToDatabase('')).rejects.toThrow('MONGODB_URI is required');
  });

  it('connects to MongoDB', async () => {
    mongoServer = await MongoMemoryServer.create();
    await connectToDatabase(mongoServer.getUri());

    expect(mongoose.connection.readyState).toBe(1);
  });

  it('reuses an existing connection', async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await connectToDatabase(uri);
    const firstConnection = mongoose.connection;

    await connectToDatabase(uri);

    expect(mongoose.connection).toBe(firstConnection);
    expect(mongoose.connection.readyState).toBe(1);
  });
});
