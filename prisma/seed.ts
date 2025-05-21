const { PrismaClient } = require('@prisma/client')
const { hash } = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
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

  // Create members
  const members = await Promise.all([
    prisma.member.upsert({
      where: { phone: '1234567890' },
      update: {},
      create: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        university: 'University of Ghana',
        program: 'Computer Science',
        startYear: '2023',
        hostel: 'Commonwealth Hall',
        roomNumber: 'A101',
        cellGroupId: cellGroups[0].id,
      },
    }),
    prisma.member.upsert({
      where: { phone: '0987654321' },
      update: {},
      create: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '0987654321',
        university: 'KNUST',
        program: 'Medicine',
        startYear: '2022',
        hostel: 'Unity Hall',
        roomNumber: 'B202',
        cellGroupId: cellGroups[1].id,
        invitedById: (await prisma.member.findFirst({ where: { phone: '1234567890' } }))?.id,
      },
    }),
  ])

  // Create events
  const events = await Promise.all([
    prisma.event.create({
      data: {
        name: 'Sunday Service',
        type: 'SUNDAY',
        date: new Date('2024-03-10T09:00:00Z'),
        description: 'Regular Sunday service',
      },
    }),
    prisma.event.create({
      data: {
        name: 'Midweek Service',
        type: 'MIDWEEK',
        date: new Date('2024-03-13T18:00:00Z'),
        description: 'Regular midweek service',
      },
    }),
    prisma.event.create({
      data: {
        name: 'Prayer Meeting',
        type: 'PRAYER',
        date: new Date('2024-03-15T17:00:00Z'),
        description: 'Monthly prayer meeting',
      },
    }),
  ])

  // Create attendance records
  await Promise.all([
    // John's attendance
    prisma.attendance.create({
      data: {
        memberId: members[0].id,
        eventId: events[0].id,
        status: 'PRESENT',
        date: events[0].date,
      },
    }),
    prisma.attendance.create({
      data: {
        memberId: members[0].id,
        eventId: events[1].id,
        status: 'ABSENT',
        date: events[1].date,
      },
    }),
    prisma.attendance.create({
      data: {
        memberId: members[0].id,
        eventId: events[2].id,
        status: 'PRESENT',
        date: events[2].date,
      },
    }),
    // Jane's attendance
    prisma.attendance.create({
      data: {
        memberId: members[1].id,
        eventId: events[0].id,
        status: 'PRESENT',
        date: events[0].date,
      },
    }),
    prisma.attendance.create({
      data: {
        memberId: members[1].id,
        eventId: events[1].id,
        status: 'PRESENT',
        date: events[1].date,
      },
    }),
    prisma.attendance.create({
      data: {
        memberId: members[1].id,
        eventId: events[2].id,
        status: 'ABSENT',
        date: events[2].date,
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