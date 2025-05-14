"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Member, CellGroup } from "@prisma/client"

interface MemberWithRelations extends Member {
  cellGroup: CellGroup
  invitedBy: Member | null
  invitees: Member[]
}

export default function MemberDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const [member, setMember] = useState<MemberWithRelations | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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

    fetchMember()
  }, [id])

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
    <div className="py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">{member.name}</h1>
        <Button onClick={() => router.push('/members')}>
          Back to Members
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Member Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{member.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900">{member.phone}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Join Date</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">University</dt>
              <dd className="mt-1 text-sm text-gray-900">{member.university || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Program</dt>
              <dd className="mt-1 text-sm text-gray-900">{member.program || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Start Year</dt>
              <dd className="mt-1 text-sm text-gray-900">{member.startYear || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Hostel</dt>
              <dd className="mt-1 text-sm text-gray-900">{member.hostel || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Room Number</dt>
              <dd className="mt-1 text-sm text-gray-900">{member.roomNumber || 'N/A'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Cell Group</dt>
              <dd className="mt-1 text-sm text-gray-900">{member.cellGroup?.name || 'No Cell Group'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Invited By</dt>
              <dd className="mt-1 text-sm text-gray-900">{member.invitedBy?.name || 'N/A'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invitees</CardTitle>
          <CardDescription>
            Members invited by {member.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {member.invitees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No invitees yet
                  </TableCell>
                </TableRow>
              ) : (
                member.invitees.map((invitee) => (
                  <TableRow key={invitee.id}>
                    <TableCell className="font-medium">{invitee.name}</TableCell>
                    <TableCell>{invitee.email}</TableCell>
                    <TableCell>{invitee.phone}</TableCell>
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
