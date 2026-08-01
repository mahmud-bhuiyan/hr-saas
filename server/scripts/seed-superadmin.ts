import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { connectToDatabase, disconnectFromDatabase } from '../src/config/db.js';
import { createAdmin, hasSuperAdmin } from '../src/modules/admin/admin.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPERADMIN_EMAIL = 'superadmin@hr.com';
const SUPERADMIN_PASSWORD = 'User@123';

async function seedSuperAdmin(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  await connectToDatabase(uri);

  try {
    if (await hasSuperAdmin()) {
      console.log('Super admin already exists — seed skipped.');
      return;
    }

    const admin = await createAdmin({
      email: SUPERADMIN_EMAIL,
      password: SUPERADMIN_PASSWORD,
      role: 'super_admin',
      firstName: 'Super',
      lastName: 'Admin',
    });

    console.log(`Super admin created: ${admin.email} (${admin.id})`);
  } finally {
    await disconnectFromDatabase();
  }
}

seedSuperAdmin().catch((error: unknown) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
