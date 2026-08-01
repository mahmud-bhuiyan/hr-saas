import dns from 'node:dns';
import mongoose from 'mongoose';

const configureDnsForMongoSrv = (uri: string): void => {
  if (!uri.startsWith('mongodb+srv://')) {
    return;
  }

  // Some ISP/resolver DNS servers reject SRV lookups that Node uses for mongodb+srv://
  const servers = process.env.DNS_SERVERS?.split(',').map((s) => s.trim()).filter(Boolean);
  dns.setServers(servers?.length ? servers : ['8.8.8.8', '1.1.1.1']);
}

export const connectToDatabase = async (uri: string): Promise<void> => {
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (mongoose.connection.readyState === 2) {
    await mongoose.connection.asPromise();
    return;
  }

  configureDnsForMongoSrv(uri);
  await mongoose.connect(uri);
}

export const disconnectFromDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
}
