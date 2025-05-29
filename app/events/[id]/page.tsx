"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Trash2 } from "lucide-react"
import { generateEventAttendancePDF } from "@/lib/pdf-utils"
import { EventType, Attendance, Member, CellGroup } from "@prisma/client"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Event {
  id: string
  name: string
  type: EventType
  date: Date
  description: string | null
  preparations: string | null
  feedback: string | null
  createdAt: Date
  updatedAt: Date
  attendance: (Attendance & {
    member: Member & {
      cellGroup: CellGroup
    }
  })[]
}

export default function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'
  const [event, setEvent] = useState<Event | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

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

  const handleDelete = async () => {
    if (!event) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete event')
      }

      toast({
        title: "Success",
        description: "Event has been deleted successfully",
      })

      router.push('/events')
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete event",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExportAttendance = () => {
    if (!event) return

    // Map attendances to ensure all member fields are strings
    const mappedEvent = {
      ...event,
      attendance: event.attendance.map(attendance => ({
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
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => router.push('/events')}
          className="inline-flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-4 w-4"
          >
            <path d="m12 19-7-7 7-7"></path>
            <path d="M19 12H5"></path>
          </svg>
          Back to Events
        </Button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{event.name}</h1>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <Button variant="outline" onClick={() => router.push(`/events/${event.id}/edit`)}>
                Edit Event
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={isDeleting}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? "Deleting..." : "Delete Event"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the event
                      and all associated attendance records.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          <Button onClick={() => router.push(`/attendance/${event.id}`)}>
            Mark Attendance
          </Button>
          <Button onClick={handleExportAttendance}>
            <Download className="mr-2 h-4 w-4" />
            Export Attendance (PDF)
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{event.name}</CardTitle>
            <CardDescription>
              {event.type.replace(/_/g, ' ')} • {new Date(event.date).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {event.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{event.description}</p>
                </div>
              )}
              
              {event.preparations && (
                <div>
                  <h3 className="font-semibold mb-2">Preparations/Plans</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{event.preparations}</p>
                </div>
              )}
              
              {event.feedback && (
                <div>
                  <h3 className="font-semibold mb-2">Feedback/Remarks</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{event.feedback}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
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
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>
              {event.attendance.length} members present
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Cell Group</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {event.attendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.member.name}</TableCell>
                    <TableCell>{record.member.cellGroup?.name || 'N/A'}</TableCell>
                    <TableCell>{record.member.phone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 