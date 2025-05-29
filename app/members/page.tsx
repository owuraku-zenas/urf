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
    
    // Date range filtering
    const memberDate = new Date(member.createdAt)
    const matchesDateRange = (!startDate || memberDate >= new Date(startDate)) &&
      (!endDate || memberDate <= new Date(endDate + 'T23:59:59'))

    return matchesSearch && matchesCellGroup && matchesDateRange
  })

  const handleExportPDF = () => {
    generateMemberListPDF(
      filteredMembers.map(member => ({
        ...member,
        cellGroup: member.cellGroup || null
      })),
      {
        title: 'Member List',
        subtitle: `Generated on ${new Date().toLocaleDateString()}`,
        filename: 'member-list'
      }
    )
  }

  if (loading) {
    return <div className="text-center py-8">Loading members...</div>
  }

  return (
    <div className="py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Members</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={handleExportPDF} className="w-full sm:w-auto">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
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
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col sm:flex-row gap-4">
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
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
                          <div className="sm:hidden text-sm text-gray-500 mt-1">
                            {member.email || 'N/A'}
                          </div>
                          <div className="sm:hidden text-sm text-gray-500">
                            Cell Group: {member.cellGroup?.name || 'No Cell Group'}
                          </div>
                          <div className="sm:hidden text-sm text-gray-500">
                            Invited by: {member.invitedBy?.name || 'Not invited by anyone'}
                          </div>
                        </div>
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
