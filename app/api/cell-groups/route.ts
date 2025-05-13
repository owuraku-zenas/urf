import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const cellGroups = await prisma.cellGroup.findMany({
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    return NextResponse.json(cellGroups)
  } catch (error) {
    console.error("Error fetching cell groups:", error)
    return NextResponse.json({ error: "Failed to fetch cell groups" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { name, description } = body

    // Create the cell group
    const cellGroup = await prisma.cellGroup.create({
      data: {
        name,
        description,
      },
    })

    return NextResponse.json(cellGroup, { status: 201 })
  } catch (error) {
    console.error("Error creating cell group:", error)
    return NextResponse.json({ error: "Failed to create cell group" }, { status: 500 })
  }
}
