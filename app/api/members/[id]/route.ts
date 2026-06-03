import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateAcademicLevel } from "@/lib/progression"

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

    const joinDateObj = body.joinDate ? new Date(body.joinDate) : new Date();

    // Auto-calculate joinedSemester based on updated joinDate
    let finalJoinedSemesterId = null;
    const matchingSemester = await prisma.semester.findFirst({
      where: {
        startDate: { lte: joinDateObj },
        endDate: { gte: joinDateObj }
      }
    });

    if (matchingSemester) {
      finalJoinedSemesterId = matchingSemester.id;
    } else {
      // Fallback to active semester or most recent
      const fallbackSemester = await prisma.semester.findFirst({
        where: { status: 'ACTIVE' },
      }) || await prisma.semester.findFirst({
        orderBy: { startDate: 'desc' }
      });
      
      if (fallbackSemester) {
        finalJoinedSemesterId = fallbackSemester.id;
      }
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
        joinDate: joinDateObj,
        birthMonth: body.birthMonth ? parseInt(body.birthMonth.toString()) : null,
        birthDay: body.birthDay ? parseInt(body.birthDay.toString()) : null,
        university: body.university,
        program: body.program,
        startYear: body.startYear,
        hostel: body.hostel,
        roomNumber: body.roomNumber,
        cellGroupId: body.cellGroupId,
        invitedById: body.invitedById === "" ? null : body.invitedById,
        isActive: body.isActive !== undefined ? body.isActive : false,
        admissionYear: body.admissionYear === "" ? null : body.admissionYear,
        admissionMonth: body.admissionMonth ? parseInt(body.admissionMonth.toString()) : 8,
        programDuration: body.programDuration ? parseInt(body.programDuration.toString()) : 4,
        currentAcademicLevel: calculateAcademicLevel(
          body.admissionYear === "" ? null : body.admissionYear,
          body.admissionMonth ? parseInt(body.admissionMonth.toString()) : 8,
          body.programDuration ? parseInt(body.programDuration.toString()) : 4
        ),
        joinedSemesterId: finalJoinedSemesterId,
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
