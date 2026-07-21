import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { Role } from '@/common/constants/enums';
import { User, UserSchema } from '@/database/schemas/user.schema';

const BCRYPT_ROUNDS = 12;

async function run(): Promise<void> {
  const { MONGODB_URI, SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD } = process.env;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set; cannot connect to the database.');
  }
  if (!SEED_ADMIN_NAME || !SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
    throw new Error(
      'SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, and SEED_ADMIN_PASSWORD must all be set to run the seed script.',
    );
  }

  await mongoose.connect(MONGODB_URI);
  const UserModel = mongoose.model(User.name, UserSchema);

  const email = SEED_ADMIN_EMAIL.toLowerCase().trim();
  const existing = await UserModel.findOne({ email });
  if (existing) {
    console.log(`Seed skipped: a user with email "${email}" already exists.`);
    return;
  }

  const passwordHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, BCRYPT_ROUNDS);
  await UserModel.create({
    name: SEED_ADMIN_NAME,
    email,
    passwordHash,
    role: Role.ADMIN,
    isActive: true,
  });

  console.log(`Seed complete: created initial ADMIN user "${email}".`);
}

run()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error: unknown) => {
    console.error('Seed failed:', error instanceof Error ? error.message : error);
    await mongoose.disconnect().catch(() => undefined);
    process.exit(1);
  });
