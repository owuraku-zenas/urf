"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift } from "lucide-react"

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
        <CardDescription>Members celebrating in the next 5 days</CardDescription>
      </CardHeader>
      <CardContent>
        {birthdays.length === 0 ? (
          <div className="flex flex-col items-center justify-center space-y-2 py-6 text-center text-muted-foreground">
            <Gift className="h-8 w-8 text-gray-300" />
            <p>No upcoming birthdays found.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {birthdays.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-lg border p-3 shadow-sm transition-all hover:bg-gray-50">
                <div>
                  <p className="font-semibold text-sm">{member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(2024, member.birthMonth - 1, member.birthDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {member.cellGroup?.name && ` • ${member.cellGroup.name}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
