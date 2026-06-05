import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // All semesters with dates, chronological
    const semesters = await prisma.semester.findMany({
      where: { startDate: { not: null }, endDate: { not: null } },
      orderBy: { startDate: 'asc' },
      select: { id: true, name: true, startDate: true, endDate: true },
    })

    if (semesters.length < 2) {
      return NextResponse.json({ rows: [], semesters })
    }

    // For each consecutive pair (A → B), calculate:
    //   - how many members were COMMITTED in A
    //   - of those, how many are COMMITTED in B (retained)
    //   - how many dropped to AT_RISK or UNCOMMITTED
    const rows = await Promise.all(
      semesters.slice(0, -1).map(async (semA, i) => {
        const semB = semesters[i + 1]

        // Members committed in semester A
        const committedInA = await prisma.semesterCommitment.findMany({
          where: { semesterId: semA.id, status: 'COMMITTED' },
          select: { memberId: true },
        })
        const memberIds = committedInA.map(c => c.memberId)

        if (memberIds.length === 0) {
          return {
            fromSemester: semA.name,
            toSemester: semB.name,
            committedInA: 0,
            retainedCommitted: 0,
            droppedToAtRisk: 0,
            droppedToUncommitted: 0,
            noData: 0,
            retentionRate: 0,
          }
        }

        // Their status in semester B
        const statusInB = await prisma.semesterCommitment.findMany({
          where: { semesterId: semB.id, memberId: { in: memberIds } },
          select: { memberId: true, status: true },
        })

        const statusMap = new Map(statusInB.map(s => [s.memberId, s.status]))

        let retainedCommitted = 0
        let droppedToAtRisk = 0
        let droppedToUncommitted = 0
        let noData = 0

        for (const id of memberIds) {
          const status = statusMap.get(id)
          if (!status)                   noData++
          else if (status === 'COMMITTED')    retainedCommitted++
          else if (status === 'AT_RISK')      droppedToAtRisk++
          else if (status === 'UNCOMMITTED')  droppedToUncommitted++
          else                               noData++
        }

        const retentionRate = memberIds.length > 0
          ? Math.round((retainedCommitted / memberIds.length) * 100)
          : 0

        return {
          fromSemester: semA.name,
          toSemester: semB.name,
          committedInA: memberIds.length,
          retainedCommitted,
          droppedToAtRisk,
          droppedToUncommitted,
          noData,
          retentionRate,
        }
      })
    )

    // Latest transition first
    rows.reverse()

    return NextResponse.json({ rows, semesters })
  } catch (error) {
    console.error("Retention report error:", error)
    return NextResponse.json({ error: "Failed to generate retention report" }, { status: 500 })
  }
}
