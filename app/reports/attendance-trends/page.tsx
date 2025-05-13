"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AttendanceTrendsReportPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [reportData, setReportData] = useState<any>(null)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      // Mock data for the report
      setReportData({
        events: [
          {
            id: "1",
            name: "Sunday Service",
            type: "SUNDAY",
            date: "2024-04-07T09:00:00Z",
            attendanceCount: 25,
            attendancePercentage: 78,
          },
          {
            id: "2",
            name: "Midweek Service",
            type: "MIDWEEK",
            date: "2024-04-10T18:00:00Z",
            attendanceCount: 18,
            attendancePercentage: 56,
          },
          {
            id: "3",
            name: "Prayer Meeting",
            type: "PRAYER",
            date: "2024-04-12T19:00:00Z",
            attendanceCount: 15,
            attendancePercentage: 47,
          },
          {
            id: "4",
            name: "Sunday Service",
            type: "SUNDAY",
            date: "2024-04-14T09:00:00Z",
            attendanceCount: 28,
            attendancePercentage: 88,
          },
          {
            id: "5",
            name: "Midweek Service",
            type: "MIDWEEK",
            date: "2024-04-17T18:00:00Z",
            attendanceCount: 20,
            attendancePercentage: 63,
          },
          {
            id: "6",
            name: "Sunday Service",
            type: "SUNDAY",
            date: "2024-04-21T09:00:00Z",
            attendanceCount: 30,
            attendancePercentage: 94,
          },
        ],
        totalMembers: 32,
        averageAttendance: {
          overall: 71,
          sunday: 87,
          midweek: 60,
          prayer: 47,
        },
      })
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const filteredEvents =
    reportData?.events.filter((event: any) => {
      if (filter === "all") return true
      return event.type === filter
    }) || []

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
        <Button>
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
            <div className="h-80 flex items-center justify-center bg-muted/20 rounded-md">
              <p className="text-muted-foreground">[Chart visualization would appear here]</p>
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
                  filteredEvents.map((event: any) => (
                    <tr key={event.id} className="border-b">
                      <td className="py-3 px-4">{new Date(event.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4">{event.name}</td>
                      <td className="py-3 px-4">{formatEventType(event.type)}</td>
                      <td className="py-3 px-4">
                        {event.attendanceCount} / {reportData.totalMembers}
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
