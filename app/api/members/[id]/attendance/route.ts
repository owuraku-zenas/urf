import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const attendance = await prisma.attendance.findMany({
      where: {
        memberId: id
      },
      select: {
        id: true,
        eventId: true,
        event: {
          select: {
            name: true,
            date: true
          }
        },
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedAttendance = attendance.map(record => ({
      id: record.id,
      eventId: record.eventId,
      eventName: record.event.name,
      date: record.event.date.toISOString(),
      status: record.status
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