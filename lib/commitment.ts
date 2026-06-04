import { prisma } from "./prisma"

const COMMITTED_THRESHOLD = 0.7;
const AT_RISK_THRESHOLD = 0.4;

export async function calculateMemberCommitment(memberId: string, semesterId: string) {
  try {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { joinDate: true }
    });

    if (!member) {
      console.warn(`Member ${memberId} not found when calculating commitment`);
      return;
    }

    // 1. Count events in this semester that occurred on or after the member joined
    const totalEvents = await prisma.event.count({
      where: {
        semesterId,
        date: { gte: member.joinDate }
      },
    });

    if (totalEvents === 0) {
      // No events recorded yet for this member in this semester.
      // Determine whether this is a historical member (joined before any recorded semester).
      const allRegularSemesters = await prisma.semester.findMany({
        where: { isArchive: false, isOldMemberBucket: false },
        select: { startDate: true, endDate: true },
      });
      const regularSemesters = allRegularSemesters.filter(
        (s): s is typeof s & { startDate: Date; endDate: Date } => s.startDate !== null && s.endDate !== null
      );
      const joinedInRecordedSemester = regularSemesters.some(
        (s) => member.joinDate >= s.startDate && member.joinDate <= s.endDate
      );

      const existing = await prisma.semesterCommitment.findUnique({
        where: { memberId_semesterId: { memberId, semesterId } },
      });

      if (existing?.overrideReason) return;

      if (!joinedInRecordedSemester) {
        // Historical member with no events: start at COMMITTED and don't downgrade them
        // until they actually have attendance data to measure.
        const currentStatus = existing?.status as string | undefined;
        if (!currentStatus || currentStatus === 'NEW_MEMBER') {
          await upsertCommitment(memberId, semesterId, 'COMMITTED');
        }
        // If already COMMITTED/AT_RISK/UNCOMMITTED, leave it — attendance data drove that.
      } else {
        // Regular member with no events yet: grace period.
        await upsertCommitment(memberId, semesterId, 'NEW_MEMBER');
      }
      return;
    }

    // 2. Count their PRESENT records for events in this semester after they joined
    const memberAttendances = await prisma.attendance.count({
      where: {
        memberId,
        status: 'PRESENT',
        event: {
          semesterId,
          date: { gte: member.joinDate }
        },
      },
    });

    // 3. Calculate attendance percentage and determine status
    const pct = memberAttendances / totalEvents;

    let newStatus: 'COMMITTED' | 'AT_RISK' | 'UNCOMMITTED' = 'UNCOMMITTED';
    if (pct >= COMMITTED_THRESHOLD) newStatus = 'COMMITTED';
    else if (pct >= AT_RISK_THRESHOLD) newStatus = 'AT_RISK';

    await upsertCommitment(memberId, semesterId, newStatus);

  } catch (error) {
    console.error(`Error calculating commitment for member ${memberId} in semester ${semesterId}:`, error);
  }
}

async function upsertCommitment(
  memberId: string,
  semesterId: string,
  calculatedStatus: 'COMMITTED' | 'AT_RISK' | 'UNCOMMITTED' | 'NEW_MEMBER'
) {
  const existing = await prisma.semesterCommitment.findUnique({
    where: { memberId_semesterId: { memberId, semesterId } }
  });

  if (existing?.overrideReason) return existing;

  return prisma.semesterCommitment.upsert({
    where: { memberId_semesterId: { memberId, semesterId } },
    update: { status: calculatedStatus as any },
    create: { memberId, semesterId, status: calculatedStatus as any },
  });
}
