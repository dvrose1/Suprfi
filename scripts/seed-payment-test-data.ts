// ABOUTME: Seed script to create test data for payment features
// ABOUTME: Run with: npx ts-node scripts/seed-payment-test-data.ts

/// <reference types="node" />
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedPaymentTestData() {
  console.log('Seeding payment test data...')

  // Find existing loans that need payments
  const loans = await prisma.loan.findMany({
    where: {
      status: { in: ['funded', 'repaying'] },
    },
    include: {
      payments: true,
      application: {
        include: {
          decision: {
            include: {
              offers: true,
            },
          },
        },
      },
    },
  })

  console.log(`Found ${loans.length} funded/repaying loans`)

  for (const loan of loans) {
    // Skip if already has payments
    if (loan.payments.length > 0) {
      console.log(`Loan ${loan.id} already has ${loan.payments.length} payments, skipping...`)
      continue
    }

    // Get offer terms
    const offer = loan.application.decision?.offers.find(o => o.selected)
    if (!offer) {
      console.log(`Loan ${loan.id} has no selected offer, skipping...`)
      continue
    }

    const termMonths = offer.termMonths
    const monthlyPayment = Number(offer.monthlyPayment)
    const totalAmount = Number(offer.totalAmount)
    const principal = Number(loan.fundedAmount)
    const totalInterest = totalAmount - principal
    const interestPerPayment = totalInterest / termMonths
    const principalPerPayment = principal / termMonths

    console.log(`Creating ${termMonths} payments for loan ${loan.id}...`)

    // Create payment schedule
    const fundingDate = loan.fundingDate || new Date()
    
    for (let i = 1; i <= termMonths; i++) {
      const dueDate = new Date(fundingDate)
      dueDate.setMonth(dueDate.getMonth() + i)

      // Determine status based on due date
      const now = new Date()
      let status = 'scheduled'
      
      if (dueDate < now) {
        // Past due - randomly make some completed, some overdue
        if (i <= 3) {
          status = 'completed'
        } else {
          status = 'overdue'
        }
      }

      await prisma.payment.create({
        data: {
          loanId: loan.id,
          paymentNumber: i,
          amount: monthlyPayment,
          principal: principalPerPayment,
          interest: interestPerPayment,
          dueDate,
          status,
          completedAt: status === 'completed' ? dueDate : null,
        },
      })
    }

    // Update loan status based on payments
    const overdueCount = termMonths > 3 ? termMonths - 3 : 0
    if (overdueCount > 0) {
      const daysOverdue = overdueCount * 30
      await prisma.loan.update({
        where: { id: loan.id },
        data: {
          status: daysOverdue >= 60 ? 'defaulted' : 'repaying',
          daysOverdue,
          defaultedAt: daysOverdue >= 60 ? new Date() : null,
        },
      })
      console.log(`  Updated loan ${loan.id}: ${daysOverdue} days overdue`)
    }
  }

  // Create some additional test scenarios if we don't have enough loans
  const loanCount = await prisma.loan.count()
  if (loanCount < 3) {
    console.log('\nCreating additional test loans with various statuses...')
    
    // Find a customer to use
    const customer = await prisma.customer.findFirst()
    if (!customer) {
      console.log('No customers found, cannot create test loans')
      return
    }

    // Find or create a job
    let job = await prisma.job.findFirst({ where: { customerId: customer.id } })
    if (!job) {
      job = await prisma.job.create({
        data: {
          customerId: customer.id,
          crmJobId: `TEST-JOB-${Date.now()}`,
          estimateAmount: 5000,
          status: 'completed',
          serviceType: 'HVAC Repair',
        },
      })
    }

    // Create a test application and loan
    const application = await prisma.application.create({
      data: {
        jobId: job.id,
        customerId: customer.id,
        token: `test-token-${Date.now()}`,
        tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: 'funded',
      },
    })

    const decision = await prisma.decision.create({
      data: {
        applicationId: application.id,
        score: 720,
        decisionStatus: 'approved',
        decisionReason: 'Auto-approved',
      },
    })

    await prisma.offer.create({
      data: {
        decisionId: decision.id,
        termMonths: 24,
        apr: 9.99,
        monthlyPayment: 229.52,
        downPayment: 0,
        originationFee: 0,
        totalAmount: 5508.48,
        selected: true,
        selectedAt: new Date(),
      },
    })

    const testLoan = await prisma.loan.create({
      data: {
        applicationId: application.id,
        lenderName: 'SuprFi Direct',
        fundedAmount: 5000,
        fundingDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
        status: 'defaulted',
        daysOverdue: 90,
        defaultedAt: new Date(),
      },
    })

    // Create payments for this loan - some completed, some overdue
    for (let i = 1; i <= 24; i++) {
      const dueDate = new Date(testLoan.fundingDate!)
      dueDate.setMonth(dueDate.getMonth() + i)

      let status = 'scheduled'
      if (i === 1) status = 'completed'
      else if (i <= 4) status = 'overdue'

      await prisma.payment.create({
        data: {
          loanId: testLoan.id,
          paymentNumber: i,
          amount: 229.52,
          principal: 208.33,
          interest: 21.19,
          dueDate,
          status,
          completedAt: status === 'completed' ? dueDate : null,
        },
      })
    }

    console.log(`Created test loan ${testLoan.id} with 90 days overdue`)
  }

  // Summary
  const summary = await prisma.loan.groupBy({
    by: ['status'],
    _count: true,
  })
  console.log('\nLoan status summary:')
  summary.forEach(s => console.log(`  ${s.status}: ${s._count}`))

  const paymentSummary = await prisma.payment.groupBy({
    by: ['status'],
    _count: true,
  })
  console.log('\nPayment status summary:')
  paymentSummary.forEach(s => console.log(`  ${s.status}: ${s._count}`))

  const overdueLoans = await prisma.loan.findMany({
    where: { daysOverdue: { gt: 0 } },
    select: { id: true, daysOverdue: true, status: true },
  })
  console.log('\nOverdue loans:')
  overdueLoans.forEach(l => console.log(`  ${l.id}: ${l.daysOverdue} days (${l.status})`))
}

seedPaymentTestData()
  .then(() => {
    console.log('\nDone!')
    process.exit(0)
  })
  .catch((err) => {
    console.error('Error:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
