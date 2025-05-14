"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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

export default function MemberGrowthReportPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/reports/member-growth')
        if (!response.ok) {
          throw new Error('Failed to fetch report data')
        }
        const data = await response.json()
        setReportData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchReportData()
  }, [])

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
            if (!reportData?.growthData?.length) {
              alert('No data available to export')
              return
            }
            try {
              const exportData = reportData.growthData.map(month => ({
                Month: formatMonth(month.month),
                'New Members': month.newMembers,
                'Total Members': month.totalMembers,
                'Growth Rate': `${month.growthRate}%`
              }))
              exportToCSV(exportData, 'member-growth-report')
            } catch (error) {
              console.error('Export failed:', error)
              alert('Failed to export report. Please try again.')
            }
          }}
          disabled={isLoading || !reportData?.growthData?.length}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Members</CardTitle>
            <CardDescription>Current membership count</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{isLoading ? "..." : reportData?.totalMembers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New This Month</CardTitle>
            <CardDescription>Members added this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {isLoading ? "..." : reportData?.newThisMonth}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Rate</CardTitle>
            <CardDescription>Monthly average</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {isLoading ? "..." : `${reportData?.averageGrowthRate}%`}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Member Growth Over Time</CardTitle>
          <CardDescription>Monthly membership growth trends</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-80 flex items-center justify-center">
              <p>Loading chart data...</p>
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={reportData?.growthData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tickFormatter={(value) => formatMonth(value)}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    yAxisId="left"
                    label={{ value: 'Total Members', angle: -90, position: 'insideLeft' }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    label={{ value: 'New Members', angle: 90, position: 'insideRight' }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [value, name === 'totalMembers' ? 'Total Members' : 'New Members']}
                    labelFormatter={(label) => formatMonth(label)}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="totalMembers"
                    stroke="#2563eb"
                    name="Total Members"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="newMembers"
                    stroke="#16a34a"
                    name="New Members"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

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
                  <tr>
                    <td colSpan={4} className="py-3 px-4">
                      Loading data...
                    </td>
                  </tr>
                ) : (
                  reportData?.growthData.map((item) => (
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
  const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}
