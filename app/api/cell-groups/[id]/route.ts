import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log("Fetching cell group:", id)
    
    const cellGroup = await prisma.cellGroup.findUnique({
      where: {
        id,
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            phone: true,
            university: true,
            program: true,
          },
        },
      },
    })

    if (!cellGroup) {
      console.log("Cell group not found:", id)
      return NextResponse.json({ error: "Cell group not found" }, { status: 404 })
    }

    console.log("Found cell group:", cellGroup)
    return NextResponse.json(cellGroup)
  } catch (error) {
    console.error("Error fetching cell group:", error)
    return NextResponse.json({ error: "Failed to fetch cell group" }, { status: 500 })
  }
} 