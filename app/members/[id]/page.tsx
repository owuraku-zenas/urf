"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Member, CellGroup } from "@prisma/client"
import { use } from "react"
import { ArrowLeft, Edit, Mail, Phone, Users, Calendar, GraduationCap, BookOpen, Home, DoorOpen } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { z } from "zod"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

interface MemberWithRelations extends Member {
  cellGroup: {
    id: string
    name: string
  } | null
  invitedBy: {
    id: string
    name: string
  } | null
  invitees: Array<{
    id: string
    name: string
    email: string | null
    phone: string
    university: string | null
    program: string | null
    createdAt: Date
    cellGroup: {
      id: string
      name: string
    } | null
  }>
  attendances: Array<{
    id: string
    event: {
      id: string
      name: string
      date: Date
    }
  }>
}

interface Attendance {
  id: string
  eventId: string
  eventName: string
  date: string
  status: 'PRESENT' | 'ABSENT'
}

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [member, setMember] = useState<MemberWithRelations | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [attendance, setAttendance] = useState<Attendance[]>([])

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await fetch(`/api/members/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch member')
        }
        const data = await response.json()
        setMember(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    const fetchAttendance = async () => {
      try {
        const response = await fetch(`/api/members/${id}/attendance`)
        if (!response.ok) {
          throw new Error('Failed to fetch attendance')
        }
        const data = await response.json()
        setAttendance(data)
      } catch (error) {
        console.error('Error fetching attendance:', error)
        toast.error('Failed to load attendance data')
      }
    }

    fetchMember()
    fetchAttendance()
  }, [id])

  const filteredInvitees = member?.invitees.filter(invitee => {
    const inviteeDate = new Date(invitee.createdAt)
    return (!startDate || inviteeDate >= new Date(startDate)) &&
      (!endDate || inviteeDate <= new Date(endDate + 'T23:59:59'))
  }) || []

  const filteredAttendance = attendance.filter(record => {
    const recordDate = new Date(record.date)
    return (!startDate || recordDate >= new Date(startDate)) &&
      (!endDate || recordDate <= new Date(endDate + 'T23:59:59'))
  })

  // Prepare data for charts
  const attendanceByStatus = filteredAttendance.reduce((acc, record) => {
    if (record.status === 'PRESENT') {
      acc['PRESENT'] = (acc['PRESENT'] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  // Calculate total events and absent count
  const totalEvents = filteredAttendance.length
  const presentCount = attendanceByStatus['PRESENT'] || 0
  const absentCount = totalEvents - presentCount

  const pieChartData = [
    { name: 'Present', value: presentCount },
    { name: 'Absent', value: absentCount }
  ]

  const monthlyAttendance = filteredAttendance.reduce((acc, record) => {
    const month = new Date(record.date).toLocaleString('default', { month: 'short' })
    if (!acc[month]) {
      acc[month] = { present: 0, total: 0 }
    }
    if (record.status === 'PRESENT') {
      acc[month].present++
    }
    acc[month].total++
    return acc
  }, {} as Record<string, { present: number; total: number }>)

  const barChartData = Object.entries(monthlyAttendance).map(([month, data]) => ({
    month,
    present: data.present,
    absent: data.total - data.present
  }))

  const COLORS = ['#4CAF50', '#F44336']

  if (isLoading) {
    return (
      <div className="py-10">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we fetch the member details.</CardDescription>
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

  if (!member) {
    return (
      <div className="py-10">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Member Not Found</CardTitle>
            <CardDescription className="text-yellow-600">
              The member you're looking for doesn't exist or has been deleted.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <Button
          variant="outline"
          onClick={() => router.push('/members')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Members
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{member.name}</CardTitle>
              <CardDescription>Member Details</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/members/${member.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Member
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{member.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{member.phone || 'No phone provided'}</span>
                  </div>
                  {member.dateOfBirth && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Date of Birth: {new Date(member.dateOfBirth).toLocaleDateString()}</span>
                    </div>
                  )}
                  {member.joinDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Join Date: {new Date(member.joinDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {member.university && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-gray-500" />
                      <span>University: {member.university}</span>
                    </div>
                  )}
                  {member.program && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span>Program: {member.program}</span>
                    </div>
                  )}
                  {member.startYear && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Start Year: {member.startYear}</span>
                    </div>
                  )}
                  {member.cellGroup && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <Link
                        href={`/cell-groups/${member.cellGroup.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Cell Group: {member.cellGroup.name}
                      </Link>
                    </div>
                  )}
                  {member.invitedBy && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <Link
                        href={`/members/${member.invitedBy.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Invited by: {member.invitedBy.name}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              {(member.hostel || member.roomNumber) && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Accommodation Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {member.hostel && (
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-gray-500" />
                        <span>Hostel: {member.hostel}</span>
                      </div>
                    )}
                    {member.roomNumber && (
                      <div className="flex items-center gap-2">
                        <DoorOpen className="h-4 w-4 text-gray-500" />
                        <span>Room Number: {member.roomNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invitees Section */}
        <Card>
          <CardHeader>
            <CardTitle>Invitees</CardTitle>
            <CardDescription>Members invited by {member.name}</CardDescription>
          </CardHeader>
          <CardContent>
            {member.invitees.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cell Group</TableHead>
                    <TableHead>Join Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {member.invitees.map((invitee) => (
                    <TableRow key={invitee.id}>
                      <TableCell>
                        <Link
                          href={`/members/${invitee.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {invitee.name}
                        </Link>
                      </TableCell>
                      <TableCell>{invitee.phone}</TableCell>
                      <TableCell>{invitee.email || 'N/A'}</TableCell>
                      <TableCell>
                        {invitee.cellGroup?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {new Date(invitee.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-gray-500">No invitees yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Attendance Analytics Section */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Analytics</CardTitle>
            <CardDescription>Member attendance statistics and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Date Range Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2 w-full sm:w-auto">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full sm:w-[180px]"
                    placeholder="Start date"
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full sm:w-[180px]"
                    placeholder="End date"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      setStartDate("")
                      setEndDate("")
                    }}
                    className="w-full sm:w-auto"
                  >
                    Clear Dates
                  </Button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{presentCount}</div>
                    <p className="text-sm text-gray-500">Present</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{absentCount}</div>
                    <p className="text-sm text-gray-500">Absent</p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle>Attendance Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Attendance Trend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Attendance Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="present" name="Present" fill="#4CAF50" />
                          <Bar dataKey="absent" name="Absent" fill="#F44336" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
