"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Download, Eye } from "lucide-react"
import { generateCellGroupMembersPDF } from "@/lib/pdf-utils"
import { CellGroup, Member } from "@prisma/client"

interface MemberWithInviter extends Member {
  invitedBy: {
    id: string
    name: string
  } | null
}

interface CellGroupWithMembers extends CellGroup {
  members: MemberWithInviter[]
}

export default function CellGroupDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [cellGroup, setCellGroup] = useState<CellGroupWithMembers | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCellGroup = async () => {
      try {
        const response = await fetch(`/api/cell-groups/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch cell group')
        }
        const data = await response.json()
        setCellGroup(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCellGroup()
  }, [params.id])

  const handleExportMembers = () => {
    if (!cellGroup) return

    generateCellGroupMembersPDF(cellGroup, {
      title: 'Cell Group Members Report',
      subtitle: `Generated on ${new Date().toLocaleDateString()}`,
      filename: `cell-group-${cellGroup.name}-members-report`
    })
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we fetch the cell group details.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

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

  if (!cellGroup) {
    return (
      <div className="container mx-auto py-10">
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Cell Group Not Found</CardTitle>
            <CardDescription className="text-yellow-600">
              The cell group you're looking for doesn't exist or has been deleted.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{cellGroup.name}</h1>
        <Button onClick={handleExportMembers}>
          <Download className="mr-2 h-4 w-4" />
          Export Members (PDF)
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cell Group Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Members</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {cellGroup.members.length}
              </dd>
            </div>
            {cellGroup.description && (
              <div className="md:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">{cellGroup.description}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            {cellGroup.members.length} members in this cell group
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Invited By</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cellGroup.members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No members in this cell group yet
                  </TableCell>
                </TableRow>
              ) : (
                cellGroup.members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      {member.name}
                    </TableCell>
                    <TableCell>{member.phone}</TableCell>
                    <TableCell>{member.email || 'N/A'}</TableCell>
                    <TableCell>{member.invitedBy?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(member.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/members/${member.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View member</span>
                      </Button>
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