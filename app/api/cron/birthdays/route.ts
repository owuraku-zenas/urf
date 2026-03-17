import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    // Basic authorization for the Cron Job (Vercel Cron provides a secretly injected header)
    const authHeader = request.headers.get("authorization")
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // 1. Determine today's Month and Day (in UTC to match the 1970 mock initialization)
    const today = new Date()
    const currentMonth = today.getUTCMonth() + 1
    const currentDay = today.getUTCDate()

    // 2. Fetch all members who have a registered dateOfBirth
    const members = await prisma.member.findMany({
      where: {
        dateOfBirth: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        phone: true,
        dateOfBirth: true
      }
    })

    // 3. Filter members whose birth month and day match today
    const birthdayMembers = members.filter(member => {
      if (!member.dateOfBirth) return false;
      const birthDate = new Date(member.dateOfBirth)
      return birthDate.getUTCMonth() + 1 === currentMonth && birthDate.getUTCDate() === currentDay
    })

    if (birthdayMembers.length === 0) {
      return NextResponse.json({ message: "No birthdays today.", count: 0 })
    }

    // 4. Map the matches to the upcoming SMS Integration logic
    const messages = birthdayMembers.map(member => {
      return {
        recipient: member.phone,
        message: `Happy Birthday, ${member.name}! May God bless your new age. Have a wonderful day! - From URF Leadership.`
      }
    })

    // TODO: Loop through `messages` array and POST to your chosen Ghanaian SMS API Provider (e.g., Hubtel, Arksekel)
    // Example:
    // await Promise.all(messages.map(msg => sendSMS(msg.recipient, msg.message)))

    console.log(`Successfully batched ${messages.length} birthday SMS messages.`)

    return NextResponse.json({ 
      message: "Birthday messages batched successfully", 
      count: messages.length,
      payload: messages // Removing in production
    })

  } catch (error) {
    console.error("Error executing Birthday Cron:", error)
    return NextResponse.json(
      { error: "Internal Server Error during Cron execution" },
      { status: 500 }
    )
  }
}
