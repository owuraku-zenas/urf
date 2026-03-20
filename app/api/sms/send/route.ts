import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendSMS } from "@/lib/sms"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { message, recipientIds, filters } = await request.json()

    // 1. Validation Setup
    if (!message || message.trim() === "") {
      return NextResponse.json({ error: "Message content cannot be empty." }, { status: 400 })
    }

    let membersToMessage = []

    // 2. Query Members based on explicit IDs or broad logic parameters
    if (recipientIds && recipientIds.length > 0) {
      // Admin explicitly selected members from a table
      membersToMessage = await prisma.member.findMany({
        where: {
          id: { in: recipientIds }
        },
        select: {
          id: true,
          phone: true,
          name: true
        }
      })
    } else if (filters) {
      // Dynamic queries (e.g., "All COMMITTED members", "All active Semester attendees")
      // Expand this as needed. E.g., filters.status === 'COMMITTED'
      membersToMessage = await prisma.member.findMany({
        where: buildDynamicFilter(filters),
        select: {
          id: true,
          phone: true,
          name: true
        }
      })
    } else {
      return NextResponse.json({ error: "No recipients selected." }, { status: 400 })
    }

    if (membersToMessage.length === 0) {
      return NextResponse.json({ error: "The provided filters matched no valid recipients." }, { status: 404 })
    }

    // 3. Batch Dispatch
    // In production, consider queuing heavy SMS blasts (using Redis/BullHQ) to avoid Vercel Function timeouts
    // For smaller church groups (< 500 members), Promise.all simulates this cleanly within Next.js
    
    const batchId = crypto.randomUUID()
    
    const results = await Promise.all(
      membersToMessage.map(member => 
        sendSMS({
          recipientId: member.id,
          phoneNumber: member.phone,
          message: personalizeMessage(message, member.name),
          batchId
        })
      )
    )

    const successCount = results.filter(r => r.success).length
    const failCount = results.length - successCount

    return NextResponse.json({
      success: true,
      message: `Successfully queued ${successCount} messages. (${failCount} failures)`,
      stats: { successCount, failCount, totalRequested: membersToMessage.length }
    })

  } catch (error) {
    console.error("SMS Broadcast Error:", error)
    return NextResponse.json(
      { error: "Failed to broadcast batch SMS request." },
      { status: 500 }
    )
  }
}

// Helpers
function buildDynamicFilter(filters: any) {
  const query: any = {}
  if (filters.isActive !== undefined) query.isActive = filters.isActive
  // Additional logic here, e.g filtering by cellGroup or currentAcademicLevel
  return query
}

function personalizeMessage(template: string, name: string): string {
  // Swaps out arbitrary tags before sending
  return template.replace(/{{name}}/gi, name.split(' ')[0]) // E.g., "Hi {{name}}" -> "Hi John"
}
