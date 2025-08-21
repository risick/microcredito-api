import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function seedUsers() {
  console.log("🌱 Seeding users...")

  // Hash da senha padrão
  const defaultPassword = await bcrypt.hash("123456", 12)

  // Criar usuário admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@microcredito.com" },
    update: {},
    create: {
      email: "admin@microcredito.com",
      password: defaultPassword,
      name: "Administrador",
      role: "ADMIN",
    },
  })

  // Criar usuário loan officer
  const loanOfficer = await prisma.user.upsert({
    where: { email: "officer@microcredito.com" },
    update: {},
    create: {
      email: "officer@microcredito.com",
      password: defaultPassword,
      name: "Analista de Crédito",
      role: "LOAN_OFFICER",
    },
  })

  // Criar usuário comum
  const user = await prisma.user.upsert({
    where: { email: "user@microcredito.com" },
    update: {},
    create: {
      email: "user@microcredito.com",
      password: defaultPassword,
      name: "Usuário Teste",
      role: "USER",
    },
  })

  console.log("✅ Users seeded successfully!")
  console.log("📧 Admin: admin@microcredito.com")
  console.log("📧 Loan Officer: officer@microcredito.com")
  console.log("📧 User: user@microcredito.com")
  console.log("🔑 Default password: 123456")

  return { admin, loanOfficer, user }
}

if (require.main === module) {
  seedUsers()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

export { seedUsers }
