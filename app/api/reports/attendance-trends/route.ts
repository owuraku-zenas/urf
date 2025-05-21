import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const [events, members] = await Promise.all([
      prisma.event.findMany({
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
      prisma.member.findMany()
    ])

    const totalMembers = members.length

    const eventStats = events.map(event => ({
      id: event.id,
      name: event.name,
      date: event.date,
      type: event.type,
      attendanceCount: event._count.attendance,
      attendancePercentage: Math.round((event._count.attendance / totalMembers) * 100)
    }))

    const typeStats = events.reduce((acc, event) => {
      if (!acc[event.type]) {
        acc[event.type] = {
          total: 0,
          count: 0
        }
      }
      acc[event.type].total += event._count.attendance
      acc[event.type].count++
      return acc
    }, {} as Record<string, { total: number; count: number }>)

    const typeAverages = Object.entries(typeStats).map(([type, stats]) => ({
      type,
      averageAttendance: Math.round(stats.total / stats.count)
    }))

    const overallAverage = Math.round(
      (events.reduce((sum, event) => sum + event._count.attendance, 0) /
        events.length) || 0
    )

    return NextResponse.json({
      eventStats,
      typeAverages,
      overallAverage
    })
  } catch (error) {
    console.error("Error generating attendance trends:", error)
    return NextResponse.json(
      { error: "Failed to generate attendance trends" },
      { status: 500 }
    )
  }
}
