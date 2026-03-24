import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { searchParams } = new URL(request.url)
    const semesterId = searchParams.get("semesterId")

    const member = await prisma.member.findUnique({
      where: { id },
      select: { joinDate: true }
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    // Get all events that happened ON or AFTER the member joined
    const memberJoinDate = new Date(member.joinDate)
    memberJoinDate.setHours(0, 0, 0, 0)

    const allEvents = await prisma.event.findMany({
      where: {
        ...(semesterId ? { semesterId } : {}),
        date: { gte: memberJoinDate }
      },
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