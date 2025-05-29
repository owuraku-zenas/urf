import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    console.log("Fetching member:", id)
    
    const member = await prisma.member.findUnique({
      where: {
        id,
      },
      include: {
        cellGroup: {
          select: {
            id: true,
            name: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        invitees: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            university: true,
            program: true,
            createdAt: true,
            cellGroup: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        attendances: {
          select: {
            id: true,
            event: {
              select: {
                id: true,
                name: true,
                date: true,
              },
            },
          },
        },
      },
    })

    if (!member) {
      console.log("Member not found:", id)
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    console.log("Found member:", member)
    return NextResponse.json(member)
  } catch (error) {
    console.error("Error fetching member:", error)
    return NextResponse.json({ error: "Failed to fetch member" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 }
      )
    }

    // Update member
    const member = await prisma.member.update({
      where: {
        id,
      },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        university: body.university,
        program: body.program,
        startYear: body.startYear,
        hostel: body.hostel,
        roomNumber: body.roomNumber,
        cellGroupId: body.cellGroupId,
        invitedById: body.invitedById,
      },
      include: {
        cellGroup: {
          select: {
            id: true,
            name: true,
          },
        },
        invitedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        invitees: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            university: true,
            program: true,
            createdAt: true,
            cellGroup: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        attendances: {
          select: {
            id: true,
            event: {
              select: {
                id: true,
                name: true,
                date: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error("Error updating member:", error)
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    await prisma.member.delete({
      where: {
        id,
      },
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting member:", error)
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 })
  }
}
