const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'urfzone4@gmail.com' },
    update: {},
    create: {
      email: 'urfzone4@gmail.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  // Create cell groups
  const cellGroups = await Promise.all([
    prisma.cellGroup.upsert({
      where: { name: 'Diaspora Cell' },
      update: {},
      create: {
        name: 'Diaspora Cell',
        description: 'Cell group for diaspora members',
      },
    }),
    prisma.cellGroup.upsert({
      where: { name: 'Main Campus Cell' },
      update: {},
      create: {
        name: 'Main Campus Cell',
        description: 'Cell group for main campus members',
      },
    }),
    prisma.cellGroup.upsert({
      where: { name: 'Volta Hall Cell' },
      update: {},
      create: {
        name: 'Volta Hall Cell',
        description: 'Cell group for Volta Hall members',
      },
    }),
    prisma.cellGroup.upsert({
      where: { name: 'Pent Cell' },
      update: {},
      create: {
        name: 'Pent Cell',
        description: 'Cell group for Pentecostal members',
      },
    }),
  ])

  console.log('Database has been seeded. 🌱')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 