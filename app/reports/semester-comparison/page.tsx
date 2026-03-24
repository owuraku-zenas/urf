"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { exportToCSV } from "@/lib/utils"

interface SemesterData {
  semesterId: string
  name: string
  membersJoined: number
  avgAttendance: number
  committed: number
  uncommitted: number
  atRisk: number
}

export default function SemesterComparisonReportPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [reportData, setReportData] = useState<SemesterData[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/reports/semester-comparison')
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Semester Comparison</h1>
          <p className="text-muted-foreground mt-2">Compare growth, attendance, and commitment across semesters.</p>
        </div>
        <Button 
          onClick={() => {
            if (!reportData.length) {
              alert('No data available to export')
              return
            }
            try {
              const exportData = reportData.map(sem => ({
                Semester: sem.name,
                'New Members Joined': sem.membersJoined,
                'Average Attendance': sem.avgAttendance,
                'Committed': sem.committed,
                'At Risk': sem.atRisk,
                'Uncommitted': sem.uncommitted
              }))
              exportToCSV(exportData, 'semester-comparison-report')
            } catch (error) {
              console.error('Export failed:', error)
              alert('Failed to export report. Please try again.')
            }
          }}
          disabled={isLoading || !reportData.length}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance & Growth</CardTitle>
            <CardDescription>Comparing average attendance vs new members joined</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <p>Loading chart data...</p>
              </div>
            ) : reportData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center border-dashed border-2 rounded-md">
                <p className="text-muted-foreground">No semestral data available yet.</p>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="avgAttendance" name="Avg Attendance" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="membersJoined" name="New Members" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Member Commitment</CardTitle>
            <CardDescription>Status distribution across semesters</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <p>Loading chart data...</p>
              </div>
            ) : reportData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center border-dashed border-2 rounded-md">
                <p className="text-muted-foreground">No semestral data available yet.</p>
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="committed" stackId="a" name="Committed" fill="#10b981" />
                    <Bar dataKey="atRisk" stackId="a" name="At Risk" fill="#f59e0b" />
                    <Bar dataKey="uncommitted" stackId="a" name="Uncommitted" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semester Breakdown</CardTitle>
          <CardDescription>Detailed statistics per semester</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left font-medium p-4">Semester</th>
                  <th className="text-right font-medium p-4">New Members</th>
                  <th className="text-right font-medium p-4">Avg Attendance</th>
                  <th className="text-right font-medium p-4">Committed</th>
                  <th className="text-right font-medium p-4 text-orange-600">At Risk</th>
                  <th className="text-right font-medium p-4 text-red-600">Uncommitted</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      Loading data...
                    </td>
                  </tr>
                ) : reportData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      No semesters found
                    </td>
                  </tr>
                ) : (
                  reportData.map((sem) => (
                    <tr key={sem.semesterId} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 font-medium">{sem.name}</td>
                      <td className="p-4 text-right">{sem.membersJoined}</td>
                      <td className="p-4 text-right">{sem.avgAttendance}</td>
                      <td className="p-4 text-right">{sem.committed}</td>
                      <td className="p-4 text-right text-orange-600 font-medium">{sem.atRisk}</td>
                      <td className="p-4 text-right text-red-600 font-medium">{sem.uncommitted}</td>
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
