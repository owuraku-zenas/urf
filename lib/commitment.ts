import { prisma } from "./prisma"

const COMMITTED_THRESHOLD = 0.7;
const AT_RISK_THRESHOLD = 0.4;

export async function calculateMemberCommitment(memberId: string, semesterId: string) {
  try {
    const [member, semester] = await Promise.all([
      prisma.member.findUnique({
        where: { id: memberId },
        select: { joinDate: true },
      }),
      prisma.semester.findUnique({
        where: { id: semesterId },
        select: { startDate: true, endDate: true },
      }),
    ]);

    if (!member) {
      console.warn(`Member ${memberId} not found when calculating commitment`);
      return;
    }

    if (!semester?.startDate || !semester?.endDate) {
      console.warn(`Semester ${semesterId} missing date range`);
      return;
    }

    // Member joined after this semester ended — no record should exist
    if (member.joinDate > semester.endDate) return;

    const existing = await prisma.semesterCommitment.findUnique({
      where: { memberId_semesterId: { memberId, semesterId } },
    });
    if (existing?.overrideReason) return;

    const joinedThisSemester =
      member.joinDate >= semester.startDate && member.joinDate <= semester.endDate;

    const totalEvents = await prisma.event.count({
      where: { semesterId, date: { gte: member.joinDate } },
    });

    if (joinedThisSemester) {
      // New members get a grace period — only graduate to COMMITTED if they hit the threshold
      if (totalEvents === 0) {
        await upsertCommitment(memberId, semesterId, 'NEW_MEMBER');
        return;
      }

      const presentCount = await prisma.attendance.count({
        where: {
          memberId,
          status: 'PRESENT',
          event: { semesterId, date: { gte: member.joinDate } },
        },
      });

      const pct = presentCount / totalEvents;
      await upsertCommitment(
        memberId, semesterId,
        pct >= COMMITTED_THRESHOLD ? 'COMMITTED' : 'NEW_MEMBER'
      );
      return;
    }

    // Member joined before this semester — regular scoring
    if (totalEvents === 0) {
      await upsertCommitment(memberId, semesterId, 'COMMITTED');
      return;
    }

    const presentCount = await prisma.attendance.count({
      where: {
        memberId,
        status: 'PRESENT',
        event: { semesterId, date: { gte: member.joinDate } },
      },
    });

    const pct = presentCount / totalEvents;
    let status: 'COMMITTED' | 'AT_RISK' | 'UNCOMMITTED' = 'UNCOMMITTED';
    if (pct >= COMMITTED_THRESHOLD) status = 'COMMITTED';
    else if (pct >= AT_RISK_THRESHOLD) status = 'AT_RISK';

    await upsertCommitment(memberId, semesterId, status);

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
