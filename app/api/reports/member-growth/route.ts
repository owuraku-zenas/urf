import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    // Get all members with their creation dates
    const members = await prisma.member.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    // Group members by month
    const membersByMonth: Record<string, number> = {}
    let cumulativeCount = 0

    members.forEach((member) => {
      const date = new Date(member.createdAt)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!membersByMonth[monthYear]) {
        membersByMonth[monthYear] = 0
      }

      membersByMonth[monthYear]++
      cumulativeCount++
    })

    // Convert to array format for charting
    const growthData = Object.entries(membersByMonth).map(([monthYear, count]) => ({
      month: monthYear,
      newMembers: count,
      totalMembers: members.filter((m) => new Date(m.createdAt) <= new Date(`${monthYear}-01`)).length,
    }))

    return NextResponse.json({
      growthData,
      totalMembers: members.length,
    })
  } catch (error) {
    console.error("Error generating member growth report:", error)
    return NextResponse.json({ error: "Failed to generate member growth report" }, { status: 500 })
  }
}
