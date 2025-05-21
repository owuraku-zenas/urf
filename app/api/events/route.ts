import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      include: {
        attendance: {
          select: {
            id: true,
            memberId: true,
            member: {
              select: {
                id: true,
                name: true,
                cellGroupId: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Creating event with data:", body)

    // Validate required fields
    if (!body.name || !body.type || !body.date) {
      return NextResponse.json(
        { error: "Name, type, and date are required" },
        { status: 400 }
      )
    }

    // Create the event
    const event = await prisma.event.create({
      data: {
        name: body.name,
        type: body.type,
        date: new Date(body.date),
        description: body.description || null,
      },
    })

    console.log("Event created successfully:", event)
    return NextResponse.json(event)
  } catch (error) {
    console.error("Error creating event:", error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: "Invalid data provided" },
          { status: 400 }
        )
      }
    }
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    )
  }
}
