"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"

export default function CellGroupsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [cellGroups, setCellGroups] = useState<any[]>([])

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      // Mock cell group data
      setCellGroups([
        {
          id: "clg1",
          name: "Campus Fellowship",
          description: "Main campus fellowship group",
          _count: { members: 15 },
        },
        {
          id: "clg2",
          name: "Graduate Group",
          description: "For graduate students and alumni",
          _count: { members: 10 },
        },
        {
          id: "clg3",
          name: "Freshers Group",
          description: "For first-year students",
          _count: { members: 7 },
        },
      ])
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Cell Groups</h1>
        <Button asChild>
          <Link href="/cell-groups/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Cell Group
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Cell Groups</CardTitle>
          <CardDescription>Manage church cell groups and their members</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Members</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Loading cell groups...
                  </TableCell>
                </TableRow>
              ) : cellGroups.length === 0 ? (
                <TableRow>
                  <TableCell className="font-medium">No cell groups found</TableCell>
                  <TableCell colSpan={3}></TableCell>
                </TableRow>
              ) : (
                cellGroups.map((cellGroup) => (
                  <TableRow key={cellGroup.id}>
                    <TableCell className="font-medium">{cellGroup.name}</TableCell>
                    <TableCell>{cellGroup.description || "N/A"}</TableCell>
                    <TableCell>{cellGroup._count.members}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/cell-groups/${cellGroup.id}`}>View</Link>
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
