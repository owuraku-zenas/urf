"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"

interface BirthdayMember {
  id: string
  name: string
  phone: string
  birthMonth: number
  birthDay: number
  cellGroup?: {
    name: string
  }
}

export default function UpcomingBirthdays() {
  const [birthdays, setBirthdays] = useState<BirthdayMember[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "ADMIN"

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const response = await fetch('/api/members/birthdays')
        if (response.ok) {
          setBirthdays(await response.json())
        }
      } catch (error) {
        console.error("Failed to fetch birthdays", error)
      } finally {
        setLoading(false)
      }
    }
    fetchBirthdays()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-blue-500" /> Upcoming Birthdays
          </CardTitle>
          <CardDescription>Checking for upcoming celebrations...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex animate-pulse flex-col space-y-4">
            <div className="h-12 bg-gray-100 rounded-md"></div>
            <div className="h-12 bg-gray-100 rounded-md"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-blue-500" /> Upcoming Birthdays
        </CardTitle>
        <CardDescription>Members celebrating in the next 14 days</CardDescription>
      </CardHeader>
      <CardContent>
        {birthdays.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-2 py-6 text-center text-muted-foreground">
            <Gift className="h-8 w-8 text-gray-300" />
            <p>No upcoming birthdays found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {birthdays.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-lg border p-3 shadow-sm transition-all hover:bg-gray-50">
                <div>
                  <p className="font-semibold text-sm">{member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(2024, member.birthMonth - 1, member.birthDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {member.cellGroup?.name && ` • ${member.cellGroup.name}`}
                  </p>
                </div>
                {isAdmin && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/sms?preselect=${member.id}&message=Happy%20Birthday%20${encodeURIComponent(member.name)}!`}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Send SMS
                    </Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
