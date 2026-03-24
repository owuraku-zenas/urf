import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/sms/templates - List all templates
export async function GET() {
  try {
    const templates = await prisma.smsTemplate.findMany({
      orderBy: { name: 'asc' }
    })
    
    return NextResponse.json(templates)
  } catch (error) {
    console.error("Failed to fetch templates:", error)
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 })
  }
}

// POST /api/sms/templates - Create a new template (Admin or User flow)
export async function POST(req: Request) {
  try {
    const data = await req.json()
    const { name, content } = data

    if (!name || !content) {
      return NextResponse.json({ error: "Name and content are required" }, { status: 400 })
    }

    const newTemplate = await prisma.smsTemplate.create({
      data: {
        name,
        content
      }
    })

    return NextResponse.json(newTemplate, { status: 201 })
  } catch (error) {
    console.error("Failed to create template:", error)
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 })
  }
}
