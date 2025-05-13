import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Get all events
    const events = await prisma.event.findMany({
      orderBy: {
        date: "asc",
      },
      select: {
        id: true,
        name: true,
        type: true,
        date: true,
        _count: {
          select: {
            attendances: {
              where: {
                status: "PRESENT",
              },
            },
          },
        },
      },
    })

    // Get total member count
    const totalMembers = await prisma.member.count()

    // Calculate attendance percentage for each event
    const attendanceTrends = events.map((event) => ({
      id: event.id,
      name: event.name,
      type: event.type,
      date: event.date,
      attendanceCount: event._count.attendances,
      attendancePercentage: totalMembers > 0 ? Math.round((event._count.attendances / totalMembers) * 100) : 0,
    }))

    return NextResponse.json({
      events: attendanceTrends,
      totalMembers,
    })
  } catch (error) {
    console.error("Error generating attendance trends report:", error)
    return NextResponse.json({ error: "Failed to generate attendance trends report" }, { status: 500 })
  }
}
