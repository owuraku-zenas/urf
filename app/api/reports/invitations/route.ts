import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // All members who invited at least one other member
    const inviters = await prisma.member.findMany({
      where: { invitees: { some: {} } },
      select: {
        id: true,
        name: true,
        cellGroup: { select: { name: true } },
        invitees: {
          select: {
            id: true,
            commitments: {
              select: { status: true },
              orderBy: { updatedAt: 'desc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { invitees: { _count: 'desc' } },
    })

    const rows = inviters.map(m => {
      const total = m.invitees.length
      const committed = m.invitees.filter(
        inv => inv.commitments[0]?.status === 'COMMITTED'
      ).length
      const atRisk = m.invitees.filter(
        inv => inv.commitments[0]?.status === 'AT_RISK'
      ).length
      const uncommitted = m.invitees.filter(
        inv => inv.commitments[0]?.status === 'UNCOMMITTED'
      ).length
      const retentionRate = total > 0 ? Math.round((committed / total) * 100) : 0

      return {
        id: m.id,
        name: m.name,
        cellGroup: m.cellGroup?.name ?? null,
        totalInvited: total,
        committed,
        atRisk,
        uncommitted,
        retentionRate,
      }
    })

    // Sort by committed count desc, then total invited desc
    rows.sort((a, b) => b.committed - a.committed || b.totalInvited - a.totalInvited)

    const totalInvited = rows.reduce((s, r) => s + r.totalInvited, 0)
    const totalCommitted = rows.reduce((s, r) => s + r.committed, 0)

    return NextResponse.json({
      inviters: rows,
      summary: {
        totalInviters: rows.length,
        totalInvited,
        totalCommitted,
        overallRetentionRate: totalInvited > 0
          ? Math.round((totalCommitted / totalInvited) * 100)
          : 0,
      },
    })
  } catch (error) {
    console.error("Invitations report error:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
