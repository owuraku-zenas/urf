import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawSemesterId = searchParams.get("semesterId")
    const semesterId = rawSemesterId === 'all' ? null : rawSemesterId

    const [events, membersCount] = await Promise.all([
      prisma.event.findMany({
        where: semesterId ? { semesterId } : undefined,
        include: {
          _count: {
            select: {
              attendance: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      }),
      prisma.member.count()
    ])

    const totalMembers = membersCount > 0 ? membersCount : 1

    const eventsData = events.map(event => ({
      id: event.id,
      name: event.name,
      date: event.date,
      type: event.type,
      attendanceCount: event._count.attendance,
      attendancePercentage: Math.round((event._count.attendance / totalMembers) * 100)
    }))

    const getAveragePercentage = (type?: string) => {
      const filteredEvents = type ? events.filter(e => e.type === type) : events
      if (filteredEvents.length === 0) return 0
      
      const totalPercentage = filteredEvents.reduce((sum, event) => 
        sum + ((event._count.attendance / totalMembers) * 100), 0
      )
      
      return Math.round(totalPercentage / filteredEvents.length)
    }

    return NextResponse.json({
      events: eventsData,
      totalMembers: membersCount,
      averageAttendance: {
        overall: getAveragePercentage(),
        sunday: getAveragePercentage("SUNDAY"),
        midweek: getAveragePercentage("MIDWEEK"),
        prayer: getAveragePercentage("PRAYER")
      }
    })
  } catch (error) {
    console.error("Error generating attendance trends:", error)
    return NextResponse.json(
      { error: "Failed to generate attendance trends" },
      { status: 500 }
    )
  }
}
