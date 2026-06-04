"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Eye, Download, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { generateMemberListPDF } from "@/lib/pdf-utils"
import { useUser } from "@/context/user-context"
import { useSemester } from "@/context/semester-context"
import { SemesterSelector } from "@/components/semester-selector"
import UpcomingBirthdays from "@/components/upcoming-birthdays"
import { useToast } from "@/components/ui/use-toast"

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
  joinDate: string
  createdAt: string
  updatedAt: string
  cellGroupId: string | null
  invitedById: string | null
  commitments?: Array<{ status: string; semesterId: string }>
}

interface CellGroup {
  id: string
  name: string
  description: string | null
}

interface Semester {
  id: string
  name: string
}

export default function MembersPage() {
  const { user } = useUser()
  const { selectedSemester } = useSemester()
  const router = useRouter()
  const { toast } = useToast()
  const isAdmin = user?.role === "admin" || !user

  const [members, setMembers] = useState<Member[]>([])
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [refetching, setRefetching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCellGroup, setSelectedCellGroup] = useState("all")
  const [selectedCommitment, setSelectedCommitment] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCellGroup, selectedCommitment, startDate, endDate, itemsPerPage, selectedSemester])

  const confirmDelete = async () => {
    if (!memberToDelete) return
    try {
      const res = await fetch(`/api/members/${memberToDelete}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete member")
      setMembers(prev => prev.filter(m => m.id !== memberToDelete))
      toast({ title: "Member deleted" })
    } catch {
      toast({ title: "Error", description: "Failed to delete member. Please try again.", variant: "destructive" })
    } finally {
      setMemberToDelete(null)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!loading) setRefetching(true)
      try {
        const semParam = selectedSemester && selectedSemester !== 'all' ? selectedSemester : 'all'
        const commitmentParam = semParam !== 'all' ? `&commitmentSemesterId=${semParam}` : ''
        const [membersRes, cellGroupsRes, semestersRes] = await Promise.all([
          fetch(`/api/members?semesterId=${semParam}${commitmentParam}`),
          fetch('/api/cell-groups'),
          fetch('/api/semesters'),
        ])

        if (!membersRes.ok || !cellGroupsRes.ok || !semestersRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const [membersData, cellGroupsData, semestersData] = await Promise.all([
          membersRes.json(),
          cellGroupsRes.json(),
          semestersRes.json(),
        ])

        setMembers(membersData)
        setCellGroups(cellGroupsData)
        setSemesters(semestersData)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast({ title: "Error", description: "Failed to load members.", variant: "destructive" })
      } finally {
        setLoading(false)
        setRefetching(false)
      }
    }

    fetchData()
  }, [selectedSemester])

  const getCommitmentStatus = (member: any) => {
    if (!member.commitments || member.commitments.length === 0) return 'NEW_MEMBER'
    if (selectedSemester && selectedSemester !== 'all') {
      const match = member.commitments.find((c: any) => c.semesterId === selectedSemester)
      return match ? match.status : 'NEW_MEMBER'
    }
    return member.commitments[0].status
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (member.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCellGroup = selectedCellGroup === 'all' || member.cellGroupId === selectedCellGroup
    const matchesCommitment = selectedCommitment === 'all' || getCommitmentStatus(member) === selectedCommitment.toUpperCase()
    const memberDate = new Date(member.createdAt)
    const matchesDateRange = (!startDate || memberDate >= new Date(startDate)) &&
      (!endDate || memberDate <= new Date(endDate + 'T23:59:59'))
    return matchesSearch && matchesCellGroup && matchesCommitment && matchesDateRange
  })

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage)
  const paginatedMembers = itemsPerPage > 0
    ? filteredMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : filteredMembers

  const committedCount  = members.filter(m => getCommitmentStatus(m) === 'COMMITTED').length
  const atRiskCount     = members.filter(m => getCommitmentStatus(m) === 'AT_RISK').length
  const uncommittedCount = members.filter(m => getCommitmentStatus(m) === 'UNCOMMITTED').length
  const newMemberCount  = members.filter(m => getCommitmentStatus(m) === 'NEW_MEMBER').length

  const handleExportPDF = () => {
    generateMemberListPDF(
      filteredMembers.map(member => ({
        ...member,
        cellGroup: member.cellGroup || null,
        joinDate: member.joinDate,
        status: getCommitmentStatus(member).replace('_', ' '),
      })),
      {
        title: 'Member List',
        subtitle: `Generated on ${new Date().toLocaleDateString()}`,
        filename: 'member-list',
      }
    )
  }

  function handleExportCSV() {
    const csvRows = [
      ["Name", "Status", "Phone", "Email", "Cell Group", "Invited By", "Join Date"],
      ...filteredMembers.map(member => [
        member.name,
        getCommitmentStatus(member).replace('_', ' '),
        member.phone,
        member.email,
        member.cellGroup?.name || "No Cell Group",
        member.invitedBy?.name || "Not invited by anyone",
        member.joinDate,
      ]),
    ]
    const csvContent = "data:text/csv;charset=utf-8," +
      csvRows.map(e => e.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
    const link = document.createElement("a")
    link.setAttribute("href", encodeURI(csvContent))
    link.setAttribute("download", "member-list.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleSmsFiltered = () => {
    const payload = new URLSearchParams()
    if (selectedCommitment !== 'all') payload.set("filter", selectedCommitment)
    else payload.set("ids", filteredMembers.map(m => m.id).join(","))
    router.push(`/admin/sms?${payload.toString()}`)
  }

  if (loading) {
    return <div className="py-8 text-center">Loading members...</div>
  }

  return (
    <>
      <div className="py-10">
        {/* Page header */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-3xl font-bold">Members</h1>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Score by semester</span>
              <SemesterSelector />
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button variant="outline" onClick={handleExportPDF} className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
            <Button variant="outline" onClick={handleExportCSV} className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            {isAdmin && (
              <Button variant="outline" onClick={handleSmsFiltered} className="w-full sm:w-auto">
                <MessageSquare className="mr-2 h-4 w-4" />
                SMS Filtered ({filteredMembers.length})
              </Button>
            )}
            <Link href="/members/new" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI cards — 4 columns now includes New Members */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card className="bg-green-50/50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-800">Committed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{committedCount}</div>
              <p className="text-xs text-green-600/80 mt-1">≥70% attendance</p>
            </CardContent>
          </Card>
          <Card className="bg-yellow-50/50 border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-800">At Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{atRiskCount}</div>
              <p className="text-xs text-yellow-600/80 mt-1">40–74% attendance</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50/50 border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-800">Uncommitted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{uncommittedCount}</div>
              <p className="text-xs text-red-600/80 mt-1">&lt;40% attendance</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50/50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">New Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{newMemberCount}</div>
              <p className="text-xs text-blue-600/80 mt-1">Grace period</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Member List</CardTitle>
            <CardDescription>{filteredMembers.length} members found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-3">
              {/* Filter row */}
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                <Input
                  placeholder="Search by name, phone, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:max-w-xs"
                />
                <Select value={selectedCellGroup} onValueChange={setSelectedCellGroup}>
                  <SelectTrigger className="w-full sm:w-[180px]" aria-label="Filter by cell group">
                    <SelectValue placeholder="All Cell Groups" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cell Groups</SelectItem>
                    {cellGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedCommitment} onValueChange={setSelectedCommitment}>
                  <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by commitment level">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="committed">Committed</SelectItem>
                    <SelectItem value="at_risk">At Risk</SelectItem>
                    <SelectItem value="uncommitted">Uncommitted</SelectItem>
                    <SelectItem value="new_member">New Member</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={itemsPerPage.toString()} onValueChange={(val) => setItemsPerPage(Number(val))}>
                  <SelectTrigger className="w-full sm:w-[130px]" aria-label="Rows per page">
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
              {/* Date range row */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Joined between</span>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full sm:w-[160px]"
                    aria-label="Start date"
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full sm:w-[160px]"
                    aria-label="End date"
                  />
                </div>
                {(startDate || endDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setStartDate(""); setEndDate("") }}
                  >
                    Clear dates
                  </Button>
                )}
              </div>
            </div>

            {/* Table with refetch overlay */}
            <div className="relative overflow-x-auto">
              {refetching && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded bg-white/60">
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
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
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        No members found. Try adjusting your filters.
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
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            getCommitmentStatus(member) === 'COMMITTED'   ? 'bg-green-100 text-green-800' :
                            getCommitmentStatus(member) === 'AT_RISK'     ? 'bg-yellow-100 text-yellow-800' :
                            getCommitmentStatus(member) === 'NEW_MEMBER'  ? 'bg-blue-100 text-blue-800' :
                            getCommitmentStatus(member) === 'UNCOMMITTED' ? 'bg-red-100 text-red-800' :
                                                                            'bg-green-100 text-green-800'
                          }`}>
                            {getCommitmentStatus(member) === 'LEGACY' ? 'COMMITTED' : getCommitmentStatus(member).replace('_', ' ')}
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
                              onClick={() => setMemberToDelete(member.id)}
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

        <UpcomingBirthdays />
      </div>

      <AlertDialog open={memberToDelete !== null} onOpenChange={(open) => { if (!open) setMemberToDelete(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the member and all their attendance records. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
