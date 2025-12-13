// Script to create a demo contractor account for testing SuprClient

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create contractor
  const contractor = await prisma.contractor.upsert({
    where: { email: 'demo@proforce.com' },
    update: {},
    create: {
      email: 'demo@proforce.com',
      businessName: 'ProForce Pest Control',
      name: 'Demo Contractor',
      phone: '5551234567',
      serviceType: 'pest',
      state: 'FL',
      status: 'active',
      tier: 'standard',
    },
  });

  console.log('Contractor created:', contractor.id);

  // Create contractor user (owner)
  const passwordHash = await bcrypt.hash('demo1234', 12);
  const user = await prisma.contractorUser.upsert({
    where: { email: 'demo@proforce.com' },
    update: {},
    create: {
      contractorId: contractor.id,
      email: 'demo@proforce.com',
      passwordHash,
      name: 'Demo User',
      role: 'owner',
      isActive: true,
    },
  });

  console.log('User created:', user.id);
  console.log('\n================================');
  console.log('Demo account ready!');
  console.log('================================');
  console.log('URL:      http://localhost:3000/client/login');
  console.log('Email:    demo@proforce.com');
  console.log('Password: demo1234');
  console.log('================================\n');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
