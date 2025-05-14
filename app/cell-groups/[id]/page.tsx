import { PrismaClient } from "@prisma/client"
import CellGroupDetails from "./CellGroupDetails"

const prisma = new PrismaClient()

export default async function CellGroupPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params
  console.log("Fetching cell group:", id)

  const cellGroup = await prisma.cellGroup.findUnique({
    where: {
      id,
    },
    include: {
      members: {
        select: {
          id: true,
          name: true,
          phone: true,
          university: true,
          program: true,
        },
      },
    },
  })

  if (!cellGroup) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Cell Group Not Found</h1>
          <p className="mt-2 text-gray-600">The cell group you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return <CellGroupDetails cellGroup={cellGroup} />
} 