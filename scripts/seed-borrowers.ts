import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function seedBorrowers() {
  console.log("🌱 Seeding borrowers...")

  // Buscar usuários existentes
  const users = await prisma.user.findMany({
    where: { role: "USER" },
    take: 5,
  })

  if (users.length === 0) {
    console.log("⚠️ No users found. Please seed users first.")
    return
  }

  const borrowersData = [
    {
      userId: users[0]?.id,
      bi: "12345678901",
      phone: "11987654321",
      address: "Rua das Flores, 123, Apto 45",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234567",
      birthDate: new Date("1990-05-15"),
      income: 5000,
    },
    {
      userId: users[1]?.id,
      bi: "98765432109",
      phone: "21987654321",
      address: "Av. Copacabana, 456",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "22070001",
      birthDate: new Date("1985-08-22"),
      income: 7500,
    },
    {
      userId: users[2]?.id,
      bi: "11122233344",
      phone: "31987654321",
      address: "Rua da Liberdade, 789",
      city: "Belo Horizonte",
      state: "MG",
      zipCode: "30112000",
      birthDate: new Date("1992-12-03"),
      income: 3500,
    },
  ]

  for (const borrowerData of borrowersData) {
    if (borrowerData.userId) {
      try {
        await prisma.borrower.upsert({
          where: { userId: borrowerData.userId },
          update: {},
          create: borrowerData,
        })
        console.log(`✅ Borrower created for user ${borrowerData.userId}`)
      } catch (error) {
        console.log(`⚠️ Borrower already exists for user ${borrowerData.userId}`)
      }
    }
  }

  console.log("✅ Borrowers seeded successfully!")
}

if (require.main === module) {
  seedBorrowers()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}

export { seedBorrowers }
