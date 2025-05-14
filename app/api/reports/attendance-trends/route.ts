import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Get total number of members
    const totalMembers = await prisma.member.count()

    // Get all events with their attendance counts
    const events = await prisma.event.findMany({
      include: {
        _count: {
          select: {
            attendances: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Calculate attendance statistics
    const eventStats = events.map(event => ({
      id: event.id,
      name: event.name,
      type: event.type,
      date: event.date,
      attendanceCount: event._count.attendances,
      attendancePercentage: Math.round((event._count.attendances / totalMembers) * 100)
    }))

    // Calculate average attendance by event type
    const typeStats = events.reduce((acc, event) => {
      const type = event.type
      if (!acc[type]) {
        acc[type] = {
          total: 0,
          count: 0
        }
      }
      acc[type].total += event._count.attendances
      acc[type].count += 1
      return acc
    }, {} as Record<string, { total: number; count: number }>)

    const averageAttendance = {
      overall: Math.round(
        (events.reduce((sum, event) => sum + event._count.attendances, 0) / 
        (events.length * totalMembers)) * 100
      ),
      sunday: Math.round(
        (typeStats.SUNDAY?.total || 0) / 
        ((typeStats.SUNDAY?.count || 1) * totalMembers) * 100
      ),
      midweek: Math.round(
        (typeStats.MIDWEEK?.total || 0) / 
        ((typeStats.MIDWEEK?.count || 1) * totalMembers) * 100
      ),
      prayer: Math.round(
        (typeStats.PRAYER?.total || 0) / 
        ((typeStats.PRAYER?.count || 1) * totalMembers) * 100
      )
    }

    return NextResponse.json({
      events: eventStats,
      totalMembers,
      averageAttendance
    })
  } catch (error) {
    console.error("Error generating attendance trends report:", error)
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
}
