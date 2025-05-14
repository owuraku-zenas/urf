"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

interface Member {
  id: string
  name: string
  phone: string
  cellGroup: CellGroup
}

interface AttendanceRecord {
  id: string
  memberId: string
  isPresent: boolean
}

export default function MarkAttendancePage({ params }: { params: Promise<{ id: string }> }) {
  const [event, setEvent] = useState<Event | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCellGroup, setSelectedCellGroup] = useState<string>("all")
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const { id } = await params
        const [eventResponse, membersResponse, existingAttendanceResponse] = await Promise.all([
          fetch(`/api/events/${id}`),
          fetch('/api/members'),
          fetch(`/api/events/${id}/attendance`)
        ])

        if (!eventResponse.ok || !membersResponse.ok || !existingAttendanceResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const [eventData, membersData, existingAttendanceData] = await Promise.all([
          eventResponse.json(),
          membersResponse.json(),
          existingAttendanceResponse.json()
        ])

        setEvent(eventData)
        setMembers(membersData)
        
        // Initialize attendance records based on existing records
        const initialRecords = membersData.map((member: Member) => {
          const existingRecord = existingAttendanceData.find(
            (record: any) => record.member.id === member.id
          )
          return {
            id: existingRecord?.id || '',
            memberId: member.id,
            isPresent: !!existingRecord
          }
        })
        setAttendanceRecords(initialRecords)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params])

  const handleStatusChange = (memberId: string, isPresent: boolean) => {
    setAttendanceRecords(prev =>
      prev.map(record =>
        record.memberId === memberId
          ? { ...record, isPresent }
          : record
      )
    )
  }

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      const { id } = await params
      // Only send present members
      const presentMembers = attendanceRecords
        .filter(record => record.isPresent)
        .map(record => ({
          memberId: record.memberId
        }))

      const response = await fetch('/api/attendance/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: id,
          attendances: presentMembers
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save attendance')
      }

      router.push('/attendance')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSaving(false)
    }
  }

  // Get unique cell groups
  const cellGroups = Array.from(new Set(members.map(member => member.cellGroup.id)))
    .map(id => members.find(member => member.cellGroup.id === id)?.cellGroup)
    .filter((group): group is CellGroup => group !== undefined)

  // Filter members based on search query and selected cell group
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.phone.includes(searchQuery)
    const matchesCellGroup = selectedCellGroup === "all" || member.cellGroup.id === selectedCellGroup
    return matchesSearch && matchesCellGroup
  })

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

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto py-10">
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Mark Attendance</h1>
        <Button onClick={handleSubmit} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Attendance'}
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{event.name}</CardTitle>
          <CardDescription>
            {new Date(event.date).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            Mark present members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={selectedCellGroup}
              onValueChange={setSelectedCellGroup}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select cell group" />
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Cell Group</TableHead>
                <TableHead>Present</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No members found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMembers.map((member) => {
                  const record = attendanceRecords.find(r => r.memberId === member.id)
                  return (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.name}
                      </TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell>{member.cellGroup.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`present-${member.id}`}
                            checked={record?.isPresent || false}
                            onCheckedChange={(checked) => {
                              handleStatusChange(member.id, checked as boolean)
                            }}
                          />
                          <label
                            htmlFor={`present-${member.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Present
                          </label>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 