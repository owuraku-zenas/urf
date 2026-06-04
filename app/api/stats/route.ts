import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawSemesterId = searchParams.get("semesterId")
    const semesterId = rawSemesterId === 'all' ? null : rawSemesterId;

    const eventWhere = semesterId ? { semesterId } : undefined;
    const attendanceWhere = semesterId ? { event: { semesterId } } : undefined;

    let activeSemesterName = null;
    if (semesterId) {
      const activeSemester = await prisma.semester.findUnique({ where: { id: semesterId } });
      activeSemesterName = activeSemester?.name || null;
    } else if (rawSemesterId === 'all') {
      activeSemesterName = "All Semesters";
    }

    const [
      memberCount,
      eventCount,
      cellGroupCount,
      totalAttendance,
      totalEvents,
      committedCount,
      uncommittedCount,
      atRiskCount,
    ] = await Promise.all([
      prisma.member.count(),
      prisma.event.count({ where: eventWhere }),
      prisma.cellGroup.count(),
      prisma.attendance.count({ where: attendanceWhere }),
      prisma.event.count({
        where: {
          ...eventWhere,
          attendance: { some: {} },
        },
      }),
      semesterId ? prisma.semesterCommitment.count({ where: { semesterId, status: 'COMMITTED' } }) : prisma.semesterCommitment.count({ where: { status: 'COMMITTED' } }),
      semesterId ? prisma.semesterCommitment.count({ where: { semesterId, status: 'UNCOMMITTED' } }) : prisma.semesterCommitment.count({ where: { status: 'UNCOMMITTED' } }),
      semesterId ? prisma.semesterCommitment.count({ where: { semesterId, status: 'AT_RISK' } }) : prisma.semesterCommitment.count({ where: { status: 'AT_RISK' } }),
    ])

    const attendanceRate = totalEvents > 0
      ? Math.round((totalAttendance / (totalEvents * memberCount)) * 100)
      : 0

    return NextResponse.json({
      memberCount,
      eventCount,
      cellGroupCount,
      attendanceRate,
      committedCount,
      uncommittedCount,
      atRiskCount,
      activeSemesterName,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
} 