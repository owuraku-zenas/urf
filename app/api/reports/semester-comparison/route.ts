import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const semesters = await prisma.semester.findMany({
      orderBy: { startDate: 'asc' }
    });

    const data = await Promise.all(semesters.map(async (sem) => {
      const [membersJoined, commitments, events] = await Promise.all([
        sem.startDate && sem.endDate
          ? prisma.member.count({ where: { joinDate: { gte: sem.startDate, lte: sem.endDate } } })
          : Promise.resolve(0),
        prisma.semesterCommitment.groupBy({
          by: ['status'],
          where: { semesterId: sem.id },
          _count: { status: true }
        }),
        prisma.event.findMany({
          where: { semesterId: sem.id },
          include: { _count: { select: { attendance: true } } }
        })
      ]);

      const avgAttendance = events.length > 0
        ? Math.round(events.reduce((acc, ev) => acc + ev._count.attendance, 0) / events.length)
        : 0;

      const commMap = commitments.reduce((acc, c) => ({...acc, [c.status]: c._count.status}), {} as Record<string, number>);

      return {
        semesterId: sem.id,
        name: sem.name,
        membersJoined,
        avgAttendance,
        committed: commMap['COMMITTED'] || 0,
        uncommitted: commMap['UNCOMMITTED'] || 0,
        atRisk: commMap['AT_RISK'] || 0,
      }
    }));

    return NextResponse.json(data);
  } catch (err) {
    console.error("Semester comparison API Error:", err)
    return NextResponse.json({ error: "Failed to fetch semester comparison data" }, { status: 500 });
  }
}
