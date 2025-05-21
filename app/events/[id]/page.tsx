"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download } from "lucide-react"
import { generateEventAttendancePDF } from "@/lib/pdf-utils"
import { EventType, Attendance, Member, CellGroup } from "@prisma/client"

interface Event {
  id: string
  name: string
  type: EventType
  date: Date
  description: string | null
  createdAt: Date
  updatedAt: Date
  attendances: (Attendance & {
    member: Member & {
      cellGroup: CellGroup
    }
  })[]
}

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch event')
        }
        const data = await response.json()
        setEvent(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvent()
  }, [id])

  const handleExportAttendance = () => {
    if (!event) return

    // Map attendances to ensure all member fields are strings
    const mappedEvent = {
      ...event,
      attendances: event.attendances.map(attendance => ({
        ...attendance,
        member: {
          ...attendance.member,
          email: attendance.member?.email || '',
          dateOfBirth: attendance.member?.dateOfBirth ? new Date(attendance.member.dateOfBirth).toISOString() : '',
          university: attendance.member?.university || '',
          program: attendance.member?.program || '',
          startYear: attendance.member?.startYear || '',
          hostel: attendance.member?.hostel || '',
          roomNumber: attendance.member?.roomNumber || '',
          createdAt: attendance.member?.createdAt ? new Date(attendance.member.createdAt).toISOString() : '',
          updatedAt: attendance.member?.updatedAt ? new Date(attendance.member.updatedAt).toISOString() : '',
        }
      }))
    }

    generateEventAttendancePDF(mappedEvent, {
      title: 'Event Attendance Report',
      subtitle: `Generated on ${new Date().toLocaleDateString()}`,
      filename: `event-${event.name}-attendance-report`
    })
  }

  if (isLoading) {
    return (
      <div className="py-10">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we fetch the event details.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-10">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="py-10">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Event Not Found</CardTitle>
            <CardDescription className="text-yellow-600">
              The event you're looking for doesn't exist or has been deleted.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{event.name}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/events/${event.id}/edit`)}>
            Edit Event
          </Button>
          <Button onClick={() => router.push(`/attendance/${event.id}`)}>
            Mark Attendance
          </Button>
          <Button onClick={handleExportAttendance}>
            <Download className="mr-2 h-4 w-4" />
            Export Attendance (PDF)
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date(event.date).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {event.type}
              </dd>
            </div>
            {event.description && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{event.description}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <CardDescription>
            {event.attendances.length} members present
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Cell Group</TableHead>
                <TableHead>Marked At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {event.attendances.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No attendance records yet
                  </TableCell>
                </TableRow>
              ) : (
                event.attendances.map((attendance) => (
                  <TableRow key={attendance.id}>
                    <TableCell className="font-medium">
                      {attendance.member?.name || 'N/A'}
                    </TableCell>
                    <TableCell>{attendance.member?.phone || 'N/A'}</TableCell>
                    <TableCell>
                      {attendance.member?.cellGroup?.name || 'No Cell Group'}
                    </TableCell>
                    <TableCell>
                      {attendance.createdAt ? new Date(attendance.createdAt).toLocaleString() : 'N/A'}
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