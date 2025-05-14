"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { exportToCSV } from "@/lib/utils"

interface EventStats {
  id: string
  name: string
  type: string
  date: string
  attendanceCount: number
  attendancePercentage: number
}

interface ReportData {
  events: EventStats[]
  totalMembers: number
  averageAttendance: {
    overall: number
    sunday: number
    midweek: number
    prayer: number
  }
}

export default function AttendanceTrendsReportPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/reports/attendance-trends')
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

  const filteredEvents = reportData?.events.filter((event) => {
    if (filter === "all") return true
    return event.type === filter
  }) || []

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
        <h1 className="text-3xl font-bold">Attendance Trends Report</h1>
        <Button 
          onClick={() => {
            if (!reportData?.events?.length) {
              alert('No data available to export')
              return
            }
            try {
              const exportData = reportData.events.map(event => ({
                Date: new Date(event.date).toLocaleDateString(),
                Event: event.name,
                Type: formatEventType(event.type),
                'Attendance Count': event.attendanceCount,
                'Total Members': reportData.totalMembers,
                'Attendance Percentage': `${event.attendancePercentage}%`
              }))
              exportToCSV(exportData, 'attendance-trends-report')
            } catch (error) {
              console.error('Export failed:', error)
              alert('Failed to export report. Please try again.')
            }
          }}
          disabled={isLoading || !reportData?.events?.length}
        >
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Overall Attendance</CardTitle>
            <CardDescription>Average across all events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{isLoading ? "..." : `${reportData?.averageAttendance.overall}%`}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sunday Services</CardTitle>
            <CardDescription>Average attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{isLoading ? "..." : `${reportData?.averageAttendance.sunday}%`}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Midweek Services</CardTitle>
            <CardDescription>Average attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{isLoading ? "..." : `${reportData?.averageAttendance.midweek}%`}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prayer Meetings</CardTitle>
            <CardDescription>Average attendance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{isLoading ? "..." : `${reportData?.averageAttendance.prayer}%`}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Attendance Trends</CardTitle>
          <CardDescription>Attendance percentage over time</CardDescription>
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
                  data={reportData?.events}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    label={{ value: 'Attendance %', angle: -90, position: 'insideLeft' }}
                    domain={[0, 100]}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value}%`, 'Attendance']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="attendancePercentage"
                    stroke="#2563eb"
                    name="Attendance"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Event Attendance</CardTitle>
            <CardDescription>Detailed attendance by event</CardDescription>
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="SUNDAY">Sunday Services</SelectItem>
              <SelectItem value="MIDWEEK">Midweek Services</SelectItem>
              <SelectItem value="PRAYER">Prayer Meetings</SelectItem>
              <SelectItem value="SPECIAL">Special Events</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Event</th>
                  <th className="text-left py-3 px-4">Type</th>
                  <th className="text-left py-3 px-4">Attendance</th>
                  <th className="text-left py-3 px-4">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-3 px-4">
                      Loading data...
                    </td>
                  </tr>
                ) : filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-3 px-4">
                      No events found
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((event) => (
                    <tr key={event.id} className="border-b">
                      <td className="py-3 px-4">{new Date(event.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{event.name}</td>
                      <td className="py-3 px-4">{formatEventType(event.type)}</td>
                      <td className="py-3 px-4">
                        {event.attendanceCount} / {reportData?.totalMembers}
                      </td>
                      <td className="py-3 px-4">{event.attendancePercentage}%</td>
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

function formatEventType(type: string) {
  const types = {
    MIDWEEK: "Midweek Service",
    SUNDAY: "Sunday Service",
    PRAYER: "Prayer Service",
    SPECIAL: "Special Program",
  }
  return types[type as keyof typeof types] || type
}
