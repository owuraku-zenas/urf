import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawSemesterId = searchParams.get("semesterId")
    const semesterId = rawSemesterId === 'all' ? null : rawSemesterId

    // Denominator: members who had joined on or before the semester ended.
    // When no semester is selected, use total membership.
    let memberCountWhere: any = undefined
    if (semesterId) {
      const semester = await prisma.semester.findUnique({
        where: { id: semesterId },
        select: { endDate: true },
      })
      if (semester?.endDate) {
        memberCountWhere = { joinDate: { lte: semester.endDate } }
      }
    }

    const [events, membersCount] = await Promise.all([
      prisma.event.findMany({
        where: semesterId ? { semesterId } : undefined,
        include: { _count: { select: { attendance: true } } },
        orderBy: { date: 'desc' },
      }),
      prisma.member.count({ where: memberCountWhere }),
    ])

    const totalMembers = membersCount > 0 ? membersCount : 1

    const eventsData = events.map(event => ({
      id: event.id,
      name: event.name,
      date: event.date,
      type: event.type,
      attendanceCount: event._count.attendance,
      attendancePercentage: Math.round((event._count.attendance / totalMembers) * 100),
    }))

    const avgForType = (type?: string) => {
      const filtered = type ? events.filter(e => e.type === type) : events
      if (filtered.length === 0) return 0
      return Math.round(
        filtered.reduce((sum, e) => sum + (e._count.attendance / totalMembers) * 100, 0) / filtered.length
      )
    }

    return NextResponse.json({
      events: eventsData,
      totalMembers: membersCount,
      averageAttendance: {
        overall: avgForType(),
        sunday: avgForType("SUNDAY"),
        midweek: avgForType("MIDWEEK"),
        prayer: avgForType("PRAYER"),
        special: avgForType("SPECIAL"),
      },
    })
  } catch (error) {
    console.error("Error generating attendance trends:", error)
    return NextResponse.json({ error: "Failed to generate attendance trends" }, { status: 500 })
  }
}
