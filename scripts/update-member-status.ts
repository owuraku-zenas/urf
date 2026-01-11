const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function updateMemberStatus() {
  try {
    console.log('Starting to update member active/inactive status...')
    
    // Fetch all members
    const members = await prisma.member.findMany({
      select: {
        id: true,
        name: true,
      },
    })

    console.log(`Found ${members.length} members to process`)

    let activeCount = 0
    let inactiveCount = 0
    let updatedCount = 0

    // Process each member
    for (const member of members) {
      // Count PRESENT attendances for this member
      const attendanceCount = await prisma.attendance.count({
        where: {
          memberId: member.id,
          status: 'PRESENT',
        },
      })

      // Determine if member should be active (5 or more PRESENT attendances)
      const shouldBeActive = attendanceCount >= 5

      // Get current status
      const currentMember = await prisma.member.findUnique({
        where: { id: member.id },
        select: { isActive: true },
      })

      // Only update if status needs to change
      if (currentMember?.isActive !== shouldBeActive) {
        await prisma.member.update({
          where: { id: member.id },
          data: { isActive: shouldBeActive },
        })

        updatedCount++
        console.log(
          `Updated ${member.name}: ${attendanceCount} attendances -> ${shouldBeActive ? 'Active' : 'Inactive'}`
        )
      } else {
        console.log(
          `Skipped ${member.name}: ${attendanceCount} attendances -> ${shouldBeActive ? 'Active' : 'Inactive'} (no change needed)`
        )
      }

      if (shouldBeActive) {
        activeCount++
      } else {
        inactiveCount++
      }
    }

    console.log('\n=== Summary ===')
    console.log(`Total members processed: ${members.length}`)
    console.log(`Members updated: ${updatedCount}`)
    console.log(`Active members: ${activeCount}`)
    console.log(`Inactive members: ${inactiveCount}`)
    console.log('\nUpdate completed successfully!')
  } catch (error) {
    console.error('Error updating member status:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
updateMemberStatus()
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })
