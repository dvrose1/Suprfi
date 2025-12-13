// Script to remove all demo data
// Run: npx tsx scripts/remove-demo-data.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Removing demo data...\n');

  // Find demo contractor
  const contractor = await prisma.contractor.findUnique({
    where: { email: 'test@demo.com' },
  });

  if (!contractor) {
    console.log('No demo data found (test@demo.com contractor does not exist)');
    return;
  }

  // Get all contractor jobs
  const contractorJobs = await prisma.contractorJob.findMany({
    where: { contractorId: contractor.id },
    include: { job: true },
  });

  const jobIds = contractorJobs.map((cj) => cj.jobId);

  // Get applications linked to these jobs
  const applications = await prisma.application.findMany({
    where: { jobId: { in: jobIds } },
  });
  const appIds = applications.map((a) => a.id);

  // Get decisions
  const decisions = await prisma.decision.findMany({
    where: { applicationId: { in: appIds } },
  });
  const decisionIds = decisions.map((d) => d.id);

  // Delete in order (respecting foreign keys)
  const deletedOffers = await prisma.offer.deleteMany({
    where: { decisionId: { in: decisionIds } },
  });
  console.log('✓ Deleted', deletedOffers.count, 'offers');

  const deletedLoans = await prisma.loan.deleteMany({
    where: { applicationId: { in: appIds } },
  });
  console.log('✓ Deleted', deletedLoans.count, 'loans');

  const deletedDecisions = await prisma.decision.deleteMany({
    where: { applicationId: { in: appIds } },
  });
  console.log('✓ Deleted', deletedDecisions.count, 'decisions');

  const deletedApps = await prisma.application.deleteMany({
    where: { id: { in: appIds } },
  });
  console.log('✓ Deleted', deletedApps.count, 'applications');

  const deletedContractorJobs = await prisma.contractorJob.deleteMany({
    where: { contractorId: contractor.id },
  });
  console.log('✓ Deleted', deletedContractorJobs.count, 'contractor-job links');

  // Get customer IDs before deleting jobs
  const customerIds = contractorJobs.map((cj) => cj.job.customerId);

  const deletedJobs = await prisma.job.deleteMany({
    where: { id: { in: jobIds } },
  });
  console.log('✓ Deleted', deletedJobs.count, 'jobs');

  // Delete demo customers (emails ending in @demo.test)
  const deletedCustomers = await prisma.customer.deleteMany({
    where: { id: { in: customerIds } },
  });
  console.log('✓ Deleted', deletedCustomers.count, 'customers');

  // Delete contractor sessions
  const contractorUsers = await prisma.contractorUser.findMany({
    where: { contractorId: contractor.id },
  });
  const userIds = contractorUsers.map((u) => u.id);

  const deletedSessions = await prisma.contractorSession.deleteMany({
    where: { userId: { in: userIds } },
  });
  console.log('✓ Deleted', deletedSessions.count, 'sessions');

  const deletedAuditLogs = await prisma.contractorAuditLog.deleteMany({
    where: { userId: { in: userIds } },
  });
  console.log('✓ Deleted', deletedAuditLogs.count, 'audit logs');

  // Delete contractor users
  const deletedUsers = await prisma.contractorUser.deleteMany({
    where: { contractorId: contractor.id },
  });
  console.log('✓ Deleted', deletedUsers.count, 'contractor users');

  // Delete contractor
  await prisma.contractor.delete({
    where: { id: contractor.id },
  });
  console.log('✓ Deleted contractor');

  console.log('\n========================================');
  console.log('All demo data removed successfully!');
  console.log('========================================');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
