/**
 * Seed script to create an admin user in the database.
 * Run with: npx ts-node --project tsconfig.json scripts/seed-admin.ts
 * Or: npx tsx scripts/seed-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// ─── CONFIGURE YOUR ADMIN HERE ───────────────────────────────────────────────
const ADMIN_EMAIL = 'admin@electromart.com';
const ADMIN_NAME  = 'ElectroMart Admin';
const ADMIN_PASS  = 'Admin@123456'; // Change this!
// ─────────────────────────────────────────────────────────────────────────────

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('🌱 Seeding admin user...\n');

  try {
    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

    if (existing) {
      // Upgrade existing user to admin
      const updated = await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: { role: 'admin' },
      });
      console.log(`✅ Existing user promoted to admin:`);
      console.log(`   Name:  ${updated.name}`);
      console.log(`   Email: ${updated.email}`);
      console.log(`   Role:  ${updated.role}`);
    } else {
      // Create new admin user
      const newUser = await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          name: ADMIN_NAME,
          passwordHash: hashPassword(ADMIN_PASS),
          role: 'admin',
        },
      });
      console.log(`✅ Admin user created:`);
      console.log(`   Name:  ${newUser.name}`);
      console.log(`   Email: ${newUser.email}`);
      console.log(`   Role:  ${newUser.role}`);
      console.log(`\n📝 Login credentials:`);
      console.log(`   Email:    ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASS}`);
    }

    console.log('\n🎉 Done! You can now log in and access /admin/dashboard');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
