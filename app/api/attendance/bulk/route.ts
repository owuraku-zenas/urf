import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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

    // Map attendance records to the correct format
    const attendanceRecords = attendances.map(attendance => ({
      eventId,
      memberId: attendance.memberId
    }))

    // Delete existing attendance records for this event
    await prisma.attendance.deleteMany({
      where: { eventId }
    })

    // Create new attendance records
    const createdAttendances = await prisma.attendance.createMany({
      data: attendanceRecords
    })

    return NextResponse.json(createdAttendances)
  } catch (error) {
    console.error("Error creating attendance records:", error)
    return NextResponse.json(
      { error: "Failed to create attendance records" },
      { status: 500 }
    )
  }
} 