"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Event {
  id: string
  name: string
  type: string
  date: string
  attendances: Array<{
    id: string
    memberId: string
  }>
}

export default function EventTypeAnalysisChart() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/events')
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }
        const data = await response.json()
        setEvents(data)
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Group events by type and calculate attendance metrics
  const chartData = events.reduce((acc: any[], event) => {
    const existingType = acc.find(item => item.type === event.type)
    const attendanceCount = event.attendances.length

    if (existingType) {
      existingType.totalEvents++
      existingType.totalAttendance += attendanceCount
      existingType.attendanceRate = (existingType.totalAttendance / existingType.totalEvents).toFixed(1)
    } else {
      acc.push({
        type: event.type,
        totalEvents: 1,
        totalAttendance: attendanceCount,
        attendanceRate: attendanceCount.toFixed(1)
      })
    }

    return acc
  }, [])

  // Sort by attendance rate
  chartData.sort((a, b) => b.attendanceRate - a.attendanceRate)

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
        <CardTitle>Event Type Analysis</CardTitle>
        <CardDescription>
          Average attendance by event type
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="type"
                label={{ value: 'Event Type', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Average Attendance', angle: -90, position: 'insideLeft' }}
                domain={[0, 'auto']}
              />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="attendanceRate"
                name="Average Attendance"
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 