import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Get all events
    const allEvents = await prisma.event.findMany({
      select: {
        id: true,
        name: true,
        date: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Get member's attendance records
    const memberAttendance = await prisma.attendance.findMany({
      where: {
        memberId: id
      },
      select: {
        id: true,
        eventId: true,
        status: true
      }
    })

    // Create a map of event IDs to attendance status
    const attendanceMap = new Map(
      memberAttendance.map(record => [record.eventId, record.status])
    )

    // Format the response to include all events
    const formattedAttendance = allEvents.map(event => ({
      id: attendanceMap.get(event.id) ? memberAttendance.find(r => r.eventId === event.id)?.id : `absent-${event.id}`,
      eventId: event.id,
      eventName: event.name,
      date: event.date.toISOString(),
      status: attendanceMap.get(event.id) || 'ABSENT'
    }))

    return NextResponse.json(formattedAttendance)
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch attendance data' },
      { status: 500 }
    )
  }
} 