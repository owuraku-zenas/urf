"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { ArrowLeft } from "lucide-react"

interface Member {
  id: string
  name: string
  email: string | null
  phone: string
  dateOfBirth: string | null
  university: string | null
  program: string | null
  startYear: string | null
  hostel: string | null
  roomNumber: string | null
  cellGroup?: {
    id: string
    name: string
  }
  invitedBy?: {
    id: string
    name: string
  }
  invitees: Array<{
    id: string
    name: string
    phone: string
    university: string
    program: string
    cellGroup?: {
      id: string
      name: string
    }
    createdAt: string
  }>
  attendances: {
    id: string
    event: {
      id: string
      name: string
      date: string
    }
  }[]
}

interface CellGroup {
  id: string
  name: string
}

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [isLoading, setIsLoading] = useState(true)
  const [member, setMember] = useState<Member | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    university: "",
    program: "",
    startYear: "",
    hostel: "",
    roomNumber: "",
    cellGroupId: "",
    invitedById: "",
  })
  const [attendanceStats, setAttendanceStats] = useState({
    attendanceCount: 0,
    totalEvents: 0,
    attendanceRate: 0,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCellGroup, setSelectedCellGroup] = useState("all")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [memberResponse, cellGroupsResponse, membersResponse] = await Promise.all([
          fetch(`/api/members/${id}`),
          fetch("/api/cell-groups"),
          fetch("/api/members"),
        ])

        if (!memberResponse.ok) {
          if (memberResponse.status === 404) {
            notFound()
          }
          throw new Error("Failed to fetch member")
        }

        const memberData = await memberResponse.json()
        const cellGroupsData = await cellGroupsResponse.json()
        const membersData = await membersResponse.json()

        setMember(memberData)
        setCellGroups(cellGroupsData)
        setMembers(membersData)
        setFormData({
          name: memberData.name,
          email: memberData.email || "",
          phone: memberData.phone,
          dateOfBirth: memberData.dateOfBirth ? new Date(memberData.dateOfBirth).toISOString().split("T")[0] : "",
          university: memberData.university || "",
          program: memberData.program || "",
          startYear: memberData.startYear || "",
          hostel: memberData.hostel || "",
          roomNumber: memberData.roomNumber || "",
          cellGroupId: memberData.cellGroupId || "",
          invitedById: memberData.invitedById || "",
        })

        // Calculate attendance stats
        const totalEvents = 20 // This should come from the API in the future
        const attendanceCount = memberData.attendances.length
        const attendanceRate = Math.round((attendanceCount / totalEvents) * 100)

        setAttendanceStats({
          attendanceCount,
          totalEvents,
          attendanceRate,
        })
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Format the date to ISO string if it exists
      const formattedData = {
        ...formData,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null,
        // Convert empty strings to null for optional fields
        email: formData.email || null,
        university: formData.university || null,
        program: formData.program || null,
        startYear: formData.startYear || null,
        hostel: formData.hostel || null,
        roomNumber: formData.roomNumber || null,
        cellGroupId: formData.cellGroupId || null,
        invitedById: formData.invitedById || null,
      }

      const response = await fetch(`/api/members/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      })

      if (!response.ok) {
        throw new Error("Failed to update member")
      }

      const updatedMember = await response.json()
      setMember(updatedMember)
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Member updated successfully",
      })
    } catch (error) {
      console.error("Error updating member:", error)
      toast({
        title: "Error",
        description: "Failed to update member. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const filteredInvitees = member?.invitees.filter(invitee => {
    const matchesSearch = invitee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invitee.phone.includes(searchQuery) ||
                         invitee.university?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCellGroup = selectedCellGroup === "all" || invitee.cellGroup?.id === selectedCellGroup
    return matchesSearch && matchesCellGroup
  }) || []

  if (isLoading) {
    return (
      <div className="py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  if (!member) {
    notFound()
  }

  return (
    <div className="py-10">
      <div className="mb-6 flex justify-between items-center">
        <Link
          href="/members"
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
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
          Back to Members
        </Link>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          {isEditing ? "Cancel" : "Edit Member"}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="md:col-span-2">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
                <h2 className="text-2xl font-bold mb-6">Edit Member</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="university" className="block text-sm font-medium text-gray-700">
                      University
                    </label>
                    <input
                      type="text"
                      id="university"
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="program" className="block text-sm font-medium text-gray-700">
                      Program
                    </label>
                    <input
                      type="text"
                      id="program"
                      name="program"
                      value={formData.program}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="startYear" className="block text-sm font-medium text-gray-700">
                      Start Year
                    </label>
                    <input
                      type="text"
                      id="startYear"
                      name="startYear"
                      value={formData.startYear}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="hostel" className="block text-sm font-medium text-gray-700">
                      Hostel
                    </label>
                    <input
                      type="text"
                      id="hostel"
                      name="hostel"
                      value={formData.hostel}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700">
                      Room Number
                    </label>
                    <input
                      type="text"
                      id="roomNumber"
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="cellGroupId" className="block text-sm font-medium text-gray-700">
                      Cell Group
                    </label>
                    <select
                      id="cellGroupId"
                      name="cellGroupId"
                      value={formData.cellGroupId}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select a cell group</option>
                      {cellGroups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="invitedById" className="block text-sm font-medium text-gray-700">
                      Invited By
                    </label>
                    <select
                      id="invitedById"
                      name="invitedById"
                      value={formData.invitedById}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">Select a member</option>
                      {members
                        .filter((m) => m.id !== id)
                        .map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
              <h2 className="text-2xl font-bold mb-6">Member Details</h2>
              <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{member.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{member.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{member.email || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : "N/A"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">University</dt>
                  <dd className="mt-1 text-sm text-gray-900">{member.university || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Program</dt>
                  <dd className="mt-1 text-sm text-gray-900">{member.program || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Start Year</dt>
                  <dd className="mt-1 text-sm text-gray-900">{member.startYear || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Hostel</dt>
                  <dd className="mt-1 text-sm text-gray-900">{member.hostel || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Room Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{member.roomNumber || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Cell Group</dt>
                  <dd className="mt-1 text-sm text-gray-900">{member.cellGroup?.name || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Invited By</dt>
                  <dd className="mt-1 text-sm text-gray-900">{member.invitedBy?.name || "N/A"}</dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4">Attendance Statistics</h3>
            <dl className="grid grid-cols-1 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Total Events Attended</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">
                  {attendanceStats.attendanceCount}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Attendance Rate</dt>
                <dd className="mt-1 text-2xl font-semibold text-gray-900">
                  {attendanceStats.attendanceRate}%
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-6">
            <h3 className="text-lg font-medium mb-4">Recent Attendance</h3>
            {member.attendances.length === 0 ? (
              <p className="text-sm text-gray-500">No attendance records yet</p>
            ) : (
              <ul className="space-y-4">
                {member.attendances.map((attendance) => (
                  <li key={attendance.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{attendance.event.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(attendance.event.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      href={`/events/${attendance.event.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invited Members</CardTitle>
          <CardDescription>
            {member.invitees.length} total invited members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search by name, phone, or university..."
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
                <TableHead>University</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Cell Group</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvitees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No invited members found
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvitees.map((invitee) => (
                  <TableRow key={invitee.id}>
                    <TableCell className="font-medium">
                      {invitee.name}
                    </TableCell>
                    <TableCell>{invitee.phone}</TableCell>
                    <TableCell>{invitee.university}</TableCell>
                    <TableCell>{invitee.program}</TableCell>
                    <TableCell>{invitee.cellGroup?.name || 'No Cell Group'}</TableCell>
                    <TableCell>
                      {format(new Date(invitee.createdAt), 'PPP')}
                    </TableCell>
                    <TableCell>
                      <Link href={`/members/${invitee.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
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
