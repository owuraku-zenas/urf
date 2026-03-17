import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting historical data migration...')

  try {
    // 1. Check if an "Initial" semester already exists
    let initialSemester = await prisma.semester.findFirst({
      where: { name: 'Legacy Data Archive' },
    })

    // 2. If not, create a fallback academic semester spanning from the past to right before the system adoption
    if (!initialSemester) {
      console.log('Creating Initial Legacy Semester...')
      initialSemester = await prisma.semester.create({
        data: {
          name: 'Legacy Data Archive',
          academicYear: 'Pre-System',
          startDate: new Date('2000-01-01'), // Arbitrary past date
          endDate: new Date('2025-12-31'),   // Arbitrary recent date before tracking started
          status: 'CLOSED', // Ensure it doesn't show up as the active semester
        },
      })
      console.log(`Created Initial Semester: ${initialSemester.id}`)
    } else {
      console.log(`Initial Semester already exists: ${initialSemester.id}`)
    }

    // 3. Find all Events that currently have no associated Semester
    const unassociatedEvents = await prisma.event.count({
      where: { semesterId: null },
    })

    console.log(`Found ${unassociatedEvents} events with no semester ID.`)

    if (unassociatedEvents > 0) {
      // 4. Update all such Events to belong to the "Initial" semester
      const updateResult = await prisma.event.updateMany({
        where: { semesterId: null },
        data: { semesterId: initialSemester.id },
      })

      console.log(`Successfully migrated ${updateResult.count} events to the Initial Semester.`)
    } else {
      console.log('No historical events need migration. Everything looks good.')
    }

    console.log('Migration completed successfully!')
  } catch (error) {
    console.error('Migration failed with error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
