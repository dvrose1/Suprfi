// ABOUTME: Seeds realistic demo data for the past 12 months
// ABOUTME: Run with: node prisma/seed-demo-data.js

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Demo contractor and user will be looked up dynamically

// First names and last names for realistic data
const FIRST_NAMES = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Lisa', 'Daniel', 'Nancy',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores'
];

const SERVICE_TYPES = ['hvac', 'plumbing', 'electrical', 'roofing', 'pest'];
const SEND_METHODS = ['sms', 'email', 'qr'];
const TEXAS_CITIES = [
  { city: 'Austin', zip: '78701' },
  { city: 'Dallas', zip: '75201' },
  { city: 'Houston', zip: '77001' },
  { city: 'San Antonio', zip: '78201' },
  { city: 'Fort Worth', zip: '76101' },
  { city: 'Plano', zip: '75023' },
  { city: 'Arlington', zip: '76010' },
  { city: 'Frisco', zip: '75034' },
];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePhone() {
  return `555${randomBetween(100, 999)}${randomBetween(1000, 9999)}`;
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Generate monthly distribution with growth trend
// More applications in recent months, realistic seasonal pattern
function getMonthlyApplicationCounts() {
  return [
    { monthsAgo: 11, count: randomBetween(8, 12) },   // 12 months ago - starting
    { monthsAgo: 10, count: randomBetween(10, 15) },  // 11 months ago
    { monthsAgo: 9, count: randomBetween(12, 18) },   // 10 months ago
    { monthsAgo: 8, count: randomBetween(15, 20) },   // 9 months ago
    { monthsAgo: 7, count: randomBetween(18, 25) },   // 8 months ago - summer peak
    { monthsAgo: 6, count: randomBetween(20, 28) },   // 7 months ago - summer peak
    { monthsAgo: 5, count: randomBetween(22, 30) },   // 6 months ago
    { monthsAgo: 4, count: randomBetween(18, 25) },   // 5 months ago
    { monthsAgo: 3, count: randomBetween(20, 28) },   // 4 months ago
    { monthsAgo: 2, count: randomBetween(22, 30) },   // 3 months ago
    { monthsAgo: 1, count: randomBetween(25, 35) },   // 2 months ago
    { monthsAgo: 0, count: randomBetween(30, 40) },   // Last month - growth!
  ];
}

async function createApplication(contractorId, userId, createdAt) {
  const firstName = randomElement(FIRST_NAMES);
  const lastName = randomElement(LAST_NAMES);
  const location = randomElement(TEXAS_CITIES);
  const serviceType = randomElement(SERVICE_TYPES);
  const sendMethod = randomElement(SEND_METHODS);
  
  // Realistic loan amounts based on service type
  const amountRanges = {
    hvac: { min: 3000, max: 15000 },
    plumbing: { min: 1500, max: 8000 },
    electrical: { min: 2000, max: 10000 },
    roofing: { min: 5000, max: 25000 },
    pest: { min: 500, max: 3000 },
  };
  const range = amountRanges[serviceType];
  const estimateAmount = randomBetween(range.min, range.max);
  
  // Determine outcome - 75% approval rate, with some initiated/declined
  const random = Math.random();
  let status, decisionStatus;
  
  if (random < 0.05) {
    // 5% stay initiated (abandoned)
    status = 'initiated';
    decisionStatus = null;
  } else if (random < 0.15) {
    // 10% declined
    status = 'declined';
    decisionStatus = 'declined';
  } else if (random < 0.25) {
    // 10% approved but not funded yet
    status = 'approved';
    decisionStatus = 'approved';
  } else {
    // 75% funded
    status = 'funded';
    decisionStatus = 'approved';
  }
  
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomBetween(1, 999)}@example.com`;
  
  // Create customer
  const customer = await prisma.customer.create({
    data: {
      firstName,
      lastName,
      email,
      phone: generatePhone(),
      addressLine1: `${randomBetween(100, 9999)} ${randomElement(['Oak', 'Main', 'Elm', 'Cedar', 'Pine', 'Maple'])} ${randomElement(['St', 'Ave', 'Blvd', 'Dr', 'Ln'])}`,
      city: location.city,
      state: 'TX',
      postalCode: location.zip,
      financingOptIn: true,
      financingOptInAt: createdAt,
      createdAt,
      updatedAt: createdAt,
    },
  });
  
  // Create job
  const job = await prisma.job.create({
    data: {
      customerId: customer.id,
      estimateAmount,
      serviceType,
      status: status === 'funded' ? 'completed' : 'pending',
      createdAt,
      updatedAt: createdAt,
    },
  });
  
  // Link job to contractor
  await prisma.contractorJob.create({
    data: {
      contractorId,
      jobId: job.id,
      initiatedBy: userId,
      initiatedAt: createdAt,
      sendMethod,
    },
  });
  
  // Token expires 24 hours after creation
  const tokenExpiresAt = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
  
  // Create application
  const submittedAt = status !== 'initiated' 
    ? new Date(createdAt.getTime() + randomBetween(30, 180) * 60 * 1000) // 30 min to 3 hours later
    : createdAt;
  
  const application = await prisma.application.create({
    data: {
      jobId: job.id,
      customerId: customer.id,
      token: generateToken(),
      tokenExpiresAt,
      status,
      plaidData: status !== 'initiated' ? { connected: true, accountType: 'checking' } : null,
      personaData: status !== 'initiated' ? { verified: true, verificationId: `inq_${generateToken().slice(0, 20)}` } : null,
      creditData: status !== 'initiated' ? { score: randomBetween(650, 800), bureau: 'experian' } : null,
      createdAt,
      updatedAt: submittedAt,
    },
  });
  
  // Create decision if submitted
  if (decisionStatus) {
    const score = decisionStatus === 'approved' ? randomBetween(680, 800) : randomBetween(580, 660);
    const decidedAt = new Date(submittedAt.getTime() + randomBetween(1, 5) * 60 * 1000); // 1-5 minutes after submit
    
    const decision = await prisma.decision.create({
      data: {
        applicationId: application.id,
        score,
        decisionStatus,
        decisionReason: decisionStatus === 'declined' ? 'Credit score below minimum threshold' : null,
        decidedAt,
        decidedBy: 'system',
      },
    });
    
    // Create offers for approved
    if (decisionStatus === 'approved') {
      const apr = score >= 750 ? 0 : score >= 700 ? 9.99 : 14.99;
      
      // BNPL offer (0% APR)
      const offer1 = await prisma.offer.create({
        data: {
          decisionId: decision.id,
          termMonths: 2,
          apr: 0,
          monthlyPayment: estimateAmount / 4,
          downPayment: estimateAmount * 0.25,
          totalAmount: estimateAmount,
          selected: status === 'funded',
          selectedAt: status === 'funded' ? new Date(decidedAt.getTime() + randomBetween(5, 30) * 60 * 1000) : null,
        },
      });
      
      // 6 month offer
      await prisma.offer.create({
        data: {
          decisionId: decision.id,
          termMonths: 6,
          apr,
          monthlyPayment: Math.round((estimateAmount * (1 + apr / 100 * 0.5)) / 6 * 100) / 100,
          downPayment: 0,
          totalAmount: Math.round(estimateAmount * (1 + apr / 100 * 0.5) * 100) / 100,
          selected: false,
        },
      });
      
      // Create loan if funded
      if (status === 'funded') {
        const fundingDate = new Date(offer1.selectedAt.getTime() + randomBetween(1, 3) * 24 * 60 * 60 * 1000); // 1-3 days later
        
        await prisma.loan.create({
          data: {
            applicationId: application.id,
            fundedAmount: estimateAmount,
            fundingDate,
            status: 'funded',
            lenderName: 'SuprFi',
            createdAt: fundingDate,
            updatedAt: fundingDate,
          },
        });
      }
    }
  }
  
  return { status, estimateAmount };
}

async function main() {
  console.log('🌱 Seeding demo data for the past 12 months...\n');
  
  // Find demo contractor dynamically (created by seed-demo.js)
  const contractor = await prisma.contractor.findFirst({
    where: { businessName: 'Demo HVAC Services' },
  });
  
  if (!contractor) {
    console.error('❌ Demo contractor not found! Run seed-demo.js first.');
    return;
  }
  
  // Find demo user dynamically
  const demoUser = await prisma.contractorUser.findFirst({
    where: { email: 'demo@contractor.com' },
  });
  
  if (!demoUser) {
    console.error('❌ Demo user not found! Run seed-demo.js first.');
    return;
  }
  
  const DEMO_CONTRACTOR_ID = contractor.id;
  const DEMO_USER_ID = demoUser.id;
  
  console.log(`📊 Creating data for: ${contractor.businessName}\n`);
  console.log(`   Contractor ID: ${DEMO_CONTRACTOR_ID}`);
  console.log(`   User ID: ${DEMO_USER_ID}\n`);
  
  const monthlyDistribution = getMonthlyApplicationCounts();
  let totalCreated = 0;
  let totalFunded = 0;
  let totalFundedAmount = 0;
  
  for (const { monthsAgo, count } of monthlyDistribution) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0);
    const monthName = monthStart.toLocaleString('default', { month: 'short', year: 'numeric' });
    
    console.log(`📅 ${monthName}: Creating ${count} applications...`);
    
    let monthFunded = 0;
    let monthFundedAmount = 0;
    
    for (let i = 0; i < count; i++) {
      // Random date within the month
      const dayOfMonth = randomBetween(1, monthEnd.getDate());
      const hour = randomBetween(8, 18); // Business hours
      const createdAt = new Date(monthStart.getFullYear(), monthStart.getMonth(), dayOfMonth, hour, randomBetween(0, 59));
      
      const result = await createApplication(DEMO_CONTRACTOR_ID, DEMO_USER_ID, createdAt);
      
      if (result.status === 'funded') {
        monthFunded++;
        monthFundedAmount += result.estimateAmount;
        totalFunded++;
        totalFundedAmount += result.estimateAmount;
      }
      totalCreated++;
    }
    
    console.log(`   ✅ ${count} created, ${monthFunded} funded ($${monthFundedAmount.toLocaleString()})`);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎉 DEMO DATA SEEDED SUCCESSFULLY');
  console.log('='.repeat(60));
  console.log(`\nTotal Applications: ${totalCreated}`);
  console.log(`Total Funded: ${totalFunded}`);
  console.log(`Total Funded Amount: $${totalFundedAmount.toLocaleString()}`);
  console.log(`Approval Rate: ${Math.round(totalFunded / totalCreated * 100)}%`);
  console.log('\n' + '='.repeat(60));
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
