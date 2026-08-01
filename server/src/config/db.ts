import dns from 'node:dns';
import mongoose from 'mongoose';

function configureDnsForMongoSrv(uri: string): void {
  if (!uri.startsWith('mongodb+srv://')) {
    return;
  }

  // Some ISP/resolver DNS servers reject SRV lookups that Node uses for mongodb+srv://
  const servers = process.env.DNS_SERVERS?.split(',').map((s) => s.trim()).filter(Boolean);
  dns.setServers(servers?.length ? servers : ['8.8.8.8', '1.1.1.1']);
}

export async function connectToDatabase(uri: string): Promise<void> {
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  configureDnsForMongoSrv(uri);
  await mongoose.connect(uri);
}

export async function disconnectFromDatabase(): Promise<void> {
  await mongoose.disconnect();
}
