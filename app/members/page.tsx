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
    return matchesSearch && matchesCellGroup
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Members</h1>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Link href="/members/new">
            <Button>
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
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search by name, phone, or email..."
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
                <TableHead>Email</TableHead>
                <TableHead>Cell Group</TableHead>
                <TableHead>Invited By</TableHead>
                <TableHead>Actions</TableHead>
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
                      {member.name}
                    </TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>{member.email || 'N/A'}</TableCell>
                    <TableCell>{member.cellGroup?.name || 'No Cell Group'}</TableCell>
                    <TableCell>{member.invitedBy?.name || 'Not invited by anyone'}</TableCell>
                    <TableCell>
                      <Link href={`/members/${member.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
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
