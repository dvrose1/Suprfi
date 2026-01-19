// ABOUTME: Migration script to convert Loan.paymentSchedule JSON to Payment records
// ABOUTME: Run with: npx ts-node scripts/migrate-payment-schedule.ts

import { PrismaClient, Decimal } from '@prisma/client'

const prisma = new PrismaClient()

interface LegacyPaymentScheduleItem {
  date?: string
  dueDate?: string
  amount?: number
  principal?: number
  interest?: number
  status?: string
  paymentNumber?: number
}

interface LegacyPaymentSchedule {
  type?: string
  name?: string
  termMonths?: number
  termWeeks?: number
  apr?: number
  monthlyPayment?: number
  installmentAmount?: number
  numberOfPayments?: number
  downPayment?: number
  schedule?: LegacyPaymentScheduleItem[]
}

async function migratePaymentSchedules() {
  console.log('Starting payment schedule migration...')
  
  // Get all loans with paymentSchedule data
  const loans = await prisma.loan.findMany({
    where: {
      paymentSchedule: { not: null },
    },
    include: {
      payments: true,
    },
  })

  console.log(`Found ${loans.length} loans with payment schedules`)

  let migrated = 0
  let skipped = 0
  let errors = 0

  for (const loan of loans) {
    try {
      // Skip if already has Payment records
      if (loan.payments.length > 0) {
        console.log(`  Loan ${loan.id}: Already has ${loan.payments.length} Payment records, skipping`)
        skipped++
        continue
      }

      const scheduleData = loan.paymentSchedule as LegacyPaymentSchedule | null
      
      if (!scheduleData) {
        console.log(`  Loan ${loan.id}: No payment schedule data, skipping`)
        skipped++
        continue
      }

      // Check if there's a schedule array or if we need to generate from terms
      let scheduleItems: LegacyPaymentScheduleItem[] = []
      
      if (scheduleData.schedule && Array.isArray(scheduleData.schedule)) {
        scheduleItems = scheduleData.schedule
      } else if (scheduleData.numberOfPayments && (scheduleData.monthlyPayment || scheduleData.installmentAmount)) {
        // Generate schedule from terms
        const paymentAmount = scheduleData.installmentAmount || scheduleData.monthlyPayment || 0
        const startDate = loan.fundingDate || loan.createdAt
        
        for (let i = 0; i < scheduleData.numberOfPayments; i++) {
          const dueDate = new Date(startDate)
          
          if (scheduleData.termWeeks) {
            // Biweekly payments
            dueDate.setDate(dueDate.getDate() + (i + 1) * 14)
          } else {
            // Monthly payments
            dueDate.setMonth(dueDate.getMonth() + i + 1)
          }
          
          scheduleItems.push({
            paymentNumber: i + 1,
            dueDate: dueDate.toISOString(),
            amount: paymentAmount,
            principal: paymentAmount * 0.85, // Estimate
            interest: paymentAmount * 0.15, // Estimate
            status: 'scheduled',
          })
        }
      }

      if (scheduleItems.length === 0) {
        console.log(`  Loan ${loan.id}: Could not extract schedule items, skipping`)
        skipped++
        continue
      }

      console.log(`  Loan ${loan.id}: Migrating ${scheduleItems.length} payments...`)

      // Create Payment records
      const payments = scheduleItems.map((item, index) => ({
        loanId: loan.id,
        paymentNumber: item.paymentNumber || index + 1,
        amount: new Decimal(item.amount || 0),
        principal: new Decimal(item.principal || (item.amount || 0) * 0.85),
        interest: new Decimal(item.interest || (item.amount || 0) * 0.15),
        dueDate: new Date(item.dueDate || item.date || new Date()),
        status: mapStatus(item.status),
      }))

      await prisma.payment.createMany({
        data: payments,
        skipDuplicates: true,
      })

      migrated++
      console.log(`    Created ${payments.length} Payment records`)

    } catch (error) {
      console.error(`  Loan ${loan.id}: Error - ${error}`)
      errors++
    }
  }

  console.log('\nMigration complete!')
  console.log(`  Migrated: ${migrated}`)
  console.log(`  Skipped: ${skipped}`)
  console.log(`  Errors: ${errors}`)
}

function mapStatus(legacyStatus?: string): string {
  if (!legacyStatus) return 'scheduled'
  
  switch (legacyStatus.toLowerCase()) {
    case 'paid':
    case 'complete':
    case 'completed':
      return 'completed'
    case 'pending':
      return 'pending'
    case 'processing':
      return 'processing'
    case 'failed':
      return 'failed'
    case 'overdue':
      return 'overdue'
    default:
      return 'scheduled'
  }
}

// Run migration
migratePaymentSchedules()
  .catch((error) => {
    console.error('Migration failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
