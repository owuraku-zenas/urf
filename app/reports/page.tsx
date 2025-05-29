"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Dashboard from "../components/dashboard"
import CellGroupAttendanceChart from "../components/cell-group-attendance-chart"
import MemberGrowthChart from "../components/member-growth-chart"
import EventTypeAnalysisChart from "../components/event-type-analysis-chart"
import InvitationNetworkChart from "../components/invitation-network-chart"
import { generateReportWithChartsPDF } from "@/lib/pdf-utils"

export default function ReportsPage() {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Get chart data from the components
      const [memberGrowthResponse, attendanceResponse, cellGroupResponse, membersResponse] = await Promise.all([
        fetch('/api/reports/member-growth'),
        fetch('/api/reports/attendance-trends'),
        fetch('/api/cell-groups'),
        fetch('/api/members')
      ])

      // Check if any of the responses failed
      if (!memberGrowthResponse.ok || !attendanceResponse.ok || !cellGroupResponse.ok || !membersResponse.ok) {
        throw new Error('Failed to fetch data from one or more endpoints')
      }

      const [memberGrowthData, attendanceData, cellGroupData, membersData] = await Promise.all([
        memberGrowthResponse.json(),
        attendanceResponse.json(),
        cellGroupResponse.json(),
        membersResponse.json()
      ])

      // Validate the data
      if (!memberGrowthData?.growthData || !attendanceData?.eventStats || !Array.isArray(cellGroupData) || !Array.isArray(membersData)) {
        throw new Error('Invalid data received from endpoints')
      }

      // Format dates for better readability
      const formatDate = (dateStr: string) => {
        try {
          const date = new Date(dateStr)
          return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        } catch (error) {
          console.error('Date formatting error:', error)
          return dateStr
        }
      }

      // Calculate top inviters
      const inviterCounts: { [key: string]: { name: string; count: number } } = {};
      membersData.forEach((member: any) => {
        if (member.invitedBy && member.invitedBy.id) {
          const inviterId = member.invitedBy.id;
          const inviterName = member.invitedBy.name || 'Unknown Inviter';
          if (!inviterCounts[inviterId]) {
            inviterCounts[inviterId] = { name: inviterName, count: 0 };
          }
          inviterCounts[inviterId].count++;
        }
      });

      const topInviters = Object.values(inviterCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Get top 10 inviters

      // Prepare chart data
      const charts = [
        {
          title: 'Member Growth Over Time',
          type: 'line' as const,
          data: memberGrowthData.growthData.map((item: any) => ({
            label: formatDate(item.month + '-01'),
            value: item.totalMembers
          }))
        },
        {
          title: 'Attendance Trends',
          type: 'line' as const,
          data: attendanceData.eventStats.map((event: any) => ({
            label: formatDate(event.date),
            value: event.attendancePercentage
          }))
        },
        {
          title: 'Cell Group Member Count',
          type: 'pie' as const,
          data: cellGroupData
            .filter((group: any) => group._count?.members !== undefined && group._count.members > 0) // Filter out groups with 0 members for pie chart
            .map((group: any) => ({
              label: group.name,
              value: group._count.members
            }))
        },
        {
          title: 'Event Type Analysis',
          type: 'line' as const,
          data: (attendanceData.typeAverages || []).map((type: any) => ({
            label: type.type.replace(/_/g, ' '),
            value: type.averageAttendance || 0
          }))
        },
        {
          title: 'Top 10 Inviters',
          type: 'bar' as const,
          data: topInviters.map(inviter => ({
            label: inviter.name,
            value: inviter.count
          }))
        }
      ]

      // Validate chart data
      const chartsToRender = charts.filter(chart => {
        // For pie chart, ensure total value is greater than 0
        if (chart.type === 'pie') {
          const total = chart.data.reduce((sum, point) => sum + point.value, 0);
          return chart.data && Array.isArray(chart.data) && chart.data.length > 0 && total > 0;
        }
        // For other charts, ensure there is data
        return chart.data && Array.isArray(chart.data) && chart.data.length > 0;
      });

      if (chartsToRender.length === 0) {
        throw new Error('No data available to generate any charts for the report.');
      }


      await generateReportWithChartsPDF(
        'Reports & Analytics',
        chartsToRender,
        {
          title: 'Reports & Analytics',
          subtitle: `Generated on ${new Date().toLocaleDateString()}`,
          filename: 'reports-and-analytics'
        }
      )

      toast({
        title: "Success",
        description: "Report has been exported successfully",
      })
    } catch (error) {
      console.error('Export failed:', error)
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <main className="flex-1">
      <div className="w-full max-w-7xl mx-auto px-5 py-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Reports & Analytics</h1>
          <Button 
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export Report'}
          </Button>
        </div>

        <div className="grid gap-4 sm:gap-6">
          <Dashboard />
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
            <MemberGrowthChart />
            <CellGroupAttendanceChart />
          </div>
          <div className="grid gap-4 sm:gap-6">
            <EventTypeAnalysisChart />
          </div>
          <InvitationNetworkChart />
        </div>
      </div>
    </main>
  )
}
