import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Get all members ordered by creation date
    const members = await prisma.member.findMany({
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Group members by month
    const monthlyData = members.reduce((acc: any[], member) => {
      const date = new Date(member.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      const existingMonth = acc.find(item => item.month === monthKey)
      if (existingMonth) {
        existingMonth.newMembers++
        existingMonth.totalMembers++
      } else {
        acc.push({
          month: monthKey,
          newMembers: 1,
          totalMembers: acc.length > 0 ? acc[acc.length - 1].totalMembers + 1 : 1
        })
      }
      
      return acc
    }, [])

    // Calculate growth rate for each month
    const growthData = monthlyData.map((item, index) => {
      const prevTotal = index > 0 ? monthlyData[index - 1].totalMembers : 0
      const growthRate = prevTotal === 0 ? 0 : (item.newMembers / prevTotal) * 100
      
      return {
        ...item,
        growthRate: Math.round(growthRate)
      }
    })

    return NextResponse.json({
      growthData,
      totalMembers: members.length,
      newThisMonth: growthData[growthData.length - 1]?.newMembers || 0,
      averageGrowthRate: Math.round(
        growthData.reduce((sum, item) => sum + item.growthRate, 0) / growthData.length
      )
    })
  } catch (error) {
    console.error("Error generating member growth report:", error)
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
}
