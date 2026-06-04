"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSemester } from "@/context/semester-context"
import { SemesterSelector } from "@/components/semester-selector"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CalendarDays, ClipboardList, LayoutGrid, ChevronRight, MessageSquare } from "lucide-react"
import { useSession } from "next-auth/react"

interface Stats {
  memberCount: number
  eventCount: number
  cellGroupCount: number
  attendanceRate: number
  committedCount: number
  uncommittedCount: number
  atRiskCount: number
  activeSemesterName?: string | null
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-gray-100 ${className}`} />
}

export default function Home() {
  const { selectedSemester } = useSemester()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    memberCount: 0,
    eventCount: 0,
    cellGroupCount: 0,
    attendanceRate: 0,
    committedCount: 0,
    uncommittedCount: 0,
    atRiskCount: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/stats?semesterId=${selectedSemester || ""}`)
        if (!res.ok) throw new Error("Failed to fetch stats")
        setStats(await res.json())
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [selectedSemester])

  const evaluated = stats.committedCount + stats.atRiskCount + stats.uncommittedCount
  const committedPct  = evaluated > 0 ? Math.round((stats.committedCount  / evaluated) * 100) : 0
  const atRiskPct     = evaluated > 0 ? Math.round((stats.atRiskCount     / evaluated) * 100) : 0
  const uncommittedPct = evaluated > 0 ? Math.round((stats.uncommittedCount / evaluated) * 100) : 0

  const topStats = [
    { label: "Members",        value: stats.memberCount,       sub: "registered",  icon: Users },
    { label: "Events",         value: stats.eventCount,        sub: "this period",                       icon: CalendarDays },
    { label: "Attendance avg", value: `${stats.attendanceRate}%`, sub: "per event",                     icon: ClipboardList },
    { label: "Cell groups",    value: stats.cellGroupCount,    sub: "active",                            icon: LayoutGrid },
  ]

  return (
    <main className="flex-1">
      <div className="w-full max-w-7xl mx-auto px-5 py-10">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {loading ? <SkeletonBlock className="h-7 w-56" /> : (stats.activeSemesterName ?? "Dashboard")}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Fellowship overview{stats.activeSemesterName ? ` · ${stats.activeSemesterName}` : ""}
            </p>
          </div>
          <SemesterSelector />
        </div>

        {/* Compact stats strip */}
        <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg bg-gray-200 sm:grid-cols-4">
          {topStats.map(({ label, value, sub, icon: Icon }) => (
            <div key={label} className="flex flex-col gap-1 bg-white px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</span>
                <Icon className="h-4 w-4 text-gray-400" />
              </div>
              {loading
                ? <SkeletonBlock className="h-7 w-16 mt-0.5" />
                : <span className="text-2xl font-bold text-gray-900">{value}</span>
              }
              <span className="text-xs text-gray-400">{sub}</span>
            </div>
          ))}
        </div>

        {/* Commitment health + Quick actions */}
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

          {/* Commitment Health */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Commitment Health</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <SkeletonBlock className="h-3 w-full" />
                  <div className="grid grid-cols-3 gap-4">
                    <SkeletonBlock className="h-12" />
                    <SkeletonBlock className="h-12" />
                    <SkeletonBlock className="h-12" />
                  </div>
                </div>
              ) : evaluated === 0 ? (
                <div className="py-10 text-center">
                  <p className="mb-1 text-sm font-medium text-gray-700">No commitment data yet</p>
                  <p className="mb-5 text-sm text-gray-500">
                    Record attendance for events in this semester to start tracking engagement.
                  </p>
                  <Button asChild size="sm">
                    <Link href="/attendance">Record Attendance</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Distribution bar */}
                  <div className="flex h-2.5 overflow-hidden rounded-full">
                    {committedPct > 0 && (
                      <div className="bg-green-500" style={{ width: `${committedPct}%` }} />
                    )}
                    {atRiskPct > 0 && (
                      <div className="ml-px bg-yellow-400" style={{ width: `${atRiskPct}%` }} />
                    )}
                    {uncommittedPct > 0 && (
                      <div className="ml-px bg-red-400" style={{ width: `${uncommittedPct}%` }} />
                    )}
                  </div>

                  {/* Three counts */}
                  <div className="grid grid-cols-3 divide-x divide-gray-100">
                    {[
                      { label: "Committed",   count: stats.committedCount,   pct: committedPct,   dot: "bg-green-500"  },
                      { label: "At Risk",     count: stats.atRiskCount,      pct: atRiskPct,      dot: "bg-yellow-400" },
                      { label: "Uncommitted", count: stats.uncommittedCount, pct: uncommittedPct, dot: "bg-red-400"    },
                    ].map(({ label, count, pct, dot }) => (
                      <div key={label} className="px-4 first:pl-0 last:pr-0">
                        <div className="mb-1 flex items-center gap-1.5">
                          <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
                          <span className="text-xs font-medium text-gray-500">{label}</span>
                        </div>
                        <div className="text-xl font-bold text-gray-900">{count}</div>
                        <div className="text-xs text-gray-400">{pct}%</div>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-xs text-gray-500">
                      {evaluated} of {stats.memberCount} members evaluated
                      {stats.memberCount - evaluated > 0 && ` · ${stats.memberCount - evaluated} awaiting data`}
                    </span>
                    <Link
                      href="/members"
                      className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      View members <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild className="w-full justify-between">
                <Link href="/attendance">
                  <span className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4" />
                    Mark Attendance
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-60" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href="/members/new">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Add Member
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-60" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href="/events/new">
                  <span className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Create Event
                  </span>
                  <ChevronRight className="h-4 w-4 opacity-60" />
                </Link>
              </Button>
              {isAdmin && (
                <Button asChild variant="outline" className="w-full justify-between">
                  <Link href="/admin/sms">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Send SMS Broadcast
                    </span>
                    <ChevronRight className="h-4 w-4 opacity-60" />
                  </Link>
                </Button>
              )}
              <div className="mt-1 border-t border-gray-100 pt-3">
                <Link
                  href="/reports"
                  className="flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  View full analytics <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </main>
  )
}
