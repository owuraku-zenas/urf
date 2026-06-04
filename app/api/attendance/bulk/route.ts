import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { AttendanceStatus } from "@prisma/client"
import { calculateMemberCommitment } from "@/lib/commitment"

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

    // Recalculate commitment for every member in this event
    if (event.semesterId) {
      const memberIds = [...new Set(attendances.map((a: any) => a.memberId))]
      memberIds.forEach(memberId =>
        calculateMemberCommitment(memberId, event.semesterId!).catch(err =>
          console.error("Commitment recalc failed for", memberId, err)
        )
      )
    }

    return NextResponse.json(createdAttendances)
  } catch (error) {
    console.error("Error creating attendance records:", error)
    return NextResponse.json(
      { error: "Failed to create attendance records" },
      { status: 500 }
    )
  }
} 