"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Eye, Download } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { generateMemberListPDF } from "@/lib/pdf-utils"

interface Member {
  id: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  university: string
  program: string
  startYear: string
  hostel: string
  roomNumber: string
  cellGroup?: {
    id: string
    name: string
    description?: string | null
  }
  invitedBy?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
  cellGroupId: string | null
  invitedById: string | null
  isActive: boolean
}

interface CellGroup {
  id: string
  name: string
  description: string | null
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCellGroup, setSelectedCellGroup] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, cellGroupsRes] = await Promise.all([
          fetch('/api/members'),
          fetch('/api/cell-groups')
        ])

        if (!membersRes.ok || !cellGroupsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const [membersData, cellGroupsData] = await Promise.all([
          membersRes.json(),
          cellGroupsRes.json()
        ])

        setMembers(membersData)
        setCellGroups(cellGroupsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCellGroup = selectedCellGroup === 'all' || member.cellGroupId === selectedCellGroup
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' && member.isActive) ||
      (selectedStatus === 'inactive' && !member.isActive)
    
    // Date range filtering
    const memberDate = new Date(member.createdAt)
    const matchesDateRange = (!startDate || memberDate >= new Date(startDate)) &&
      (!endDate || memberDate <= new Date(endDate + 'T23:59:59'))

    return matchesSearch && matchesCellGroup && matchesStatus && matchesDateRange
  })

  const handleExportPDF = () => {
    generateMemberListPDF(
      filteredMembers.map(member => ({
        ...member,
        cellGroup: member.cellGroup || null,
        joinDate: member.createdAt,
        status: member.isActive ? "Active" : "Inactive", // Add status here
      })),
      {
        title: 'Member List',
        subtitle: `Generated on ${new Date().toLocaleDateString()}`,
        filename: 'member-list'
      }
    )
  }

  function handleExportCSV() {
    const csvRows = [
      [
        "Name",
        "Status",
        "Phone",
        "Email",
        "Cell Group",
        "Invited By",
        "Join Date"
      ],
      ...filteredMembers.map(member => [
        member.name,
        member.isActive ? "Active" : "Inactive",
        member.phone,
        member.email,
        member.cellGroup?.name || "No Cell Group",
        member.invitedBy?.name || "Not invited by anyone",
        member.createdAt
      ])
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvRows.map(e => e.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "member-list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (loading) {
    return <div className="py-8 text-center">Loading members...</div>
  }

  return (
    <div className="py-10">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-3xl font-bold">Members</h1>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button onClick={handleExportPDF} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button onClick={handleExportCSV} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Link href="/members/new" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Member List</CardTitle>
          <CardDescription>
            {filteredMembers.length} members found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Input
                placeholder="Search by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:max-w-sm"
              />
              <Select
                value={selectedCellGroup}
                onValueChange={setSelectedCellGroup}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
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
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
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
              </div>
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

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Cell Group</TableHead>
                  <TableHead className="hidden sm:table-cell">Invited By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No members found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
  <div>
    {member.name}
    <div className="mt-1 text-sm text-gray-500 sm:hidden">
      {member.email || 'N/A'}
    </div>
    <div className="text-sm text-gray-500 sm:hidden">
      Cell Group: {member.cellGroup?.name || 'No Cell Group'}
    </div>
    <div className="text-sm text-gray-500 sm:hidden">
      Invited by: {member.invitedBy?.name || 'Not invited by anyone'}
    </div>
  </div>
</TableCell>
<TableCell>
  <span className={member.isActive ? 'text-green-600 font-medium' : 'text-gray-400 font-medium'}>
    {member.isActive ? 'Active' : 'Not Active'}
  </span>
</TableCell>
<TableCell>{member.phone}</TableCell>
                      <TableCell className="hidden sm:table-cell">{member.email || 'N/A'}</TableCell>
                      <TableCell className="hidden sm:table-cell">{member.cellGroup?.name || 'No Cell Group'}</TableCell>
                      <TableCell className="hidden sm:table-cell">{member.invitedBy?.name || 'Not invited by anyone'}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/members/${member.id}`}>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            <Eye className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">View</span>
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
