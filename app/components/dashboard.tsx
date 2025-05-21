"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

interface Member {
  id: string
  name: string
  cellGroup?: {
    id: string
    name: string
  }
  invitees?: Array<{ id: string }>
}

interface Event {
  id: string
  name: string
  type: string
  date: string
  attendance: Array<{
    member: {
      cellGroupId: string | null
    }
  }>
}

interface CellGroup {
  id: string
  name: string
  description: string | null
  members: Array<{
    id: string
    name: string
  }>
  _count: {
    members: number
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function Dashboard() {
  const [members, setMembers] = useState<Member[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, eventsRes, cellGroupsRes] = await Promise.all([
          fetch('/api/members'),
          fetch('/api/events'),
          fetch('/api/cell-groups')
        ])

        if (!membersRes.ok || !eventsRes.ok || !cellGroupsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const [membersData, eventsData, cellGroupsData] = await Promise.all([
          membersRes.json(),
          eventsRes.json(),
          cellGroupsRes.json()
        ])

        setMembers(membersData || [])
        setEvents(eventsData || [])
        setCellGroups(cellGroupsData || [])
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate statistics
  const totalMembers = members?.length || 0
  const totalCellGroups = cellGroups?.length || 0
  const totalEvents = events?.length || 0
  const totalInvitations = members?.reduce((acc, member) => acc + (member.invitees?.length || 0), 0) || 0

  // Prepare data for charts
  const cellGroupData = cellGroups?.map(group => ({
    name: group.name,
    members: group._count?.members || 0
  })) || []

  const attendanceData = events?.map(event => ({
    name: event.name,
    attendance: event.attendance?.length || 0
  })) || []

  const invitationData = members
    ?.filter(member => (member.invitees?.length || 0) > 0)
    .sort((a, b) => (b.invitees?.length || 0) - (a.invitees?.length || 0))
    .slice(0, 5)
    .map(member => ({
      name: member.name,
      invitations: member.invitees?.length || 0
    })) || []

  const cellGroupDistribution = cellGroups?.map(group => ({
    name: group.name,
    value: group._count?.members || 0
  })) || []

  if (loading) {
    return <div className="text-center py-8">Loading dashboard data...</div>
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cell Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCellGroups}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invitations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvitations}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cell Group Growth</CardTitle>
            <CardDescription>Number of members in each cell group</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cellGroupData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="members" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>Event attendance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="attendance" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Inviters</CardTitle>
            <CardDescription>Members with most invitations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={invitationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="invitations" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cell Group Distribution</CardTitle>
            <CardDescription>Distribution of members across cell groups</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cellGroupDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {cellGroupDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 