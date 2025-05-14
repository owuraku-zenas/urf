import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await context.params
    const attendances = await prisma.attendance.findMany({
      where: {
        eventId
      },
      include: {
        member: {
          include: {
            cellGroup: true
          }
        }
      }
    })

    return NextResponse.json(attendances)
  } catch (error) {
    console.error("Error fetching attendance records:", error)
    return NextResponse.json(
      { error: "Failed to fetch attendance records" },
      { status: 500 }
    )
  }
} 