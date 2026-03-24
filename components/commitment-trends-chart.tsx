"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { useSemester } from "@/context/semester-context"

interface ComparisonData {
  semesterId: string;
  name: string;
  committed: number;
  uncommitted: number;
  atRisk: number;
}

const COLORS = {
  committed: '#10b981', // green
  atRisk: '#f59e0b', // yellow
  uncommitted: '#ef4444' // red
};

export default function CommitmentTrendsChart() {
  const { selectedSemester } = useSemester()
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
          <CardTitle>Commitment Analysis</CardTitle>
          <CardDescription>Loading commitment trends...</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </CardContent>
      </Card>
    )
  }

  // If viewing 'all' semesters, show a stacked bar chart mapping shifts over time
  if (!selectedSemester || selectedSemester === 'all') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Commitment Global Trends</CardTitle>
          <CardDescription>Distribution of commitment states across all semesters</CardDescription>
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
                  <Bar dataKey="committed" name="Committed" stackId="a" fill={COLORS.committed} />
                  <Bar dataKey="atRisk" name="At Risk" stackId="a" fill={COLORS.atRisk} />
                  <Bar dataKey="uncommitted" name="Uncommitted" stackId="a" fill={COLORS.uncommitted} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // If viewing a specific semester, show a granular Pie Chart
  const activeSemesterData = data.find(d => d.semesterId === selectedSemester);
  const pieData = activeSemesterData ? [
    { name: 'Committed', value: activeSemesterData.committed, color: COLORS.committed },
    { name: 'At Risk', value: activeSemesterData.atRisk, color: COLORS.atRisk },
    { name: 'Uncommitted', value: activeSemesterData.uncommitted, color: COLORS.uncommitted }
  ].filter(item => item.value > 0) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Semester Commitment Ratio</CardTitle>
        <CardDescription>Commitment grading for {activeSemesterData?.name || 'Selected Semester'}</CardDescription>
      </CardHeader>
      <CardContent>
        {pieData.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No commitment data logged yet.
          </div>
        ) : (
          <div className="w-full">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Status Breakdown</h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                <p className="text-2xl font-bold text-green-700">{activeSemesterData?.committed || 0}</p>
                <p className="text-xs text-green-600 font-medium">Committed</p>
                <p className="text-[10px] text-green-500 mt-1">≥75% Attendance</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                <p className="text-2xl font-bold text-orange-700">{activeSemesterData?.atRisk || 0}</p>
                <p className="text-xs text-orange-600 font-medium">At Risk</p>
                <p className="text-[10px] text-orange-500 mt-1">40-74% Attendance</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                <p className="text-2xl font-bold text-red-700">{activeSemesterData?.uncommitted || 0}</p>
                <p className="text-xs text-red-600 font-medium">Uncommitted</p>
                <p className="text-[10px] text-red-500 mt-1">&lt;40% Attendance</p>
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center mt-2 pt-2">
              Total Tracked: {(activeSemesterData?.committed || 0) + (activeSemesterData?.atRisk || 0) + (activeSemesterData?.uncommitted || 0)} members
            </div>
          </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
