import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateMemberCommitment } from "@/lib/commitment"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const semesterId = searchParams.get("semesterId")

    const attendances = await prisma.attendance.findMany({
      where: semesterId ? { event: { semesterId } } : undefined,
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
    const { eventId, memberId } = body

    if (!eventId || !memberId) {
      return NextResponse.json(
        { error: "Event ID and member ID are required" },
        { status: 400 }
      )
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { semesterId: true }
    })

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    const attendance = await prisma.attendance.create({
      data: {
        eventId,
        memberId,
      },
      include: {
        event: true,
        member: true,
      },
    })

    // Update member isActive if 5 or more PRESENT attendances
    const count = await prisma.attendance.count({
      where: { memberId, status: 'PRESENT' }
    })
    if (count >= 5) {
      await prisma.member.update({ where: { id: memberId }, data: { isActive: true } })
    } else {
      await prisma.member.update({ where: { id: memberId }, data: { isActive: false } })
    }

    if (event.semesterId) {
      // Run asynchronously so we don't block the request response
      calculateMemberCommitment(memberId, event.semesterId).catch(err => {
        console.error("Failed to automatically calculate member commitment:", err)
      })
    }

    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Error creating attendance record:", error)
    return NextResponse.json(
      { error: "Failed to create attendance record" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, eventId, memberId } = body

    if (!id || !eventId || !memberId) {
      return NextResponse.json(
        { error: "ID, event ID, and member ID are required" },
        { status: 400 }
      )
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { semesterId: true }
    })

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    const attendance = await prisma.attendance.update({
      where: { id },
      data: {
        eventId,
        memberId,
      },
      include: {
        event: true,
        member: true,
      },
    })

    // Update member isActive if 5 or more PRESENT attendances
    const count = await prisma.attendance.count({
      where: { memberId, status: 'PRESENT' }
    })
    if (count >= 5) {
      await prisma.member.update({ where: { id: memberId }, data: { isActive: true } })
    } else {
      await prisma.member.update({ where: { id: memberId }, data: { isActive: false } })
    }

    if (event.semesterId) {
      // Run asynchronously so we don't block the request response
      calculateMemberCommitment(memberId, event.semesterId).catch(err => {
        console.error("Failed to automatically calculate member commitment:", err)
      })
    }

    return NextResponse.json(attendance)
  } catch (error) {
    console.error("Error updating attendance record:", error)
    return NextResponse.json(
      { error: "Failed to update attendance record" },
      { status: 500 }
    )
  }
}
