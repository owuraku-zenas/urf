"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface ComparisonData {
  semesterId: string;
  name: string;
  membersJoined: number;
  avgAttendance: number;
}

export default function ComparativeGrowthChart() {
  const [data, setData] = useState<ComparisonData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const res = await fetch('/api/reports/semester-comparison');
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchComparison();
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Semester Growth Comparison</CardTitle>
          <CardDescription>Loading comparative analytics...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Semester Growth Comparison</CardTitle>
        <CardDescription>Members joined vs. average attendance per semester</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No semester data gathered yet.
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
                />
                <Legend />
                <Bar dataKey="membersJoined" name="New Members" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgAttendance" name="Avg. Attendance" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
