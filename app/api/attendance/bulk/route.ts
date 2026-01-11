import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { AttendanceStatus } from "@prisma/client"

export async function POST(request: Request) {
  try {
    const { eventId, attendances } = await request.json()

    // Validate input
    if (!eventId || !attendances || !Array.isArray(attendances)) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      )
    }

    // Get the event to verify it exists
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    // Delete existing attendance records for this event
    await prisma.attendance.deleteMany({
      where: { eventId }
    })

    // Create new attendance records one by one
    const createdAttendances = await Promise.all(
      attendances.map(attendance => 
        prisma.attendance.create({
          data: {
            member: { connect: { id: attendance.memberId } },
            event: { connect: { id: eventId } },
            date: event.date,
            status: attendance.status === 'ABSENT' ? AttendanceStatus.ABSENT : AttendanceStatus.PRESENT
          }
        })
      )
    )

    // For each member, update isActive if 5 or more PRESENT attendances
    const memberIds = attendances.map(a => a.memberId)
    await Promise.all(memberIds.map(async memberId => {
      const count = await prisma.attendance.count({ where: { memberId, status: 'PRESENT' } })
      const isActive = count >= 5
      await prisma.member.update({ where: { id: memberId }, data: { isActive } })
    }))

    return NextResponse.json(createdAttendances)
  } catch (error) {
    console.error("Error creating attendance records:", error)
    return NextResponse.json(
      { error: "Failed to create attendance records" },
      { status: 500 }
    )
  }
} 