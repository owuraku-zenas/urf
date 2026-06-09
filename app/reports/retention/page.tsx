"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download } from "lucide-react"
import { exportToCSV } from "@/lib/utils"

interface RetentionRow {
  fromSemester: string
  toSemester: string
  committedInA: number
  retainedCommitted: number
  droppedToAtRisk: number
  droppedToUncommitted: number
  noData: number
  retentionRate: number
}

export default function RetentionReportPage() {
  const [rows, setRows] = useState<RetentionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/reports/retention')
      .then(r => { if (!r.ok) throw new Error('Failed to fetch'); return r.json() })
      .then(d => setRows(d.rows))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const avgRetention = rows.length > 0
    ? Math.round(rows.reduce((s, r) => s + r.retentionRate, 0) / rows.length)
    : 0

  const latestRate = rows[0]?.retentionRate ?? null

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/reports"><ArrowLeft className="mr-2 h-4 w-4" />Back to Reports</Link>
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Retention Report</h1>
          <p className="text-muted-foreground mt-1">
            Of members who were Committed in semester N, how many stayed Committed in semester N+1?
          </p>
        </div>
        <Button
          onClick={() => {
            if (!rows.length) return
            exportToCSV(
              rows.map(r => ({
                'From': r.fromSemester,
                'To': r.toSemester,
                'Committed in From': r.committedInA,
                'Retained Committed': r.retainedCommitted,
                'Dropped to At Risk': r.droppedToAtRisk,
                'Dropped to Uncommitted': r.droppedToUncommitted,
                'No Data in Next Sem': r.noData,
                'Retention Rate': `${r.retentionRate}%`,
              })),
              'retention-report'
            )
          }}
          disabled={loading || !rows.length}
        >
          <Download className="mr-2 h-4 w-4" />Export
        </Button>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Latest Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${
              latestRate === null ? 'text-gray-400'
              : latestRate >= 70 ? 'text-green-600'
              : latestRate >= 40 ? 'text-yellow-600'
              : 'text-red-600'
            }`}>
              {loading ? "..." : latestRate !== null ? `${latestRate}%` : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">most recent semester transition</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : rows.length ? `${avgRetention}%` : "—"}</div>
            <p className="text-xs text-muted-foreground mt-1">across all semester transitions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transitions Tracked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{loading ? "..." : rows.length}</div>
            <p className="text-xs text-muted-foreground mt-1">consecutive semester pairs</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Semester-over-Semester Retention</CardTitle>
          <CardDescription>Latest transitions first</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left font-medium p-3">From</th>
                  <th className="text-left font-medium p-3">To</th>
                  <th className="text-right font-medium p-3 hidden sm:table-cell">Committed in From</th>
                  <th className="text-right font-medium p-3 text-green-700 hidden sm:table-cell">Retained</th>
                  <th className="text-right font-medium p-3 text-yellow-700 hidden md:table-cell">→ At Risk</th>
                  <th className="text-right font-medium p-3 text-red-700 hidden md:table-cell">→ Uncommitted</th>
                  <th className="text-right font-medium p-3 text-gray-500 hidden md:table-cell">No Data</th>
                  <th className="text-right font-medium p-3">Rate</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">Loading...</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">Need at least two semesters with commitment data.</td></tr>
                ) : rows.map((row, i) => (
                  <tr key={i} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{row.fromSemester}</td>
                    <td className="p-3 text-muted-foreground">{row.toSemester}</td>
                    <td className="p-3 text-right hidden sm:table-cell">{row.committedInA}</td>
                    <td className="p-3 text-right text-green-700 font-medium hidden sm:table-cell">{row.retainedCommitted}</td>
                    <td className="p-3 text-right text-yellow-700 hidden md:table-cell">{row.droppedToAtRisk}</td>
                    <td className="p-3 text-right text-red-700 hidden md:table-cell">{row.droppedToUncommitted}</td>
                    <td className="p-3 text-right text-gray-400 hidden md:table-cell">{row.noData}</td>
                    <td className="p-3 text-right">
                      <span className={`font-bold ${
                        row.retentionRate >= 70 ? 'text-green-600'
                        : row.retentionRate >= 40 ? 'text-yellow-600'
                        : 'text-red-600'
                      }`}>
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
