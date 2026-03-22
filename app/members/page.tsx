"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Eye, Download, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { generateMemberListPDF } from "@/lib/pdf-utils"
import { useUser } from "@/context/user-context"
import { useSemester } from "../../context/semester-context"
import { SemesterSelector } from "@/components/semester-selector"
import UpcomingBirthdays from "@/components/upcoming-birthdays"

interface Member {
  id: string
  name: string
  email: string
  phone: string
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
  const { user } = useUser()
  const { selectedSemester } = useSemester()
  const router = useRouter()
  // Debug log to help diagnose user context issues
  console.log("user from useUser:", user)
  const isAdmin = user?.role === "admin" || !user // fallback to true if user is missing (for testing)

  // State declarations (ensure these are present)
  const [members, setMembers] = useState<Member[]>([])
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCellGroup, setSelectedCellGroup] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedCommitment, setSelectedCommitment] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCellGroup, selectedStatus, selectedCommitment, startDate, endDate, itemsPerPage])

  const handleDeleteMember = async (memberId: string) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    try {
      const res = await fetch(`/api/members/${memberId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete member");
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err) {
      alert("Error deleting member");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, cellGroupsRes] = await Promise.all([
          fetch(`/api/members?semesterId=${selectedSemester || ""}`),
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
  }, [selectedSemester])

  const getCommitmentStatus = (member: any) => {
    if (!member.commitments || member.commitments.length === 0) return 'UNCOMMITTED'
    return member.commitments[0].status
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCellGroup = selectedCellGroup === 'all' || member.cellGroupId === selectedCellGroup
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' && member.isActive) ||
      (selectedStatus === 'inactive' && !member.isActive)
    const matchesCommitment = selectedCommitment === 'all' || getCommitmentStatus(member) === selectedCommitment.toUpperCase()
    
    // Date range filtering
    const memberDate = new Date(member.createdAt)
    const matchesDateRange = (!startDate || memberDate >= new Date(startDate)) &&
      (!endDate || memberDate <= new Date(endDate + 'T23:59:59'))

    return matchesSearch && matchesCellGroup && matchesStatus && matchesCommitment && matchesDateRange
  })

  // Pagination Logic
  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)
  const paginatedMembers = itemsPerPage > 0 
    ? filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredMembers

  // KPI Calculations
  const committedCount = members.filter(m => getCommitmentStatus(m) === 'COMMITTED').length
  const atRiskCount = members.filter(m => getCommitmentStatus(m) === 'AT_RISK').length
  const uncommittedCount = members.filter(m => getCommitmentStatus(m) === 'UNCOMMITTED').length

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
        <div className="flex items-center gap-4 flex-wrap">
          <h1 className="text-3xl font-bold">Members</h1>
          <SemesterSelector />
        </div>
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

      <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card className="bg-green-50/50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Committed Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{committedCount}</div>
              <p className="text-xs text-green-600/80 mt-1">High attendance track</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50/50 border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">At Risk Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{atRiskCount}</div>
              <p className="text-xs text-yellow-600/80 mt-1">40-74% attendance track</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50/50 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800">Uncommitted Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{uncommittedCount}</div>
              <p className="text-xs text-red-600/80 mt-1">Below standard tracking</p>
            </CardContent>
          </Card>
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
              <Select
                value={selectedCommitment}
                onValueChange={setSelectedCommitment}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Commitment Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="committed">Committed</SelectItem>
                  <SelectItem value="at_risk">At Risk</SelectItem>
                  <SelectItem value="uncommitted">Uncommitted</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(val) => setItemsPerPage(Number(val))}
              >
                <SelectTrigger className="w-full sm:w-[130px]">
                  <SelectValue placeholder="Per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="1000000">All</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row justify-between">
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
              
              {isAdmin && (
                <Button
                  onClick={() => {
                    // Extract exactly what we filtered currently and send their IDs to the SMS dashboard
                    const memberIds = filteredMembers.map(m => m.id).join(",")
                    // We can either pass specific IDs or abstract "filter=AT_RISK" bounds if they chose one explicitly. 
                    // To be safe and precise across ALL random filter combos, we just map out exactly the derived IDs.
                    const payload = new URLSearchParams()
                    if (selectedCommitment !== 'all') payload.set("filter", selectedCommitment)
                    else payload.set("ids", memberIds) // fallback to explicit subset targeting
                    
                    router.push(`/admin/sms?${payload.toString()}`)
                  }}
                  className="w-full sm:w-auto"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Mass SMS Filtered
                </Button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>System State</TableHead>
                  <TableHead>Commitment</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="hidden sm:table-cell">Cell Group</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No members found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMembers.map((member) => (
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
                          {member.isActive ? 'Active' : 'Offline'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          getCommitmentStatus(member) === 'COMMITTED' ? 'bg-green-100 text-green-800' :
                          getCommitmentStatus(member) === 'AT_RISK' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {getCommitmentStatus(member).replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell>{member.phone}</TableCell>
                      <TableCell className="hidden sm:table-cell">{member.email || 'N/A'}</TableCell>
                      <TableCell className="hidden sm:table-cell">{member.cellGroup?.name || '-'}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/members/${member.id}`}>
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">
                            <Eye className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">View</span>
                          </Button>
                        </Link>
                        {isAdmin && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="ml-2"
                            onClick={() => handleDeleteMember(member.id)}
                          >
                            Delete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {filteredMembers.length > 0 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredMembers.length)} of {filteredMembers.length} members
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="text-sm font-medium px-2">
                  Page {currentPage} of {Math.max(1, totalPages)}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages || totalPages === 0}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="w-full">
        <UpcomingBirthdays />
      </div>
    </div>
  )
}
