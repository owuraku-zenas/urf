"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PlusIcon } from "@heroicons/react/24/outline"

interface CellGroup {
  id: string
  name: string
  description: string
  _count: {
    members: number
  }
}

export default function CellGroupsPage() {
  const [loading, setLoading] = useState(true)
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCellGroups = async () => {
      try {
        console.log("Fetching cell groups...")
        const response = await fetch("/api/cell-groups")
        if (!response.ok) {
          throw new Error("Failed to fetch cell groups")
        }
        const data = await response.json()
        console.log("Received cell groups:", data)
        setCellGroups(data)
      } catch (err) {
        console.error("Error fetching cell groups:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch cell groups")
      } finally {
        setLoading(false)
      }
    }

    fetchCellGroups()
  }, [])

  if (loading) {
    return (
      <main className="flex-1">
        <div className="w-full max-w-7xl mx-auto px-5 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex-1">
        <div className="w-full max-w-7xl mx-auto px-5 flex items-center justify-center min-h-screen">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1">
      <div className="w-full max-w-7xl mx-auto px-5 py-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Cell Groups</h1>
          <Link
            href="/cell-groups/new"
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Cell Group
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {cellGroups.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">
              No cell groups found. Create your first cell group!
            </div>
          ) : (
            cellGroups.map((cellGroup) => (
              <Link
                key={cellGroup.id}
                href={`/cell-groups/${cellGroup.id}`}
                className="block p-4 sm:p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <h2 className="text-lg sm:text-xl font-semibold mb-2">{cellGroup.name}</h2>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">{cellGroup.description}</p>
                <div className="text-sm text-gray-500">
                  {cellGroup._count.members} members
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
