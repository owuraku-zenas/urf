import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { CommitmentStatus } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const rawSemesterId = searchParams.get("semesterId")
    const semesterId = rawSemesterId === 'all' ? null : rawSemesterId

    const eventWhere = semesterId ? { semesterId } : undefined
    const attendanceWhere = semesterId ? { event: { semesterId } } : undefined

    const commitmentWhere = (status: CommitmentStatus) =>
      semesterId ? { semesterId, status } : { status }

    const sem = semesterId
      ? await prisma.semester.findUnique({ where: { id: semesterId } })
      : null

    let activeSemesterName = null
    if (semesterId) {
      activeSemesterName = sem?.name || null
    } else if (rawSemesterId === 'all') {
      activeSemesterName = "All Semesters"
    }

    const memberCountWhere = sem
      ? { where: { joinDate: { lte: sem.endDate! } } }
      : undefined

    const [
      memberCount,
      eventCount,
      cellGroupCount,
      totalAttendance,
      totalEvents,
      committedCount,
      uncommittedCount,
      atRiskCount,
      newMemberCount,
    ] = await Promise.all([
      prisma.member.count(memberCountWhere),
      prisma.event.count({ where: eventWhere }),
      prisma.cellGroup.count(),
      prisma.attendance.count({ where: attendanceWhere }),
      prisma.event.count({ where: { ...eventWhere, attendance: { some: {} } } }),
      prisma.semesterCommitment.count({ where: commitmentWhere(CommitmentStatus.COMMITTED) }),
      prisma.semesterCommitment.count({ where: commitmentWhere(CommitmentStatus.UNCOMMITTED) }),
      prisma.semesterCommitment.count({ where: commitmentWhere(CommitmentStatus.AT_RISK) }),
      prisma.semesterCommitment.count({ where: commitmentWhere(CommitmentStatus.NEW_MEMBER) }),
    ])

    // Separate query so TypeScript resolves the include type correctly
    const atRiskRows = await prisma.semesterCommitment.findMany({
      where: commitmentWhere(CommitmentStatus.AT_RISK),
      take: 8,
      orderBy: { updatedAt: 'desc' },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            cellGroup: { select: { name: true } },
          },
        },
      },
    })

    const attendanceRate = totalEvents > 0
      ? Math.round((totalAttendance / (totalEvents * memberCount)) * 100)
      : 0

    return NextResponse.json({
      memberCount,
      eventCount,
      cellGroupCount,
      attendanceRate,
      committedCount,
      uncommittedCount,
      atRiskCount,
      newMemberCount,
      atRiskMembers: atRiskRows.map(r => ({
        id: r.member.id,
        name: r.member.name,
        cellGroup: r.member.cellGroup?.name ?? null,
      })),
      activeSemesterName,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
