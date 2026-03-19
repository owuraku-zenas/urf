import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawSemesterId = searchParams.get("semesterId")
    const semesterId = rawSemesterId === 'all' ? null : rawSemesterId;

    console.log("Fetching all members...")
    const members = await prisma.member.findMany({
      where: semesterId ? { joinedSemesterId: semesterId } : undefined,
      include: {
        cellGroup: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        invitedBy: {
          select: {
            id: true,
            name: true
          }
        },
        invitees: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    console.log(`Found ${members.length} members:`, JSON.stringify(members, null, 2))
    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching members:", error)
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    console.log("Creating new member with data:", data)

    if (!data.cellGroupId) {
      return NextResponse.json(
        { error: "Cell group is required" },
        { status: 400 }
      )
    }

    // Extract IDs and remove them from the data object
    const { 
      cellGroupId, 
      invitedById, 
      joinedSemesterId,
      admissionYear,
      currentAcademicLevel,
      birthMonth,
      birthDay,
      ...restData 
    } = data

    const member = await prisma.member.create({
      data: {
        ...restData,
        birthMonth: birthMonth ? parseInt(birthMonth.toString()) : null,
        birthDay: birthDay ? parseInt(birthDay.toString()) : null,
        joinDate: data.joinDate ? new Date(data.joinDate) : new Date(),
        joinedSemesterId: joinedSemesterId === "" ? null : joinedSemesterId,
        admissionYear: admissionYear === "" ? null : admissionYear,
        currentAcademicLevel: currentAcademicLevel === "" ? null : currentAcademicLevel,
        cellGroup: {
          connect: { id: cellGroupId }
        },
        invitedBy: invitedById ? {
          connect: { id: invitedById }
        } : undefined
      },
      include: {
        cellGroup: true,
        invitedBy: true
      }
    })

    console.log("Created new member:", member)
    return NextResponse.json(member)
  } catch (error) {
    console.error("Error creating member:", error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const field = (error.meta?.target as string[])?.[0] ?? 'field'
        return NextResponse.json(
          { error: `A member with this ${field} already exists` },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 }
    )
  }
}
