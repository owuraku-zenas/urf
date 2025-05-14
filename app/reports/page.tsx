"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Dashboard from "../components/dashboard"
import CellGroupAttendanceChart from "../components/cell-group-attendance-chart"
import MemberGrowthChart from "../components/member-growth-chart"
import EventTypeAnalysisChart from "../components/event-type-analysis-chart"
import InvitationNetworkChart from "../components/invitation-network-chart"

export default function ReportsPage() {
  return (
    <main className="flex-1">
      <div className="w-full max-w-7xl mx-auto px-5 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Reports & Analytics</h1>

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
