import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

// Validation schema
const UpdateCellGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(500, "Description is too long").nullable().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cellGroup = await prisma.cellGroup.findUnique({
      where: { id: params.id },
      include: {
        members: {
          include: {
            invitedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    if (!cellGroup) {
      return NextResponse.json(
        { error: "Cell group not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(cellGroup)
  } catch (error) {
    console.error("Error fetching cell group:", error)
    return NextResponse.json(
      { error: "Failed to fetch cell group" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validate request body
    const validationResult = UpdateCellGroupSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.errors },
        { status: 400 }
      )
    }

    // Check if cell group exists
    const existingCellGroup = await prisma.cellGroup.findUnique({
      where: { id: params.id },
    })

    if (!existingCellGroup) {
      return NextResponse.json(
        { error: "Cell group not found" },
        { status: 404 }
      )
    }

    // Update cell group
    const updatedCellGroup = await prisma.cellGroup.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description,
      },
    })

    return NextResponse.json(updatedCellGroup)
  } catch (error) {
    console.error("Error updating cell group:", error)
    return NextResponse.json(
      { error: "Failed to update cell group" },
      { status: 500 }
    )
  }
} 