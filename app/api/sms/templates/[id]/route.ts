import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { name, content } = await req.json()

    if (!name || !content) {
      return NextResponse.json({ error: "Name and content are required." }, { status: 400 })
    }

    const updatedTemplate = await prisma.smsTemplate.update({
      where: { id },
      data: { name, content }
    })

    return NextResponse.json(updatedTemplate)
  } catch (error) {
    console.error("Failed to update template:", error)
    return NextResponse.json({ error: "Failed to update template." }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    
    const template = await prisma.smsTemplate.findUnique({
      where: { id }
    })

    if (!template) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 })
    }

    if (template.isSystem) {
      return NextResponse.json({ error: "Cannot delete a protected system template." }, { status: 403 })
    }

    await prisma.smsTemplate.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete template:", error)
    return NextResponse.json({ error: "Failed to delete template." }, { status: 500 })
  }
}
