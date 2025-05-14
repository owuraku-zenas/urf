import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const attendances = await prisma.attendance.findMany({
      include: {
        event: true,
        member: true,
      },
    })
    return NextResponse.json(attendances)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch attendance records" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { eventId, memberId, status } = body

    // Check if attendance record exists
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        eventId,
        memberId,
      },
    })

    let attendance
    if (existingAttendance) {
      // Update existing attendance
      attendance = await prisma.attendance.update({
        where: {
          id: existingAttendance.id,
        },
        data: {
          status,
        },
      })
    } else {
      // Create new attendance
      attendance = await prisma.attendance.create({
        data: {
          eventId,
          memberId,
          status,
        },
      })
    }

    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Error updating attendance:", error)
    return NextResponse.json({ error: "Failed to update attendance" }, { status: 500 })
  }
}
