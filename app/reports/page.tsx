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
import ComparativeGrowthChart from "@/components/comparative-growth-chart"
import CommitmentTrendsChart from "@/components/commitment-trends-chart"
import { generateReportWithChartsPDF } from "@/lib/pdf-utils"
import { useSemester } from "@/context/semester-context"
import { SemesterSelector } from "@/components/semester-selector"

export default function ReportsPage() {
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()
  const { selectedSemester } = useSemester()

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Get chart data from the components
      const semesterQuery = selectedSemester ? `?semesterId=${selectedSemester}` : ''
      const [memberGrowthResponse, attendanceResponse, cellGroupResponse, membersResponse, comparisonResponse] = await Promise.all([
        fetch(`/api/reports/member-growth${semesterQuery}`),
        fetch(`/api/reports/attendance-trends${semesterQuery}`),
        fetch(`/api/cell-groups${semesterQuery}`),
        fetch(`/api/members${semesterQuery}`),
        fetch(`/api/reports/semester-comparison`)
      ])

      // Check if any of the responses failed
      if (!memberGrowthResponse.ok || !attendanceResponse.ok || !cellGroupResponse.ok || !membersResponse.ok || !comparisonResponse.ok) {
        throw new Error('Failed to fetch data from one or more endpoints')
      }

      const [memberGrowthData, attendanceData, cellGroupData, membersData, comparisonData] = await Promise.all([
        memberGrowthResponse.json(),
        attendanceResponse.json(),
        cellGroupResponse.json(),
        membersResponse.json(),
        comparisonResponse.json()
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

      // Calculate Commitment Trends insights from membersData
      let committed = 0, atRisk = 0, uncommitted = 0;
      membersData.forEach((m: any) => {
         const commits = m.commitments?.filter((c: any) => selectedSemester === 'all' || !selectedSemester || c.semesterId === selectedSemester);
         if (commits && commits.length > 0) {
             const stat = commits[0].status;
             if (stat === 'COMMITTED') committed++;
             else if (stat === 'AT_RISK') atRisk++;
             else uncommitted++;
         } else {
             uncommitted++;
         }
      })

      // Prepare chart data
      const charts = [
        {
          title: 'Member Growth Over Time',
          type: 'line' as const,
          insights: [
            `Total active members tracked over the timeframe evaluated to ${memberGrowthData.growthData.reduce((max: number, i: any) => Math.max(max, i.totalMembers), 0)}.`,
            `Peak join rates occurred at ${memberGrowthData.growthData[memberGrowthData.growthData.length - 1]?.month || 'recent date'}.`
          ],
          data: memberGrowthData.growthData.map((item: any) => ({
            label: formatDate(item.month + '-01'),
            value: item.totalMembers
          }))
        },
        {
          title: 'Attendance Trends',
          type: 'line' as const,
          insights: [
            `Evaluated across ${attendanceData.eventStats.length} major service/events.`,
            `Average attendance peaked at ${Math.round(Math.max(...attendanceData.eventStats.map((e: any) => e.attendancePercentage)))}%.`
          ],
          data: attendanceData.eventStats.map((event: any) => ({
            label: formatDate(event.date),
            value: event.attendancePercentage
          }))
        },
        {
          title: 'Commitment Trends',
          type: 'pie' as const,
          insights: [
            `Analyzed across exactly ${committed + atRisk + uncommitted} distinct active member profiles.`,
            `Solid Core: ${committed} members (${Math.round(committed / (committed + atRisk + uncommitted) * 100) || 0}%) recorded high attendance (>= 75%).`,
            `Vulnerable Risk: ${atRisk} members (${Math.round(atRisk / (committed + atRisk + uncommitted) * 100) || 0}%) require follow-ups (40-74%).`,
            `Deficient Range: ${uncommitted} members (${Math.round(uncommitted / (committed + atRisk + uncommitted) * 100) || 0}%) have consistently failed to meet 40% engagement metrics.`
          ],
          data: [
            { label: 'Committed', value: committed },
            { label: 'At Risk', value: atRisk },
            { label: 'Uncommitted', value: uncommitted }
          ]
        },
        {
          title: 'Cell Group Member Distribution',
          type: 'pie' as const,
          insights: [
            `Cell structures successfully managed ${cellGroupData.reduce((acc: number, group: any) => acc + (group._count?.members || 0), 0)} tracked users.`
          ],
          data: cellGroupData
            .filter((group: any) => group._count?.members !== undefined && group._count.members > 0)
            .map((group: any) => ({
              label: group.name,
              value: group._count.members
            }))
        },
        {
          title: 'Event Type Analysis',
          type: 'line' as const,
          insights: [
            `Average turn-out by event classifications.`
          ],
          data: (attendanceData.typeAverages || []).map((type: any) => ({
            label: type.type.replace(/_/g, ' '),
            value: type.averageAttendance || 0
          }))
        },
        {
          title: 'Top 10 Inviters Network',
          type: 'bar' as const,
          insights: [
            `Evaluated relational network ties. Champion networkers traced below.`
          ],
          data: topInviters.map(inviter => ({
            label: inviter.name,
            value: inviter.count
          }))
        },
        {
          title: 'Comparative Semester Growth',
          type: 'bar' as const,
          insights: [
            `Macro growth trends bridging historical retention boundaries.`
          ],
          data: comparisonData.map((sem: any) => ({
            label: sem.name,
            value: sem.membersJoined
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold">Reports & Analytics</h1>
            <SemesterSelector />
          </div>
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
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
            <ComparativeGrowthChart />
            <CommitmentTrendsChart />
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
