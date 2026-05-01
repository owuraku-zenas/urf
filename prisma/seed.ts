const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Clearing database... 🧹')
  // Delete in order to respect foreign key constraints
  await prisma.smsLog.deleteMany({})
  await prisma.attendance.deleteMany({})
  await prisma.semesterCommitment.deleteMany({})
  await prisma.event.deleteMany({})
  await prisma.member.deleteMany({})
  await prisma.smsTemplate.deleteMany({})
  await prisma.cellGroup.deleteMany({})
  await prisma.semester.deleteMany({})
  await prisma.user.deleteMany({})

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
    prisma.cellGroup.upsert({
      where: { name: 'UPSA Cell' },
      update: {},
      create: {
        name: 'UPSA Cell',
        description: 'Cell group for UPSA members',
      },
    }),
  ])

  // Create default SMS Templates
  await prisma.smsTemplate.upsert({
    where: { type: 'BIRTHDAY' },
    update: {},
    create: {
      name: 'Birthday Greeting',
      content: 'Happy Birthday, {{name}}! May God bless your new age. Have a wonderful day! - From URF Leadership.',
      type: 'BIRTHDAY',
      isSystem: true, // Mark as system-critical
    },
  })

  // Create Initial Semester for historical data
  await prisma.semester.upsert({
    where: { name: 'Initial Semester' },
    update: {},
    create: {
      name: 'Initial Semester',
      academicYear: 'Historical',
      startDate: new Date('2000-01-01'),
      endDate: new Date('2024-07-31'),
      status: 'CLOSED',
    },
  })

  console.log('Database has been seeded. 🌱')
  console.log('SMS templates and default semester seeded. ✉️')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
