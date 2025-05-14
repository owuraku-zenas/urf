"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { ClipboardList } from "lucide-react"

interface Event {
  id: string
  name: string
  date: string
  type: 'MIDWEEK' | 'SUNDAY' | 'PRAYER' | 'SPECIAL'
}

interface CellGroup {
  id: string
  name: string
}

interface AttendanceRecord {
  id: string
  eventId: string
  member: {
    id: string
    name: string
    phone: string
    cellGroup: CellGroup
  }
  createdAt: string
}

export default function AttendancePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [selectedEventId, setSelectedEventId] = useState("")
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCellGroup, setSelectedCellGroup] = useState<string>("all")
  const [error, setError] = useState<string | null>(null)

  // Fetch events only once when component mounts
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/events')
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }
        const data = await response.json()
        setEvents(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  // Fetch attendance records when selected event changes
  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      if (!selectedEventId) {
        setAttendanceRecords([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/events/${selectedEventId}/attendance`)
        if (!response.ok) {
          throw new Error('Failed to fetch attendance records')
        }
        const data = await response.json()
        // Ensure uniqueness
        const uniqueRecords = data.reduce((acc: AttendanceRecord[], record: AttendanceRecord) => {
          const existingRecord = acc.find(r => r.member.id === record.member.id)
          if (!existingRecord) {
            acc.push({
              ...record,
              eventId: selectedEventId
            })
          }
          return acc
        }, [])
        setAttendanceRecords(uniqueRecords)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAttendanceRecords()
  }, [selectedEventId])

  const handleSelectEvent = (eventId: string) => {
    setSelectedEventId(eventId)
    setSearchQuery("")
    setSelectedCellGroup("all")
  }

  // Get unique cell groups from attendance records for the selected event
  const cellGroups = Array.from(
    new Set(
      attendanceRecords
        .filter(record => record.eventId === selectedEventId && record.member?.cellGroup?.id)
        .map(record => record.member.cellGroup.id)
    )
  )
    .map(id => attendanceRecords.find(record => record.member?.cellGroup?.id === id)?.member.cellGroup)
    .filter((group): group is CellGroup => group !== undefined)

  // Filter records for the selected event only and ensure uniqueness
  const filteredRecords = attendanceRecords
    .filter(record => record.eventId === selectedEventId)
    .filter((record, index, self) => 
      index === self.findIndex(r => r.member.id === record.member.id)
    )
    .filter(record => {
      const fullName = record.member?.name?.toLowerCase() || ''
      const phoneNumber = record.member?.phone?.toLowerCase() || ''
      const query = searchQuery.toLowerCase()
      const matchesSearch = fullName.includes(query) || phoneNumber.includes(query)
      const matchesCellGroup = selectedCellGroup === "all" || record.member?.cellGroup?.id === selectedCellGroup
      return matchesSearch && matchesCellGroup
    })

  const selectedEvent = events.find(e => e.id === selectedEventId)

  if (error) {
    return (
      <main className="flex-1">
        <div className="w-full max-w-7xl mx-auto px-5 py-10">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Error</CardTitle>
              <CardDescription className="text-red-600">{error}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1">
      <div className="w-full max-w-7xl mx-auto px-5 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Attendance Tracking</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Event</CardTitle>
            <CardDescription>Choose an event to view attendance records</CardDescription>
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
              <Button disabled={!selectedEventId} asChild className="w-full md:w-auto">
                <Link href={selectedEventId ? `/attendance/${selectedEventId}` : "#"}>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Mark Attendance
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {selectedEventId && selectedEvent && (
          <Card>
            <CardHeader>
              <CardTitle>Present Members</CardTitle>
              <CardDescription>
                {selectedEvent.name} - {new Date(selectedEvent.date).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0 mb-4">
                <Input
                  placeholder="Search by name or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:max-w-sm"
                />
                <Select value={selectedCellGroup} onValueChange={setSelectedCellGroup}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by cell group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cell Groups</SelectItem>
                    {cellGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="hidden sm:table-cell">Cell Group</TableHead>
                      <TableHead className="hidden sm:table-cell">Time Marked</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          Loading attendance records...
                        </TableCell>
                      </TableRow>
                    ) : filteredRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No attendance records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">{record.member.name}</TableCell>
                          <TableCell>{record.member.phone}</TableCell>
                          <TableCell className="hidden sm:table-cell">{record.member.cellGroup?.name || 'No Cell Group'}</TableCell>
                          <TableCell className="hidden sm:table-cell">{new Date(record.createdAt).toLocaleTimeString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
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
