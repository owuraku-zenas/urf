import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET() {
  try {
    console.log("Fetching all members...")
    const members = await prisma.member.findMany({
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
    const { cellGroupId, invitedById, ...restData } = data

    const member = await prisma.member.create({
      data: {
        ...restData,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
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
