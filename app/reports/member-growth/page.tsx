"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Download } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { exportToCSV } from "@/lib/utils"

interface GrowthData {
  month: string
  newMembers: number
  totalMembers: number
  growthRate: number
}

interface ReportData {
  growthData: GrowthData[]
  totalMembers: number
  newThisMonth: number
  averageGrowthRate: number
}

interface Semester {
  id: string
  name: string
  startDate: string | null
  endDate: string | null
}

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: currentYear - 2009 }, (_, i) => String(currentYear - i))

export default function MemberGrowthReportPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [selectedYear, setSelectedYear] = useState("all")
  const [selectedSemester, setSelectedSemester] = useState("all")

  useEffect(() => {
    fetch('/api/semesters')
      .then(r => r.json())
      .then(setSemesters)
      .catch(() => {})
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedSemester !== 'all') params.set('semesterId', selectedSemester)
    else if (selectedYear !== 'all') params.set('year', selectedYear)

    setIsLoading(true)
    fetch(`/api/reports/member-growth?${params}`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch report data')
        return r.json()
      })
      .then(setReportData)
      .catch(err => setError(err instanceof Error ? err.message : 'An error occurred'))
      .finally(() => setIsLoading(false))
  }, [selectedYear, selectedSemester])

  const handleYearChange = (val: string) => {
    setSelectedYear(val)
    setSelectedSemester('all')
  }

  const handleSemesterChange = (val: string) => {
    setSelectedSemester(val)
    setSelectedYear('all')
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Chart needs chronological order; table shows latest first
  const chartData = reportData?.growthData ?? []
  const tableData = [...chartData].reverse()

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reports
          </Link>
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Member Growth Report</h1>
        <Button
          onClick={() => {
            if (!tableData.length) return
            exportToCSV(
              tableData.map(m => ({
                Month: formatMonth(m.month),
                'New Members': m.newMembers,
                'Total Members': m.totalMembers,
                'Growth Rate': `${m.growthRate}%`,
              })),
              'member-growth-report'
            )
          }}
          disabled={isLoading || !tableData.length}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Year</span>
          <Select value={selectedYear} onValueChange={handleYearChange}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="All Years" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {YEARS.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Semester</span>
          <Select value={selectedSemester} onValueChange={handleSemesterChange}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Semesters" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {semesters.filter(s => s.startDate).map(s => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Members</CardTitle>
            <CardDescription>
              {selectedSemester !== 'all'
                ? 'Joined in selected semester'
                : selectedYear !== 'all'
                  ? `Joined in ${selectedYear}`
                  : 'All time'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{isLoading ? "..." : reportData?.totalMembers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New This Month</CardTitle>
            <CardDescription>Members who joined this calendar month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{isLoading ? "..." : reportData?.newThisMonth}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avg Growth Rate</CardTitle>
            <CardDescription>Monthly average</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{isLoading ? "..." : `${reportData?.averageGrowthRate}%`}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Member Growth Over Time</CardTitle>
          <CardDescription>Monthly membership growth trends</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center text-muted-foreground">Loading chart data...</div>
          ) : chartData.length === 0 ? (
            <div className="h-80 flex items-center justify-center text-muted-foreground">No data for the selected filter</div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickFormatter={formatMonth} tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" label={{ value: 'Total Members', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: 'New Members', angle: 90, position: 'insideRight' }} />
                  <Tooltip
                    formatter={(value: number, name: string) => [value, name === 'totalMembers' ? 'Total Members' : 'New Members']}
                    labelFormatter={formatMonth}
                  />
                  <Line yAxisId="left" type="monotone" dataKey="totalMembers" stroke="#2563eb" name="Total Members" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="newMembers" stroke="#16a34a" name="New Members" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table — latest first */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Growth Data</CardTitle>
          <CardDescription>Monthly breakdown of new members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Month</th>
                  <th className="text-left py-3 px-4">New Members</th>
                  <th className="text-left py-3 px-4">Total Members</th>
                  <th className="text-left py-3 px-4">Growth Rate</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="py-3 px-4 text-muted-foreground">Loading data...</td></tr>
                ) : tableData.length === 0 ? (
                  <tr><td colSpan={4} className="py-3 px-4 text-muted-foreground">No data for the selected filter</td></tr>
                ) : (
                  tableData.map(item => (
                    <tr key={item.month} className="border-b">
                      <td className="py-3 px-4">{formatMonth(item.month)}</td>
                      <td className="py-3 px-4">{item.newMembers}</td>
                      <td className="py-3 px-4">{item.totalMembers}</td>
                      <td className="py-3 px-4">{item.growthRate}%</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function formatMonth(monthStr: string) {
  const [year, month] = monthStr.split("-")
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })
}
