import { prisma } from "./prisma"

// A member is "COMMITTED" if they attend >= 70% of semester events.
const COMMITTED_THRESHOLD = 0.7;
// A member is "AT_RISK" if they attend >= 40% but < 70%. Below 40 is "UNCOMMITTED".
const AT_RISK_THRESHOLD = 0.4;

export async function calculateMemberCommitment(memberId: string, semesterId: string) {
  try {
    // 1. Get the total number of events in this semester
    const totalEvents = await prisma.event.count({
      where: { semesterId },
    })

    if (totalEvents === 0) {
      // No events yet in this semester, so we can't calculate a meaningful percentage.
      // Default them to UNCOMMITTED for now, but don't overwrite manual overrides.
      const existingCommitment = await prisma.semesterCommitment.findUnique({
         where: {
            memberId_semesterId: { memberId, semesterId }
         }
      });
      if (!existingCommitment?.overrideReason) {
          await upsertCommitment(memberId, semesterId, 'UNCOMMITTED');
      }
      return;
    }

    // 2. Count how many times this specific member attended an event in this semester
    // (Assuming AttendanceStatus.PRESENT is the only status tracked, or we only count PRESENT rows)
    const memberAttendances = await prisma.attendance.count({
      where: {
        memberId,
        status: 'PRESENT',
        event: {
          semesterId,
        },
      },
    })

    // 3. Calculate percentage
    const attendancePercentage = memberAttendances / totalEvents;

    // 4. Determine Status
    let newStatus: 'COMMITTED' | 'UNCOMMITTED' | 'AT_RISK' = 'UNCOMMITTED';
    
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
async function upsertCommitment(memberId: string, semesterId: string, calculatedStatus: 'COMMITTED' | 'UNCOMMITTED' | 'AT_RISK') {
    const existing = await prisma.semesterCommitment.findUnique({
        where: {
            memberId_semesterId: { memberId, semesterId }
        }
    });

    // If an Admin has manually overridden the status, do not overwrite it with the automated calculation.
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
            status: calculatedStatus,
        },
        create: {
            memberId,
            semesterId,
            status: calculatedStatus,
        }
    });
}
