import { PrismaClient, UserRole, LoanStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Limpando dados antigos (opcional, útil para desenvolvimento)
  await prisma.payment.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.borrower.deleteMany();
  await prisma.user.deleteMany();

  // Criar Admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'gildo@gmail.com',
      password: adminPassword,
      name: 'Administrador',
      role: UserRole.ADMIN
    }
  });

  // Criar Loan Officer
  const officerPassword = await bcrypt.hash('agente123', 10);
  const loanOfficer = await prisma.user.create({
    data: {
      email: 'agente@gmail.com',
      password: officerPassword,
      name: 'João Oficial',
      role: UserRole.LOAN_OFFICER
    }
  });

  // Criar Borrower + User
  const borrowerPassword = await bcrypt.hash('gestor123', 10);
  const borrowerUser = await prisma.user.create({
    data: {
      email: 'gestor@gmail.com',
      password: borrowerPassword,
      name: 'Maria Cliente',
      role: UserRole.MANAGER,
      borrower: {
        create: {
          bi: '1234567890',
          phone: '+258840000000',
          address: 'Rua das Flores, 123',
          city: 'Maputo',
          state: 'MP',
          zipCode: '1100',
          birthDate: new Date('1990-05-10'),
          income: 15000.00,
          creditScore: 750
        }
      }
    },
    include: { borrower: true }
  });

  // Criar Empréstimo
  const loan = await prisma.loan.create({
    data: {
      borrowerId: borrowerUser.borrower!.id,
      loanOfficerId: loanOfficer.id,
      amount: 50000.00,
      interestRate: 0.12,
      termMonths: 12,
      monthlyPayment: 4700.00,
      totalAmount: 56400.00,
      status: LoanStatus.ACTIVE,
      approvedAt: new Date(),
      disbursedAt: new Date(),
      dueDate: new Date('2026-08-01')
    }
  });

  // Criar Pagamentos
  await prisma.payment.createMany({
    data: [
      {
        loanId: loan.id,
        amount: 4700.00,
        principalPaid: 4200.00,
        interestPaid: 500.00,
        status: PaymentStatus.PAID,
        dueDate: new Date('2025-09-01'),
        paidAt: new Date()
      },
      {
        loanId: loan.id,
        amount: 4700.00,
        principalPaid: 4200.00,
        interestPaid: 500.00,
        status: PaymentStatus.PENDING,
        dueDate: new Date('2025-10-01')
      }
    ]
  });

  console.log('✅ Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });