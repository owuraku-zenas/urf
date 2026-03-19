import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendSMS } from "@/lib/sms"

export async function GET(request: Request) {
  try {
    // Basic authorization for the Cron Job (Vercel Cron provides a secretly injected header)
    const authHeader = request.headers.get("authorization")
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // 1. Determine today's Month and Day
    const today = new Date()
    const currentMonth = today.getUTCMonth() + 1
    const currentDay = today.getUTCDate()

    // 2. Fetch all members whose birthMonth and birthDay match today exactly
    const birthdayMembers = await prisma.member.findMany({
      where: {
        birthMonth: currentMonth,
        birthDay: currentDay
      },
      select: {
        id: true,
        name: true,
        phone: true
      }
    })

    if (birthdayMembers.length === 0) {
      return NextResponse.json({ message: "No birthdays today.", count: 0 })
    }

    // 4. Dispatch SMS using the integrated provider
    const results = await Promise.all(
      birthdayMembers.map((member) =>
        sendSMS({
          recipientId: member.id,
          phoneNumber: member.phone,
          message: `Happy Birthday, ${member.name}! May God bless your new age. Have a wonderful day! - From URF Leadership.`,
        })
      )
    )

    const successCount = results.filter((res) => res.success).length

    console.log(`Successfully dispatched ${successCount}/${birthdayMembers.length} birthday SMS messages.`)

    return NextResponse.json({ 
      message: "Birthday messages dispatched", 
      count: successCount,
      totalAttempted: birthdayMembers.length
    })

  } catch (error) {
    console.error("Error executing Birthday Cron:", error)
    return NextResponse.json(
      { error: "Internal Server Error during Cron execution" },
      { status: 500 }
    )
  }
}
