"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download } from "lucide-react"

export default function MemberGrowthReportPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [reportData, setReportData] = useState<any>(null)

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      // Mock data for the report
      setReportData({
        growthData: [
          { month: "2024-01", newMembers: 5, totalMembers: 5 },
          { month: "2024-02", newMembers: 8, totalMembers: 13 },
          { month: "2024-03", newMembers: 12, totalMembers: 25 },
          { month: "2024-04", newMembers: 7, totalMembers: 32 },
        ],
        totalMembers: 32,
      })
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

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
        <Button>
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
            <CardDescription>Members added in April</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {isLoading ? "..." : reportData?.growthData[reportData.growthData.length - 1].newMembers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Rate</CardTitle>
            <CardDescription>Monthly average</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{isLoading ? "..." : "28%"}</div>
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
            <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
              <p className="text-muted-foreground">[Chart visualization would appear here]</p>
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
                  reportData.growthData.map((item: any, index: number) => {
                    const prevTotal = index > 0 ? reportData.growthData[index - 1].totalMembers : 0
                    const growthRate = prevTotal === 0 ? "N/A" : `${Math.round((item.newMembers / prevTotal) * 100)}%`

                    return (
                      <tr key={item.month} className="border-b">
                        <td className="py-3 px-4">{formatMonth(item.month)}</td>
                        <td className="py-3 px-4">{item.newMembers}</td>
                        <td className="py-3 px-4">{item.totalMembers}</td>
                        <td className="py-3 px-4">{growthRate}</td>
                      </tr>
                    )
                  })
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
