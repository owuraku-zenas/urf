"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function MembersPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [members, setMembers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      // Mock member data
      setMembers([
        {
          id: "1",
          name: "John Doe",
          phone: "0123456789",
          cellGroup: { name: "Campus Fellowship" },
          university: "University of Ghana",
          invitedBy: { name: "Admin User" },
        },
        {
          id: "2",
          name: "Jane Smith",
          phone: "0123456788",
          cellGroup: { name: "Graduate Group" },
          university: "University of Ghana",
          invitedBy: null,
        },
        {
          id: "3",
          name: "Michael Johnson",
          phone: "0123456787",
          cellGroup: { name: "Campus Fellowship" },
          university: "KNUST",
          invitedBy: { name: "John Doe" },
        },
        {
          id: "4",
          name: "Sarah Williams",
          phone: "0123456786",
          cellGroup: { name: "Freshers Group" },
          university: "University of Ghana",
          invitedBy: { name: "Jane Smith" },
        },
        {
          id: "5",
          name: "David Brown",
          phone: "0123456785",
          cellGroup: { name: "Graduate Group" },
          university: "KNUST",
          invitedBy: null,
        },
        {
          id: "6",
          name: "Emily Davis",
          phone: "0123456784",
          cellGroup: { name: "Campus Fellowship" },
          university: "University of Ghana",
          invitedBy: { name: "Michael Johnson" },
        },
        {
          id: "7",
          name: "Robert Wilson",
          phone: "0123456783",
          cellGroup: { name: "Freshers Group" },
          university: "Central University",
          invitedBy: { name: "Sarah Williams" },
        },
        {
          id: "8",
          name: "Jennifer Taylor",
          phone: "0123456782",
          cellGroup: { name: "Graduate Group" },
          university: "University of Ghana",
          invitedBy: { name: "David Brown" },
        },
      ])
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm) ||
      (member.university && member.university.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (member.cellGroup && member.cellGroup.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Church Members</h1>
        <Link
          href="/members/new"
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
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
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <line x1="19" y1="8" x2="19" y2="14"></line>
            <line x1="22" y1="11" x2="16" y2="11"></line>
          </svg>
          Add New Member
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm mb-6">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-1">Member Search</h3>
          <p className="text-sm text-gray-500 mb-4">Search for members by name, email, phone, or cell group</p>
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="relative flex-1">
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
                className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
              <input
                type="search"
                placeholder="Search members..."
                className="w-full rounded-md border border-gray-300 pl-8 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <button className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50">
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
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              Filters
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-1">All Members</h3>
          <p className="text-sm text-gray-500 mb-4">Showing {filteredMembers.length} registered church members</p>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Phone</th>
                  <th className="text-left py-3 px-4 font-medium">Cell Group</th>
                  <th className="text-left py-3 px-4 font-medium">University</th>
                  <th className="text-left py-3 px-4 font-medium">Invited By</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      Loading members...
                    </td>
                  </tr>
                ) : filteredMembers.length === 0 ? (
                  <tr>
                    <td className="py-4 px-4 font-medium">No members found</td>
                    <td colSpan={5}></td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="border-b">
                      <td className="py-4 px-4 font-medium">{member.name}</td>
                      <td className="py-4 px-4">{member.phone}</td>
                      <td className="py-4 px-4">{member.cellGroup?.name || "None"}</td>
                      <td className="py-4 px-4">{member.university || "N/A"}</td>
                      <td className="py-4 px-4">{member.invitedBy?.name || "N/A"}</td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/members/${member.id}`}
                          className="inline-flex items-center rounded-md text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
