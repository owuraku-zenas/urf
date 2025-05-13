import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, LineChart, Download } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Member Growth</CardTitle>
            <LineChart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Track new member registrations over time</p>
            <Button asChild className="w-full">
              <Link href="/reports/member-growth">View Report</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl font-medium">Attendance Trends</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Analyze attendance patterns across different events</p>
            <Button asChild className="w-full">
              <Link href="/reports/attendance-trends">View Report</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>Export attendance and member data for offline analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Member List (CSV)
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Attendance Data (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
