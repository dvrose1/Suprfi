// Script to create demo data for SuprClient testing
// All demo data is flagged for easy removal later

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating demo data...\n');

  // 1. Create demo contractor
  const contractor = await prisma.contractor.upsert({
    where: { email: 'test@demo.com' },
    update: {},
    create: {
      email: 'test@demo.com',
      businessName: 'Demo HVAC Services',
      name: 'Demo Company',
      phone: '5555550100',
      serviceType: 'hvac',
      state: 'TX',
      status: 'active',
      tier: 'premium',
      settings: { isDemo: true },
    },
  });
  console.log('✓ Created contractor:', contractor.businessName);

  // 2. Create demo contractor user
  const passwordHash = await bcrypt.hash('demo1234', 12);
  const user = await prisma.contractorUser.upsert({
    where: { email: 'test@demo.com' },
    update: {},
    create: {
      contractorId: contractor.id,
      email: 'test@demo.com',
      passwordHash,
      name: 'Demo User',
      role: 'owner',
      isActive: true,
    },
  });
  console.log('✓ Created user:', user.email);

  // 3. Create demo customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@demo.test',
        phone: '5555550101',
        addressLine1: '123 Oak Street',
        city: 'Austin',
        state: 'TX',
        postalCode: '78701',
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@demo.test',
        phone: '5555550102',
        addressLine1: '456 Maple Ave',
        city: 'Dallas',
        state: 'TX',
        postalCode: '75201',
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'Michael',
        lastName: 'Williams',
        email: 'mike.w@demo.test',
        phone: '5555550103',
        addressLine1: '789 Pine Road',
        city: 'Houston',
        state: 'TX',
        postalCode: '77001',
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'Emily',
        lastName: 'Brown',
        email: 'emily.b@demo.test',
        phone: '5555550104',
        addressLine1: '321 Cedar Lane',
        city: 'San Antonio',
        state: 'TX',
        postalCode: '78201',
      },
    }),
    prisma.customer.create({
      data: {
        firstName: 'David',
        lastName: 'Martinez',
        email: 'david.m@demo.test',
        phone: '5555550105',
        addressLine1: '654 Elm Street',
        city: 'Austin',
        state: 'TX',
        postalCode: '78702',
      },
    }),
  ]);
  console.log('✓ Created', customers.length, 'demo customers');

  // 4. Create jobs for each customer
  const jobs = await Promise.all(
    customers.map((customer, i) =>
      prisma.job.create({
        data: {
          customerId: customer.id,
          serviceType: ['hvac', 'hvac', 'hvac', 'hvac', 'hvac'][i],
          estimateAmount: [12500, 3500, 8500, 6000, 15000][i],
          status: 'completed',
        },
      })
    )
  );
  console.log('✓ Created', jobs.length, 'demo jobs');

  // 5. Link jobs to contractor
  await Promise.all(
    jobs.map((job) =>
      prisma.contractorJob.create({
        data: {
          contractorId: contractor.id,
          jobId: job.id,
        },
      })
    )
  );
  console.log('✓ Linked jobs to contractor');

  // 6. Create applications with various statuses
  const now = new Date();
  const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const daysFromNow = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  // Application 1: Funded (complete success story)
  const app1 = await prisma.application.create({
    data: {
      customerId: customers[0].id,
      jobId: jobs[0].id,
      token: `demo_token_${Date.now()}_1`,
      tokenExpiresAt: daysFromNow(30),
      status: 'funded',
      createdAt: daysAgo(32),
    },
  });
  const decision1 = await prisma.decision.create({
    data: {
      applicationId: app1.id,
      decisionStatus: 'approved',
      decidedAt: daysAgo(30),
      score: 720,
      ruleHits: { creditScore: 'good', dti: 'low', employmentStable: true },
    },
  });
  await prisma.offer.create({
    data: {
      decisionId: decision1.id,
      apr: 8.99,
      termMonths: 60,
      monthlyPayment: 259.12,
      totalAmount: 15547.20,
      selected: true,
      selectedAt: daysAgo(29),
    },
  });
  await prisma.loan.create({
    data: {
      applicationId: app1.id,
      lenderName: 'SuprFi Prime',
      lenderLoanId: 'DEMO-LN-001',
      fundedAmount: 12500,
      fundingDate: daysAgo(28),
      status: 'repaying',
      paymentSchedule: [
        { date: daysAgo(0).toISOString(), amount: 259.12, status: 'paid' },
        { date: daysFromNow(30).toISOString(), amount: 259.12, status: 'pending' },
      ],
    },
  });

  // Application 2: Active loan (partially paid)
  const app2 = await prisma.application.create({
    data: {
      customerId: customers[1].id,
      jobId: jobs[1].id,
      token: `demo_token_${Date.now()}_2`,
      tokenExpiresAt: daysFromNow(30),
      status: 'funded',
      createdAt: daysAgo(92),
    },
  });
  const decision2 = await prisma.decision.create({
    data: {
      applicationId: app2.id,
      decisionStatus: 'approved',
      decidedAt: daysAgo(90),
      score: 680,
    },
  });
  await prisma.offer.create({
    data: {
      decisionId: decision2.id,
      apr: 12.99,
      termMonths: 24,
      monthlyPayment: 166.42,
      totalAmount: 3994.08,
      selected: true,
      selectedAt: daysAgo(89),
    },
  });
  await prisma.loan.create({
    data: {
      applicationId: app2.id,
      lenderName: 'SuprFi Flex',
      lenderLoanId: 'DEMO-LN-002',
      fundedAmount: 3500,
      fundingDate: daysAgo(88),
      status: 'repaying',
      paymentSchedule: [
        { date: daysAgo(58).toISOString(), amount: 166.42, status: 'paid' },
        { date: daysAgo(28).toISOString(), amount: 166.42, status: 'paid' },
        { date: daysFromNow(2).toISOString(), amount: 166.42, status: 'pending' },
      ],
    },
  });

  // Application 3: Approved, pending signature
  const app3 = await prisma.application.create({
    data: {
      customerId: customers[2].id,
      jobId: jobs[2].id,
      token: `demo_token_${Date.now()}_3`,
      tokenExpiresAt: daysFromNow(30),
      status: 'approved',
      createdAt: daysAgo(3),
    },
  });
  const decision3 = await prisma.decision.create({
    data: {
      applicationId: app3.id,
      decisionStatus: 'approved',
      decidedAt: daysAgo(2),
      score: 695,
    },
  });
  await prisma.offer.create({
    data: {
      decisionId: decision3.id,
      apr: 9.99,
      termMonths: 48,
      monthlyPayment: 215.18,
      totalAmount: 10328.64,
      selected: true,
      selectedAt: daysAgo(1),
    },
  });

  // Application 4: Submitted, awaiting decision
  const app4 = await prisma.application.create({
    data: {
      customerId: customers[3].id,
      jobId: jobs[3].id,
      token: `demo_token_${Date.now()}_4`,
      tokenExpiresAt: daysFromNow(30),
      status: 'submitted',
      createdAt: daysAgo(1),
    },
  });
  await prisma.decision.create({
    data: {
      applicationId: app4.id,
      decisionStatus: 'pending',
      score: 640,
    },
  });

  // Application 5: New, just initiated
  await prisma.application.create({
    data: {
      customerId: customers[4].id,
      jobId: jobs[4].id,
      token: `demo_token_${Date.now()}_5`,
      tokenExpiresAt: daysFromNow(30),
      status: 'initiated',
      createdAt: daysAgo(0),
    },
  });

  console.log('✓ Created 5 demo applications with various statuses');

  console.log('\n========================================');
  console.log('Demo data created successfully!');
  console.log('========================================');
  console.log('Login URL:  /client/login');
  console.log('Email:      test@demo.com');
  console.log('Password:   demo1234');
  console.log('========================================');
  console.log('\nDemo includes:');
  console.log('- 1 contractor account');
  console.log('- 5 customers');
  console.log('- 5 jobs');
  console.log('- 5 applications (funded, active loan, approved, under review, pending)');
  console.log('- 2 active loans');
  console.log('\nTo remove demo data later, run: npx tsx scripts/remove-demo-data.ts');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
