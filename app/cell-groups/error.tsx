"use client"

export default function CellGroupsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Cell Groups</h1>
      <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-8 text-center">
        <p className="text-sm font-medium text-red-800">Something went wrong loading cell groups</p>
        <p className="mt-1 text-xs text-red-600 mb-4">The database may be temporarily unreachable.</p>
        <button
          onClick={reset}
          className="text-xs font-medium text-red-700 underline hover:text-red-900"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
