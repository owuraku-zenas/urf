"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Users, UserCheck, TrendingUp } from "lucide-react"
import { exportToCSV } from "@/lib/utils"

interface Inviter {
  id: string
  name: string
  cellGroup: string | null
  totalInvited: number
  committed: number
  atRisk: number
  uncommitted: number
  retentionRate: number
}

interface Summary {
  totalInviters: number
  totalInvited: number
  totalCommitted: number
  overallRetentionRate: number
}

interface ReportData {
  inviters: Inviter[]
  summary: Summary
}

export default function InvitationsReportPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/reports/invitations')
      .then(r => { if (!r.ok) throw new Error('Failed to fetch'); return r.json() })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (error) return (
    <div className="container mx-auto py-10">
      <p className="text-red-600">{error}</p>
    </div>
  )

  const summary = data?.summary
  const inviters = data?.inviters ?? []

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/reports"><ArrowLeft className="mr-2 h-4 w-4" />Back to Reports</Link>
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Invitations Report</h1>
          <p className="text-muted-foreground mt-1">Who is bringing people in, and how many stay committed.</p>
        </div>
        <Button
          onClick={() => {
            if (!inviters.length) return
            exportToCSV(
              inviters.map(r => ({
                Name: r.name,
                'Cell Group': r.cellGroup || '—',
                'Total Invited': r.totalInvited,
                'Committed': r.committed,
                'At Risk': r.atRisk,
                'Uncommitted': r.uncommitted,
                'Retention Rate': `${r.retentionRate}%`,
              })),
              'invitations-report'
            )
          }}
          disabled={loading || !inviters.length}
        >
          <Download className="mr-2 h-4 w-4" />Export
        </Button>
      </div>

      {/* Summary KPIs */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {[
          { label: "Active Inviters", value: summary?.totalInviters, icon: Users, sub: "members who invited someone" },
          { label: "Total Invited", value: summary?.totalInvited, icon: Users, sub: "all-time invitees" },
          { label: "Still Committed", value: summary?.totalCommitted, icon: UserCheck, sub: "of those invited" },
          { label: "Retention Rate", value: summary ? `${summary.overallRetentionRate}%` : "—", icon: TrendingUp, sub: "invited → committed" },
        ].map(({ label, value, icon: Icon, sub }) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{loading ? "..." : value ?? "—"}</div>
              <p className="text-xs text-muted-foreground mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Leaderboard table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Inviters</CardTitle>
          <CardDescription>Sorted by number of invited members who are committed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left font-medium p-3">#</th>
                  <th className="text-left font-medium p-3">Name</th>
                  <th className="text-left font-medium p-3">Cell Group</th>
                  <th className="text-right font-medium p-3">Invited</th>
                  <th className="text-right font-medium p-3 text-green-700">Committed</th>
                  <th className="text-right font-medium p-3 text-yellow-700">At Risk</th>
                  <th className="text-right font-medium p-3 text-red-700">Uncommitted</th>
                  <th className="text-right font-medium p-3">Retention</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
                ) : inviters.length === 0 ? (
                  <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">No invitation data yet.</td></tr>
                ) : inviters.map((row, i) => (
                  <tr key={row.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-muted-foreground font-medium">{i + 1}</td>
                    <td className="p-3">
                      <Link href={`/members/${row.id}`} className="font-medium hover:text-blue-600">
                        {row.name}
                      </Link>
                    </td>
                    <td className="p-3 text-muted-foreground">{row.cellGroup ?? "—"}</td>
                    <td className="p-3 text-right font-medium">{row.totalInvited}</td>
                    <td className="p-3 text-right text-green-700 font-medium">{row.committed}</td>
                    <td className="p-3 text-right text-yellow-700">{row.atRisk}</td>
                    <td className="p-3 text-right text-red-700">{row.uncommitted}</td>
                    <td className="p-3 text-right">
                      <span className={`font-medium ${row.retentionRate >= 70 ? 'text-green-700' : row.retentionRate >= 40 ? 'text-yellow-700' : 'text-red-700'}`}>
                        {row.retentionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
