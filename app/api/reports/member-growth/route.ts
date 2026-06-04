import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawSemesterId = searchParams.get("semesterId")
    const semesterId = rawSemesterId === 'all' ? null : rawSemesterId;

    let memberWhere = undefined;
    if (semesterId) {
      const semester = await prisma.semester.findUnique({
        where: { id: semesterId },
        select: { startDate: true, endDate: true },
      });
      if (semester?.startDate && semester?.endDate) {
        memberWhere = { joinDate: { gte: semester.startDate, lte: semester.endDate } };
      }
    }

    const members = await prisma.member.findMany({
      where: memberWhere,
      select: { joinDate: true },
      orderBy: { joinDate: 'asc' },
    })

    // Group members by their actual join month
    const monthlyData = members.reduce((acc: any[], member) => {
      const date = new Date(member.joinDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      const existing = acc.find(item => item.month === monthKey)
      if (existing) {
        existing.newMembers++
        existing.totalMembers++
      } else {
        acc.push({
          month: monthKey,
          newMembers: 1,
          totalMembers: acc.length > 0 ? acc[acc.length - 1].totalMembers + 1 : 1,
        })
      }

      return acc
    }, [])

    // Growth rate per month relative to the previous month's total
    const growthData = monthlyData.map((item, index) => {
      const prevTotal = index > 0 ? monthlyData[index - 1].totalMembers : 0
      const growthRate = prevTotal === 0 ? 0 : (item.newMembers / prevTotal) * 100
      return { ...item, growthRate: Math.round(growthRate) }
    })

    // newThisMonth: members whose joinDate is in the current calendar month
    const now = new Date()
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const thisMonthEntry = growthData.find(item => item.month === thisMonthKey)
    const newThisMonth = thisMonthEntry?.newMembers ?? 0

    const averageGrowthRate = growthData.length > 0
      ? Math.round(growthData.reduce((sum, item) => sum + item.growthRate, 0) / growthData.length)
      : 0

    return NextResponse.json({
      growthData,
      totalMembers: members.length,
      newThisMonth,
      averageGrowthRate,
    })
  } catch (error) {
    console.error("Error generating member growth report:", error)
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
}
