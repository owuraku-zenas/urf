import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    console.log("Fetching cell groups...")
    const cellGroups = await prisma.cellGroup.findMany({
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    })
    console.log("Found cell groups:", cellGroups)
    return NextResponse.json(cellGroups)
  } catch (error) {
    console.error("Error fetching cell groups:", error)
    return NextResponse.json({ error: "Failed to fetch cell groups" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Creating cell group with data:", body)

    // Validate required fields
    if (!body.name) {
      console.error("Missing required field: name")
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Check if cell group with same name already exists
    const existingCellGroup = await prisma.cellGroup.findUnique({
      where: { name: body.name },
    })

    if (existingCellGroup) {
      console.error("Cell group with this name already exists")
      return NextResponse.json(
        { error: "A cell group with this name already exists" },
        { status: 400 }
      )
    }

    const cellGroup = await prisma.cellGroup.create({
      data: {
        name: body.name,
        description: body.description || "",
      },
      include: {
        _count: {
          select: {
            members: true,
          },
        },
      },
    })
    console.log("Successfully created cell group:", cellGroup)
    return NextResponse.json(cellGroup, { status: 201 })
  } catch (error) {
    console.error("Error creating cell group:", error)
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ error: "Failed to create cell group" }, { status: 500 })
  }
}
