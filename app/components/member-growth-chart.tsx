"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Member {
  id: string
  name: string
  createdAt: string
}

export default function MemberGrowthChart() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/members')
        if (!response.ok) {
          throw new Error('Failed to fetch members')
        }
        const data = await response.json()
        setMembers(data)
      } catch (error) {
        console.error('Error fetching members:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Group members by month and calculate cumulative count
  const chartData = members
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .reduce((acc: any[], member) => {
      const date = new Date(member.createdAt)
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
      
      const lastPoint = acc[acc.length - 1]
      const count = lastPoint ? lastPoint.count + 1 : 1
      
      acc.push({
        date: monthYear,
        count,
        members: count
      })
      
      return acc
    }, [])

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
        <CardTitle>Member Growth</CardTitle>
        <CardDescription>
          Total number of members over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                label={{ value: 'Date', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: 'Total Members', angle: -90, position: 'insideLeft' }}
                domain={[0, 'auto']}
              />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="members"
                name="Total Members"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
} 