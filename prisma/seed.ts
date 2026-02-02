
import * as PrismaModule from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaModule.PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  // Clean DB
  await prisma.auditLog.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.custody.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  // --- Company A Setup ---
  const companyA = await prisma.company.create({
    data: { name: 'Tech Solutions A' }
  });

  const ownerA = await prisma.user.create({
    data: { email: 'owner@a.com', password, name: 'Ahmed Owner', role: 'OWNER', companyId: companyA.id }
  });

  const accountantA = await prisma.user.create({
    data: { email: 'sarah@a.com', password, name: 'Sarah Accountant', role: 'ACCOUNTANT', companyId: companyA.id }
  });

  const empA = await prisma.user.create({
    data: { email: 'john@a.com', password, name: 'John Doe', role: 'EMPLOYEE', companyId: companyA.id, branchId: 'br-1' }
  });

  await prisma.custody.create({
    data: { userId: empA.id, companyId: companyA.id, currentBalance: 5000 }
  });

  await prisma.expense.create({
    data: {
      amount: 250,
      description: 'Office Maintenance',
      status: 'APPROVED',
      companyId: companyA.id,
      employeeId: empA.id,
      reviewedBy: accountantA.id,
      reviewedAt: new Date()
    }
  });

  // --- Company B Setup (Isolation Test) ---
  const companyB = await prisma.company.create({
    data: { name: 'Retail Corp B' }
  });

  const empB = await prisma.user.create({
    data: { email: 'emp@b.com', password, name: 'Employee B', role: 'EMPLOYEE', companyId: companyB.id }
  });

  await prisma.custody.create({
    data: { userId: empB.id, companyId: companyB.id, currentBalance: 1200 }
  });

  await prisma.expense.create({
    data: {
      amount: 99.99,
      description: 'Secret Expense Company B',
      status: 'PENDING',
      companyId: companyB.id,
      employeeId: empB.id
    }
  });

  console.log('✅ Seed complete. Tenants isolated.');
  console.log('Company A Users: owner@a.com, sarah@a.com, john@a.com');
  console.log('Company B Users: emp@b.com');
  console.log('Password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
