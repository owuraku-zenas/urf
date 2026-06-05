import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const members = await prisma.member.findMany({
      select: {
        currentAcademicLevel: true,
        university: true,
        program: true,
      },
    })

    // Academic level distribution
    const levelCounts: Record<string, number> = {}
    for (const m of members) {
      const level = m.currentAcademicLevel || 'Unknown'
      levelCounts[level] = (levelCounts[level] || 0) + 1
    }
    const levelOrder = ['100', '200', '300', '400', '500', '600', 'ALUMNI', 'Unknown']
    const academicLevels = levelOrder
      .filter(l => levelCounts[l])
      .map(level => ({ level, count: levelCounts[level] }))

    // Top universities
    const univCounts: Record<string, number> = {}
    for (const m of members) {
      const u = m.university?.trim() || 'Not specified'
      univCounts[u] = (univCounts[u] || 0) + 1
    }
    const universities = Object.entries(univCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Top programs
    const progCounts: Record<string, number> = {}
    for (const m of members) {
      const p = m.program?.trim() || 'Not specified'
      progCounts[p] = (progCounts[p] || 0) + 1
    }
    const programs = Object.entries(progCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return NextResponse.json({
      totalMembers: members.length,
      academicLevels,
      universities,
      programs,
    })
  } catch (error) {
    console.error("Demographics report error:", error)
    return NextResponse.json({ error: "Failed to generate demographics report" }, { status: 500 })
  }
}
