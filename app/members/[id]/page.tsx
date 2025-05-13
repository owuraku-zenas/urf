"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default function MemberDetailPage({ params }: { params: { id: string } }) {
  const [isLoading, setIsLoading] = useState(true)
  const [member, setMember] = useState<any>(null)
  const [attendanceStats, setAttendanceStats] = useState({
    attendanceCount: 0,
    totalEvents: 0,
    attendanceRate: 0,
  })

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      // Mock member data based on ID
      const mockMember = {
        id: params.id,
        name: params.id === "1" ? "John Doe" : params.id === "2" ? "Jane Smith" : "Michael Johnson",
        phone: "0123456789",
        email: params.id === "1" ? "john@example.com" : params.id === "2" ? "jane@example.com" : "michael@example.com",
        university: "University of Ghana",
        program: "Computer Science",
        hostel: "Main Hostel",
        roomNumber: "A-123",
        cellGroup: { name: "Campus Fellowship" },
        invitedBy: params.id === "1" ? null : { name: "Admin User" },
        attendances: [
          {
            id: "att1",
            event: {
              name: "Sunday Service",
              date: new Date("2024-04-21T09:00:00Z"),
            },
          },
          {
            id: "att2",
            event: {
              name: "Midweek Service",
              date: new Date("2024-04-17T18:00:00Z"),
            },
          },
          {
            id: "att3",
            event: {
              name: "Prayer Meeting",
              date: new Date("2024-04-12T19:00:00Z"),
            },
          },
        ],
      }

      // Mock attendance stats
      const mockStats = {
        attendanceCount: 15,
        totalEvents: 20,
        attendanceRate: 75,
      }

      setMember(mockMember)
      setAttendanceStats(mockStats)
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [params.id])

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex items-center justify-center h-64">
          <p>Loading member details...</p>
        </div>
      </div>
    )
  }

  if (!member) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-6">
        <Link
          href="/members"
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-4 w-4"
          >
            <path d="m12 19-7-7 7-7"></path>
            <path d="M19 12H5"></path>
          </svg>
          Back to Members
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-1">{member.name}</h2>
              <p className="text-sm text-gray-500 mb-6">Member Profile</p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 text-gray-500"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <span>{member.phone}</span>
                </div>
                {member.email && (
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-gray-500"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                    </svg>
                    <span>{member.email}</span>
                  </div>
                )}
                {member.university && (
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-gray-500"
                    >
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                    </svg>
                    <span>
                      {member.university} {member.program ? `- ${member.program}` : ""}
                    </span>
                  </div>
                )}
                {(member.hostel || member.roomNumber) && (
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-gray-500"
                    >
                      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span>
                      {member.hostel} {member.roomNumber ? `Room ${member.roomNumber}` : ""}
                    </span>
                  </div>
                )}
                {member.cellGroup && (
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-gray-500"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>Cell Group: {member.cellGroup.name}</span>
                  </div>
                )}
                {member.invitedBy && (
                  <div className="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4 text-gray-500"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>Invited by: {member.invitedBy.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm mb-6">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-1">Attendance</h3>
              <p className="text-sm text-gray-500 mb-4">Member attendance statistics</p>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold">{attendanceStats.attendanceRate}%</div>
                <p className="text-sm text-gray-500">Overall attendance rate</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{attendanceStats.attendanceCount}</div>
                <p className="text-sm text-gray-500">Events attended</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-1">Recent Events</h3>
              <p className="text-sm text-gray-500 mb-4">Last events attended</p>
              {member.attendances.length > 0 ? (
                <ul className="space-y-2">
                  {member.attendances.map((attendance: any) => (
                    <li key={attendance.id} className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 text-gray-500"
                      >
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                        <line x1="16" x2="16" y1="2" y2="6"></line>
                        <line x1="8" x2="8" y1="2" y2="6"></line>
                        <line x1="3" x2="21" y1="10" y2="10"></line>
                      </svg>
                      <div>
                        <p className="text-sm font-medium">{attendance.event.name}</p>
                        <p className="text-xs text-gray-500">{new Date(attendance.event.date).toLocaleDateString()}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">No recent events attended</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
