import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function CellGroupsPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const isAdmin = session.user.role === 'ADMIN'

  const [cellGroups, activeSemester] = await Promise.all([
    prisma.cellGroup.findMany({
      include: { _count: { select: { members: true } } },
      orderBy: { name: 'asc' },
    }),
    prisma.semester.findFirst({ where: { status: 'ACTIVE' } }),
  ])

  // Build commitment breakdown per cell group for the active semester
  const commitmentMap: Record<string, Record<string, number>> = {}
  if (activeSemester) {
    const commitments = await prisma.semesterCommitment.findMany({
      where: { semesterId: activeSemester.id },
      include: { member: { select: { cellGroupId: true } } },
    })
    for (const c of commitments) {
      const cgId = c.member.cellGroupId
      if (!cgId) continue
      if (!commitmentMap[cgId]) commitmentMap[cgId] = {}
      commitmentMap[cgId][c.status] = (commitmentMap[cgId][c.status] || 0) + 1
    }
  }

  const committed   = (cgId: string) => commitmentMap[cgId]?.COMMITTED   || 0
  const atRisk      = (cgId: string) => commitmentMap[cgId]?.AT_RISK      || 0
  const uncommitted = (cgId: string) => commitmentMap[cgId]?.UNCOMMITTED  || 0
  const newMember   = (cgId: string) => commitmentMap[cgId]?.NEW_MEMBER   || 0

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-3xl font-bold">Cell Groups</h1>
        {isAdmin && (
          <Link href="/cell-groups/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Cell Group
            </Button>
          </Link>
        )}
      </div>

      {activeSemester && (
        <p className="mb-6 text-sm text-muted-foreground">
          Commitment scores for <span className="font-medium">{activeSemester.name}</span>
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cellGroups.map((cg) => {
          const total = committed(cg.id) + atRisk(cg.id) + uncommitted(cg.id) + newMember(cg.id)
          const committedPct = total > 0 ? Math.round((committed(cg.id) / total) * 100) : 0
          const atRiskPct    = total > 0 ? Math.round((atRisk(cg.id)    / total) * 100) : 0
          const uncommPct    = total > 0 ? Math.round((uncommitted(cg.id) / total) * 100) : 0

          return (
            <Link key={cg.id} href={`/cell-groups/${cg.id}`} className="block">
              <div className="bg-white rounded-lg border shadow-sm p-6 hover:shadow-md transition-shadow h-full">
                <div className="flex items-start justify-between mb-1">
                  <h2 className="text-lg font-semibold">{cg.name}</h2>
                  <span className="text-xs text-muted-foreground">{cg._count.members} members</span>
                </div>
                {cg.description && (
                  <p className="text-sm text-gray-500 mb-4">{cg.description}</p>
                )}

                {activeSemester && total > 0 ? (
                  <div className="mt-3 space-y-2">
                    {/* Mini bar */}
                    <div className="flex h-1.5 overflow-hidden rounded-full bg-gray-100">
                      {committedPct > 0 && <div className="bg-green-500" style={{ width: `${committedPct}%` }} />}
                      {atRiskPct    > 0 && <div className="ml-px bg-yellow-400" style={{ width: `${atRiskPct}%` }} />}
                      {uncommPct    > 0 && <div className="ml-px bg-red-400" style={{ width: `${uncommPct}%` }} />}
                    </div>
                    {/* Counts */}
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                        {committed(cg.id)} committed
                      </span>
                      {atRisk(cg.id) > 0 && (
                        <span className="flex items-center gap-1 text-yellow-700">
                          <span className="inline-block h-2 w-2 rounded-full bg-yellow-400" />
                          {atRisk(cg.id)} at risk
                        </span>
                      )}
                      {uncommitted(cg.id) > 0 && (
                        <span className="flex items-center gap-1 text-red-700">
                          <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
                          {uncommitted(cg.id)} uncommitted
                        </span>
                      )}
                    </div>
                  </div>
                ) : activeSemester ? (
                  <p className="mt-3 text-xs text-gray-400">No commitment data yet</p>
                ) : null}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
