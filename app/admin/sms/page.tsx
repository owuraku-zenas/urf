import { prisma } from "@/lib/prisma"
import SmsDashboard from "./sms-dashboard"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "SMS Broadcast | Admin",
  description: "Send and track bulk SMS announcements",
}

export default async function SmsAdminPage() {
  const activeSemester = await prisma.semester.findFirst({
    where: { status: "ACTIVE" },
    select: { id: true }
  })

  // Fetch members to pass to the client component for the multi-select table
  const members = await prisma.member.findMany({
    where: {
      phone: { not: "" }
    },
    select: {
      id: true,
      name: true,
      phone: true,
      currentAcademicLevel: true,
      cellGroup: {
        select: { name: true }
      },
      commitments: {
        select: { status: true, semesterId: true }
      }
    },
    orderBy: { name: "asc" }
  })

  // Fetch recent SMS logs
  const logs = await prisma.smsLog.findMany({
    take: 500,
    orderBy: { createdAt: "desc" },
    include: {
      member: {
        select: { name: true }
      }
    }
  })

  // Fetch SMS templates
  const templates = await prisma.smsTemplate.findMany({
    orderBy: { name: "asc" }
  })

  // Fetch all existing semesters for analytical filtering
  const semesters = await prisma.semester.findMany({
    orderBy: { startDate: "desc" },
    select: { id: true, name: true, status: true }
  })

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">SMS Broadcasts</h1>
        <p className="text-gray-500 mt-2">
          Send announcements, birthday wishes, and track delivery statuses.
        </p>
      </div>

      <SmsDashboard 
        initialMembers={members} 
        initialLogs={logs} 
        initialTemplates={templates}
        initialSemesters={semesters}
        activeSemesterId={activeSemester?.id || null} 
      />
    </div>
  )
}
