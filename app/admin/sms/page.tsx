import { prisma } from "@/lib/prisma"
import SmsDashboard from "./sms-dashboard"

export const metadata = {
  title: "SMS Broadcast | Admin",
  description: "Send and track bulk SMS announcements",
}

export default async function SmsAdminPage() {
  // Fetch members to pass to the client component for the multi-select table
  const members = await prisma.member.findMany({
    where: {
      phone: { not: "" }
    },
    select: {
      id: true,
      name: true,
      phone: true,
      isActive: true,
      cellGroup: {
        select: { name: true }
      },
      joinedSemesterId: true,
      commitments: {
        select: { status: true, semesterId: true }
      }
    },
    orderBy: { name: "asc" }
  })

  // Fetch recent SMS logs
  const logs = await prisma.smsLog.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      member: {
        select: { name: true }
      }
    }
  })

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">SMS Broadcasts</h1>
        <p className="text-gray-500 mt-2">
          Send announcements, birthday wishes, and track delivery statuses.
        </p>
      </div>

      <SmsDashboard initialMembers={members} initialLogs={logs} />
    </div>
  )
}
