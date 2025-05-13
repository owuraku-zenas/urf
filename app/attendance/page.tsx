"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ClipboardList } from "lucide-react"

export default function AttendancePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState<any[]>([])
  const [selectedEventId, setSelectedEventId] = useState("")

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      // Mock event data
      setEvents([
        {
          id: "1",
          name: "Sunday Service",
          date: "2024-04-21T09:00:00Z",
          type: "SUNDAY",
          attendanceCount: 30,
          totalMembers: 32,
        },
        {
          id: "2",
          name: "Midweek Service",
          date: "2024-04-17T18:00:00Z",
          type: "MIDWEEK",
          attendanceCount: 20,
          totalMembers: 32,
        },
        {
          id: "3",
          name: "Prayer Meeting",
          date: "2024-04-12T19:00:00Z",
          type: "PRAYER",
          attendanceCount: 15,
          totalMembers: 32,
        },
        {
          id: "4",
          name: "Sunday Service",
          date: "2024-04-14T09:00:00Z",
          type: "SUNDAY",
          attendanceCount: 28,
          totalMembers: 32,
        },
        {
          id: "5",
          name: "Midweek Service",
          date: "2024-04-10T18:00:00Z",
          type: "MIDWEEK",
          attendanceCount: 18,
          totalMembers: 32,
        },
      ])
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Attendance Tracking</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Event</CardTitle>
          <CardDescription>Choose an event to mark or view attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <Select value={selectedEventId} onValueChange={handleSelectEvent}>
              <SelectTrigger className="w-full md:w-[300px]">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading events...
                  </SelectItem>
                ) : events.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No events available
                  </SelectItem>
                ) : (
                  events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.name} - {new Date(event.date).toLocaleDateString()}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button disabled={!selectedEventId} asChild>
              <Link href={selectedEventId ? `/attendance/${selectedEventId}` : "#"}>
                <ClipboardList className="mr-2 h-4 w-4" />
                Mark Attendance
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
          <CardDescription>Select an event to view or mark attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Attendance Count</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading events...
                  </TableCell>
                </TableRow>
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell className="font-medium">No events found</TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-right"></TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.name}</TableCell>
                    <TableCell>{new Date(event.date).toLocaleDateString()}</TableCell>
                    <TableCell>{formatEventType(event.type)}</TableCell>
                    <TableCell>
                      {event.attendanceCount} / {event.totalMembers}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/attendance/${event.id}`}>Mark Attendance</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
