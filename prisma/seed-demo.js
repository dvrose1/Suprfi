// ABOUTME: Seeds the database with demo accounts for investor demos
// ABOUTME: Run with: node prisma/seed-demo.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Demo credentials - DO NOT USE IN PRODUCTION
const DEMO_PASSWORD = 'Demo1234!';

async function main() {
  console.log('🌱 Seeding demo accounts...\n');

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  // 1. Seed Admin Users
  console.log('👤 Creating/updating admin users...');
  
  await prisma.adminUser.upsert({
    where: { email: 'doug@suprfi.com' },
    update: { passwordHash },
    create: {
      email: 'doug@suprfi.com',
      name: 'Doug',
      role: 'god',
      passwordHash,
    },
  });
  console.log('   ✅ Admin: doug@suprfi.com (role: god)');

  await prisma.adminUser.upsert({
    where: { email: 'demo@suprfi.com' },
    update: { passwordHash },
    create: {
      email: 'demo@suprfi.com',
      name: 'Demo Admin',
      role: 'admin',
      passwordHash,
    },
  });
  console.log('   ✅ Admin: demo@suprfi.com (role: admin)');

  // 2. Find or create demo contractor
  console.log('\n🏢 Setting up demo contractor...');
  
  let demoContractor = await prisma.contractor.findFirst({
    where: { businessName: 'Demo HVAC Services' },
  });

  if (!demoContractor) {
    demoContractor = await prisma.contractor.create({
      data: {
        email: 'contact@demohvac.com',
        businessName: 'Demo HVAC Services',
        name: 'Demo HVAC',
        phone: '5551234567',
        serviceType: 'hvac',
        state: 'TX',
        status: 'active',
      },
    });
  }
  console.log('   ✅ Contractor: ' + demoContractor.businessName);

  // 3. Seed Contractor User
  console.log('\n👷 Creating/updating contractor users...');
  
  await prisma.contractorUser.upsert({
    where: { email: 'demo@contractor.com' },
    update: { passwordHash, contractorId: demoContractor.id },
    create: {
      email: 'demo@contractor.com',
      name: 'Demo Technician',
      role: 'owner',
      passwordHash,
      contractorId: demoContractor.id,
    },
  });
  console.log('   ✅ Contractor User: demo@contractor.com (role: owner)');

  // Also update existing demo users
  await prisma.contractorUser.updateMany({
    where: { email: { in: ['demo@proforce.com', 'test@demo.com'] } },
    data: { passwordHash },
  });
  console.log('   ✅ Updated passwords for existing demo users');

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('🎉 DEMO ACCOUNTS READY');
  console.log('='.repeat(60));
  console.log('\nPassword for all accounts: ' + DEMO_PASSWORD);
  console.log('\n📋 ADMIN PORTAL (SuprOps):');
  console.log('   URL: http://localhost:3000/admin/login');
  console.log('   Email: doug@suprfi.com or demo@suprfi.com');
  console.log('   Password: ' + DEMO_PASSWORD);
  console.log('\n📋 MERCHANT PORTAL (SuprClient):');
  console.log('   URL: http://localhost:3000/client/login');
  console.log('   Email: demo@contractor.com');
  console.log('   Password: ' + DEMO_PASSWORD);
  console.log('\n' + '='.repeat(60));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
