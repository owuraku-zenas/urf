import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const [
      memberCount,
      eventCount,
      cellGroupCount,
      totalAttendance,
      totalEvents,
    ] = await Promise.all([
      prisma.member.count(),
      prisma.event.count(),
      prisma.cellGroup.count(),
      prisma.attendance.count(),
      prisma.event.count({
        where: {
          attendances: {
            some: {},
          },
        },
      }),
    ])

    const attendanceRate = totalEvents > 0
      ? Math.round((totalAttendance / (totalEvents * memberCount)) * 100)
      : 0

    return NextResponse.json({
      memberCount,
      eventCount,
      cellGroupCount,
      attendanceRate,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
} 