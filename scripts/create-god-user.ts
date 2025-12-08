// ABOUTME: Script to create the God user for SuprOps
// ABOUTME: Run with: npx ts-node scripts/create-god-user.ts

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'doug@suprfi.com';
  const password = process.argv[2];

  if (!password) {
    console.error('Usage: npx ts-node scripts/create-god-user.ts <password>');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Password must be at least 8 characters');
    process.exit(1);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Check if user exists
  const existing = await prisma.adminUser.findUnique({ where: { email } });

  if (existing) {
    // Update existing user
    const updated = await prisma.adminUser.update({
      where: { email },
      data: {
        passwordHash,
        role: 'god',
        isActive: true,
        name: 'Doug',
      },
    });
    console.log(`Updated existing user: ${updated.email} with role: ${updated.role}`);
  } else {
    // Create new user
    const created = await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        role: 'god',
        isActive: true,
        name: 'Doug',
      },
    });
    console.log(`Created new God user: ${created.email}`);
  }

  console.log('Done! You can now login at /admin/login');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
