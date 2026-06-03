import { prisma } from "./prisma"

// A member is "COMMITTED" if they attend >= 70% of semester events.
const COMMITTED_THRESHOLD = 0.7;
// A member is "AT_RISK" if they attend >= 40% but < 70%. Below 40 is "UNCOMMITTED".
const AT_RISK_THRESHOLD = 0.4;

export async function calculateMemberCommitment(memberId: string, semesterId: string) {
  try {
    const existing = await prisma.semesterCommitment.findUnique({
      where: { memberId_semesterId: { memberId, semesterId } }
    });
    if ((existing?.status as string) === 'LEGACY') return;

    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { joinDate: true }
    });

    if (!member) {
      console.warn(`Member ${memberId} not found when calculating commitment`);
      return;
    }

    // 1. Get the total number of events in this semester that occurred ON OR AFTER the member joined
    const totalEvents = await prisma.event.count({
      where: { 
        semesterId,
        date: { gte: member.joinDate }
      },
    })

    if (totalEvents === 0) {
      // No events yet in this semester since they joined. Don't penalize them.
      const existingCommitment = await prisma.semesterCommitment.findUnique({
         where: {
            memberId_semesterId: { memberId, semesterId }
         }
      });
      if (!existingCommitment?.overrideReason) {
          await upsertCommitment(memberId, semesterId, 'NEW_MEMBER');
      }
      return;
    }

    // 2. Count how many times this specific member attended an event in this semester
    const memberAttendances = await prisma.attendance.count({
      where: {
        memberId,
        status: 'PRESENT',
        event: {
          semesterId,
          date: { gte: member.joinDate }
        },
      },
    })

    // 3. Calculate percentage
    const attendancePercentage = memberAttendances / totalEvents;

    // 4. Determine Status
    let newStatus: 'COMMITTED' | 'UNCOMMITTED' | 'AT_RISK' | 'NEW_MEMBER' = 'UNCOMMITTED';
    
    if (attendancePercentage >= COMMITTED_THRESHOLD) {
      newStatus = 'COMMITTED';
    } else if (attendancePercentage >= AT_RISK_THRESHOLD) {
      newStatus = 'AT_RISK';
    }

    // 5. Update the Database
    await upsertCommitment(memberId, semesterId, newStatus);
    
  } catch (error) {
    console.error(`Error calculating commitment for member ${memberId} in semester ${semesterId}:`, error)
  }
}

// Helper to handle the actual database upsert, respecting manual overrides
async function upsertCommitment(memberId: string, semesterId: string, calculatedStatus: 'COMMITTED' | 'UNCOMMITTED' | 'AT_RISK' | 'NEW_MEMBER') {
    const existing = await prisma.semesterCommitment.findUnique({
        where: {
            memberId_semesterId: { memberId, semesterId }
        }
    });

    // If an Admin has manually overridden the status, do not overwrite it.
    if (existing?.overrideReason) {
        return existing;
    }

    return await prisma.semesterCommitment.upsert({
        where: {
            memberId_semesterId: {
                memberId,
                semesterId
            }
        },
        update: {
            status: calculatedStatus as any,
        },
        create: {
            memberId,
            semesterId,
            status: calculatedStatus as any,
        }
    });
}
