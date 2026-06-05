"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface LevelData { level: string; count: number }
interface NameCount  { name: string;  count: number }

interface ReportData {
  totalMembers: number
  academicLevels: LevelData[]
  universities: NameCount[]
  programs: NameCount[]
}

const LEVEL_COLORS: Record<string, string> = {
  '100': '#93c5fd', '200': '#60a5fa', '300': '#3b82f6',
  '400': '#2563eb', '500': '#1d4ed8', '600': '#1e40af',
  'ALUMNI': '#6d28d9', 'Unknown': '#d1d5db',
}

export default function DemographicsReportPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/reports/demographics')
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

  const pct = (count: number) =>
    data ? Math.round((count / data.totalMembers) * 100) : 0

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/reports"><ArrowLeft className="mr-2 h-4 w-4" />Back to Reports</Link>
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Demographics Report</h1>
        <p className="text-muted-foreground mt-1">
          Academic levels, universities, and programmes across{" "}
          {loading ? "..." : <span className="font-medium">{data?.totalMembers} members</span>}.
        </p>
      </div>

      {/* Academic level chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Academic Level Distribution</CardTitle>
          <CardDescription>How many members are at each level</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-56 flex items-center justify-center text-muted-foreground">Loading...</div>
          ) : !data?.academicLevels.length ? (
            <div className="h-56 flex items-center justify-center text-muted-foreground">No data</div>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.academicLevels} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="level" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => [v, 'Members']} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.academicLevels.map(entry => (
                      <Cell key={entry.level} fill={LEVEL_COLORS[entry.level] ?? '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Universities + Programs side by side */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Universities</CardTitle>
            <CardDescription>Where members study</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : (data?.universities ?? []).map(({ name, count }) => (
              <div key={name} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium truncate max-w-[70%]" title={name}>{name}</span>
                  <span className="text-muted-foreground">{count} · {pct(count)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct(count)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Programmes</CardTitle>
            <CardDescription>What members are studying</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading...</p>
            ) : (data?.programs ?? []).map(({ name, count }) => (
              <div key={name} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium truncate max-w-[70%]" title={name}>{name}</span>
                  <span className="text-muted-foreground">{count} · {pct(count)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${pct(count)}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
