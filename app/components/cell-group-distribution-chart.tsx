"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface CellGroup {
  id: string
  name: string
  description: string
  _count: {
    members: number
  }
}

const TARGET_SIZE = 12 // Target number of members per cell group

export default function CellGroupDistributionChart() {
  const [cellGroups, setCellGroups] = useState<CellGroup[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/cell-groups')
        if (!response.ok) {
          throw new Error('Failed to fetch cell groups')
        }
        const data = await response.json()
        setCellGroups(data)
      } catch (error) {
        console.error('Error fetching cell groups:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const chartData = cellGroups.map(group => ({
    name: group.name,
    value: group._count.members,
    emptySlots: TARGET_SIZE - group._count.members
  }))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

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
        <CardTitle>Cell Group Distribution</CardTitle>
        <CardDescription>
          Member distribution across cell groups (Target: {TARGET_SIZE} members per group)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[500px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={200}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {cellGroups.map((group, index) => (
            <div key={group.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="font-medium">{group.name}</span>
              <span className="text-sm text-gray-600">
                {group._count.members}/{TARGET_SIZE} members
                {group._count.members < TARGET_SIZE && (
                  <span className="text-red-500 ml-2">
                    ({TARGET_SIZE - group._count.members} slots available)
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 