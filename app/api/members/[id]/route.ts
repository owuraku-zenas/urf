import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const member = await prisma.member.findUnique({
      where: {
        id: params.id,
      },
      include: {
        cellGroup: true,
        invitedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        departments: {
          include: {
            department: true,
          },
        },
        attendances: {
          include: {
            event: true,
          },
          orderBy: {
            event: {
              date: "desc",
            },
          },
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error("Error fetching member:", error)
    return NextResponse.json({ error: "Failed to fetch member" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    const {
      name,
      email,
      phone,
      dateOfBirth,
      university,
      program,
      startYear,
      hostel,
      roomNumber,
      cellGroupId,
      invitedById,
      departmentIds = [],
    } = body

    // First, delete existing department connections
    await prisma.memberDepartment.deleteMany({
      where: {
        memberId: params.id,
      },
    })

    // Update the member
    const member = await prisma.member.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        university,
        program,
        startYear,
        hostel,
        roomNumber,
        cellGroupId,
        invitedById,
        // Create new department connections
        departments: {
          create: departmentIds.map((departmentId: string) => ({
            department: {
              connect: {
                id: departmentId,
              },
            },
          })),
        },
      },
      include: {
        cellGroup: true,
        invitedBy: true,
        departments: {
          include: {
            department: true,
          },
        },
      },
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error("Error updating member:", error)
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // First, delete related records
    await prisma.memberDepartment.deleteMany({
      where: {
        memberId: params.id,
      },
    })

    await prisma.attendance.deleteMany({
      where: {
        memberId: params.id,
      },
    })

    // Then delete the member
    await prisma.member.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting member:", error)
    return NextResponse.json({ error: "Failed to delete member" }, { status: 500 })
  }
}
