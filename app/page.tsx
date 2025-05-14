"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface Stats {
  memberCount: number
  eventCount: number
  cellGroupCount: number
  attendanceRate: number
}

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    memberCount: 0,
    eventCount: 0,
    cellGroupCount: 0,
    attendanceRate: 0,
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats")
        if (!response.ok) {
          throw new Error("Failed to fetch stats")
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stats")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="py-10">
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold">Church Membership Management</h1>
        <p className="text-xl text-gray-500">Manage members, events, and attendance in one place</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Members Card */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <h3 className="text-xl font-medium">Members</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-gray-500"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <line x1="19" y1="8" x2="19" y2="14"></line>
              <line x1="22" y1="11" x2="16" y2="11"></line>
            </svg>
          </div>
          <div className="p-6 pt-0">
            <div className="text-3xl font-bold">{loading ? "..." : stats.memberCount}</div>
            <p className="text-xs text-gray-500">Total registered members</p>
            <Link
              href="/members"
              className="mt-4 block w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
            >
              Manage Members
            </Link>
          </div>
        </div>

        {/* Events Card */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <h3 className="text-xl font-medium">Events</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-gray-500"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div className="p-6 pt-0">
            <div className="text-3xl font-bold">{loading ? "..." : stats.eventCount}</div>
            <p className="text-xs text-gray-500">Total events created</p>
            <Link
              href="/events"
              className="mt-4 block w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
            >
              Manage Events
            </Link>
          </div>
        </div>

        {/* Attendance Card */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <h3 className="text-xl font-medium">Attendance</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-gray-500"
            >
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              <path d="m9 14 2 2 4-4"></path>
            </svg>
          </div>
          <div className="p-6 pt-0">
            <div className="text-3xl font-bold">{loading ? "..." : `${stats.attendanceRate}%`}</div>
            <p className="text-xs text-gray-500">Average attendance rate</p>
            <Link
              href="/attendance"
              className="mt-4 block w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
            >
              Track Attendance
            </Link>
          </div>
        </div>

        {/* Cell Groups Card */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <h3 className="text-xl font-medium">Cell Groups</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-gray-500"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div className="p-6 pt-0">
            <div className="text-3xl font-bold">{loading ? "..." : stats.cellGroupCount}</div>
            <p className="text-xs text-gray-500">Active cell groups</p>
            <Link
              href="/cell-groups"
              className="mt-4 block w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
            >
              Manage Cell Groups
            </Link>
          </div>
        </div>

        {/* Reports Card */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
            <h3 className="text-xl font-medium">Reports</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 text-gray-500"
            >
              <rect x="3" y="3" width="18" height="18" rx="2"></rect>
              <path d="M3 9h18"></path>
              <path d="M9 21V9"></path>
            </svg>
          </div>
          <div className="p-6 pt-0">
            <div className="text-3xl font-bold">Analytics</div>
            <p className="text-xs text-gray-500">View detailed analytics and insights</p>
            <Link
              href="/reports"
              className="mt-4 block w-full rounded-md bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
            >
              View Reports
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
