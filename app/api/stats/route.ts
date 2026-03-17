import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const semesterId = searchParams.get("semesterId")

    const eventWhere = semesterId ? { semesterId } : undefined;
    const attendanceWhere = semesterId ? { event: { semesterId } } : undefined;

    const [
      memberCount,
      eventCount,
      cellGroupCount,
      totalAttendance,
      totalEvents,
      activeMemberCount,
      inactiveMemberCount,
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
          attendance: {
            some: {},
          },
        },
      }),
      prisma.member.count({
        where: { isActive: true }
      }),
      prisma.member.count({
        where: { isActive: false }
      }),
      semesterId ? prisma.semesterCommitment.count({ where: { semesterId, status: 'COMMITTED' } }) : 0,
      semesterId ? prisma.semesterCommitment.count({ where: { semesterId, status: 'UNCOMMITTED' } }) : 0,
      semesterId ? prisma.semesterCommitment.count({ where: { semesterId, status: 'AT_RISK' } }) : 0,
    ])

    const attendanceRate = totalEvents > 0
      ? Math.round((totalAttendance / (totalEvents * memberCount)) * 100)
      : 0

    return NextResponse.json({
      memberCount,
      eventCount,
      cellGroupCount,
      attendanceRate,
      activeMemberCount,
      inactiveMemberCount,
      committedCount,
      uncommittedCount,
      atRiskCount,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
} 