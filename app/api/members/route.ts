import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const members = await prisma.member.findMany({
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
      },
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    // Create the member
    const member = await prisma.member.create({
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
        cellGroupId: cellGroupId || null,
        invitedById: invitedById || null,
        // Create department connections
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

    return NextResponse.json(member, { status: 201 })
  } catch (error) {
    console.error("Error creating member:", error)
    return NextResponse.json({ error: "Failed to create member" }, { status: 500 })
  }
}
