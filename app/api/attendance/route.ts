import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    const attendances = await prisma.attendance.findMany({
      where: {
        eventId,
      },
      include: {
        member: true,
        markedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(attendances)
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { eventId, memberId, status, markedById } = body

    // Check if attendance record already exists
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        eventId_memberId: {
          eventId,
          memberId,
        },
      },
    })

    if (existingAttendance) {
      // Update existing record
      const attendance = await prisma.attendance.update({
        where: {
          id: existingAttendance.id,
        },
        data: {
          status,
          markedById,
        },
        include: {
          member: true,
          event: true,
        },
      })

      return NextResponse.json(attendance)
    } else {
      // Create new record
      const attendance = await prisma.attendance.create({
        data: {
          eventId,
          memberId,
          status,
          markedById,
        },
        include: {
          member: true,
          event: true,
        },
      })

      return NextResponse.json(attendance, { status: 201 })
    }
  } catch (error) {
    console.error("Error recording attendance:", error)
    return NextResponse.json({ error: "Failed to record attendance" }, { status: 500 })
  }
}
