"use client"

import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { CellGroup, Member } from "@prisma/client"
import { useRouter } from "next/navigation"

interface MemberWithInviter extends Member {
  invitedBy: {
    id: string
    name: string
  } | null
}

interface CellGroupWithMembers extends CellGroup {
  members: MemberWithInviter[]
}

interface CellGroupDetailsProps {
  cellGroup: CellGroupWithMembers
  isAdmin: boolean
}

export default function CellGroupDetails({ cellGroup, isAdmin }: CellGroupDetailsProps) {
  const router = useRouter()
  const { toast } = useToast()

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/cell-groups/${cellGroup.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete cell group')
      }
      toast({
        title: "Success",
        description: "Cell group deleted successfully",
      })
      router.push('/cell-groups')
    } catch (error) {
      console.error('Error deleting cell group:', error)
      toast({
        title: "Error",
        description: "Failed to delete cell group",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{cellGroup.name}</h1>
        {isAdmin && (
          <div className="flex gap-4">
            <Link href={`/cell-groups/${cellGroup.id}/edit`}>
              <Button variant="outline">
                <Pencil className="mr-2 h-4 w-4" />
                Edit Cell Group
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Cell Group
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the cell group
                    and remove all associated data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Description</h2>
        <p className="text-gray-600">
          {cellGroup.description || "No description available"}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Members</h2>
        {cellGroup.members.length === 0 ? (
          <p className="text-gray-500">No members yet</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cellGroup.members.map((member) => (
              <div
                key={member.id}
                className="border rounded-lg p-4"
              >
                <h3 className="font-medium">{member.name}</h3>
                <p className="text-sm text-gray-500">
                  Invited by: {member.invitedBy?.name || 'Unknown'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 