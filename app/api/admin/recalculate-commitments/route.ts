import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { calculateMemberCommitment } from "@/lib/commitment"

/**
 * POST /api/admin/recalculate-commitments
 *
 * Recalculates commitment status for every (member, semester) pair that has
 * attendance data. Safe to run multiple times — existing overrideReason values
 * are preserved by calculateMemberCommitment.
 */
export async function POST() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 })
  }

  // Find every unique (memberId, semesterId) pair that has attendance records
  const pairs = await prisma.attendance.findMany({
    where: { event: { semesterId: { not: null } } },
    select: {
      memberId: true,
      event: { select: { semesterId: true } },
    },
    distinct: ["memberId", "eventId"],
  })

  const unique = new Map<string, Set<string>>()
  for (const { memberId, event } of pairs) {
    if (!event.semesterId) continue
    if (!unique.has(memberId)) unique.set(memberId, new Set())
    unique.get(memberId)!.add(event.semesterId)
  }

  let count = 0
  const tasks: Promise<void>[] = []
  for (const [memberId, semesterIds] of unique) {
    for (const semesterId of semesterIds) {
      tasks.push(
        calculateMemberCommitment(memberId, semesterId).then(() => { count++ })
      )
    }
  }

  await Promise.all(tasks)

  return NextResponse.json({
    recalculated: count,
    message: `Recalculated commitment for ${count} member–semester pair${count !== 1 ? "s" : ""}.`,
  })
}
