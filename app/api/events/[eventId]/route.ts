import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(
  request: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await context.params
    console.log("Fetching event with ID:", eventId)
    const event = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
      include: {
        attendance: {
          select: {
            id: true,
            memberId: true,
            createdAt: true,
            member: {
              select: {
                id: true,
                name: true,
                phone: true,
                cellGroup: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Only admins can edit events" },
        { status: 403 }
      )
    }

    const { eventId } = await context.params
    const body = await request.json()
    const { name, type, date, description, preparations, feedback } = body

    if (!name || !type || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const event = await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        name,
        type,
        date: new Date(date),
        description,
        preparations,
        feedback,
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: "Only admins can delete events" },
        { status: 403 }
      )
    }

    const { eventId } = await context.params

    // First delete all attendance records for this event
    await prisma.attendance.deleteMany({
      where: {
        eventId: eventId
      }
    })

    // Then delete the event
    await prisma.event.delete({
      where: {
        id: eventId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    )
  }
} 