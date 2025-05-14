"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Event {
  id: string
  name: string
  type: string
  date: string
  attendances: Array<{
    id: string
    memberId: string
    member: {
      cellGroupId: string
    }
  }>
}

interface CellGroup {
  id: string
  name: string
  _count: {
    members: number
  }
}

export default function CellGroupAttendanceChart() {
  const [events, setEvents] = useState<Event[]>([])
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, cellGroupsRes] = await Promise.all([
          fetch('/api/events'),
          fetch('/api/cell-groups')
        ])

        if (!eventsRes.ok || !cellGroupsRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const [eventsData, cellGroupsData] = await Promise.all([
          eventsRes.json(),
          cellGroupsRes.json()
        ])

        // Sort events by date
        const sortedEvents = eventsData.sort((a: Event, b: Event) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )

        setEvents(sortedEvents)
        setCellGroups(cellGroupsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const chartData = events.map(event => {
    const dataPoint: any = {
      date: new Date(event.date).toLocaleDateString(),
    }

    cellGroups.forEach(group => {
      const attendanceCount = event.attendances.filter(
        attendance => attendance.member?.cellGroupId === group.id
      ).length
      const totalMembers = group._count.members
      dataPoint[group.name] = totalMembers > 0 ? (attendanceCount / totalMembers) * 100 : 0
    })

    return dataPoint
  })

  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f', '#ffbb28', '#ff8042'
  ]

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
          <CardDescription>Please wait while we fetch the data.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cell Group Attendance Trends</CardTitle>
        <CardDescription>
          Attendance rate by cell group over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis 
                label={{ value: 'Attendance Rate (%)', angle: -90, position: 'insideLeft' }}
                domain={[0, 100]}
              />
              <Tooltip />
              <Legend />
              {cellGroups.map((group, index) => (
                <Line
                  key={group.id}
                  type="monotone"
                  dataKey={group.name}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 