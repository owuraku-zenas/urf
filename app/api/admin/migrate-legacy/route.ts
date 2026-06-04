import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

/**
 * POST /api/admin/migrate-legacy
 *
 * One-time migration: finds every NEW_MEMBER commitment whose member's
 * joinDate falls outside all non-archive semester date ranges, then
 * updates those commitments to LEGACY.
 *
 * Safe to run multiple times (idempotent).
 */
export async function POST() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 })
  }

  // 1. Fetch all regular (non-archive) semesters with defined date ranges
  const allRegular = await prisma.semester.findMany({
    where: { isArchive: false },
    select: { id: true, startDate: true, endDate: true },
  })
  const regularSemesters = allRegular.filter(
    (s): s is typeof s & { startDate: Date; endDate: Date } => s.startDate !== null && s.endDate !== null
  )

  // 2. Find all members with at least one NEW_MEMBER commitment
  const candidates = await prisma.semesterCommitment.findMany({
    where: { status: "NEW_MEMBER" },
    include: {
      member: { select: { id: true, joinDate: true } },
    },
  })

  if (candidates.length === 0) {
    return NextResponse.json({ updated: 0, message: "No NEW_MEMBER commitments found." })
  }

  // 3. For each candidate, check whether the member's joinDate falls within
  //    any regular semester. If not — they are historical and should be LEGACY.
  const toUpdate: string[] = []

  for (const commitment of candidates) {
    const joinDate = commitment.member.joinDate
    const fallsInRegularSemester = regularSemesters.some(
      (s) => joinDate >= s.startDate && joinDate <= s.endDate
    )
    if (!fallsInRegularSemester) {
      toUpdate.push(commitment.id)
    }
  }

  if (toUpdate.length === 0) {
    return NextResponse.json({
      updated: 0,
      message: "All NEW_MEMBER commitments belong to members who joined within a recorded semester. No changes needed.",
    })
  }

  // 4. Batch update to COMMITTED — historical members start committed by default
  const result = await prisma.semesterCommitment.updateMany({
    where: { id: { in: toUpdate } },
    data: { status: "COMMITTED" },
  })

  return NextResponse.json({
    updated: result.count,
    message: `Updated ${result.count} commitment${result.count !== 1 ? "s" : ""} from NEW_MEMBER to LEGACY.`,
  })
}
