"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Dashboard from "../components/dashboard"
import CellGroupAttendanceChart from "../components/cell-group-attendance-chart"
import MemberGrowthChart from "../components/member-growth-chart"
import EventTypeAnalysisChart from "../components/event-type-analysis-chart"
import InvitationNetworkChart from "../components/invitation-network-chart"

export default function ReportsPage() {
  return (
    <div className="py-10">
      <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>

      <div className="grid gap-6">
        <Dashboard />
        <div className="grid gap-6 md:grid-cols-2">
          <MemberGrowthChart />
          <CellGroupAttendanceChart />
        </div>
        <div className="grid gap-6">
          <EventTypeAnalysisChart />
        </div>
        <InvitationNetworkChart />
      </div>
    </div>
  )
}
