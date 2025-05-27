import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function CellGroupsPage() {
  const session = await auth()
  if (!session) {
    redirect('/auth/signin')
  }

  const isAdmin = session.user.role === 'ADMIN'
  const cellGroups = await prisma.cellGroup.findMany({
    include: {
      _count: {
        select: {
          members: true,
        },
      },
    },
  })

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Cell Groups</h1>
        {isAdmin && (
          <Link href="/cell-groups/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Cell Group
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cellGroups.map((cellGroup) => (
          <Link
            key={cellGroup.id}
            href={`/cell-groups/${cellGroup.id}`}
            className="block"
          >
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-semibold mb-2">{cellGroup.name}</h2>
              <p className="text-gray-600 mb-4">
                {cellGroup.description || "No description available"}
              </p>
              <div className="text-sm text-gray-500">
                {cellGroup._count.members} members
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
