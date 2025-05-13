"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Search } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function EventAttendancePage({ params }: { params: { eventId: string } }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [attendees, setAttendees] = useState<
    { id: string; name: string; cellGroup: string; phone: string; present: boolean }[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [event, setEvent] = useState<{ name: string; date: string }>({ name: "", date: "" })

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      // Mock event data
      setEvent({
        name: "Sunday Service",
        date: "April 21, 2024",
      })

      // Mock member data
      setAttendees([
        { id: "1", name: "John Doe", cellGroup: "Campus Fellowship", phone: "0123456789", present: false },
        { id: "2", name: "Jane Smith", cellGroup: "Graduate Group", phone: "0123456788", present: true },
        { id: "3", name: "Michael Johnson", cellGroup: "Campus Fellowship", phone: "0123456787", present: false },
        { id: "4", name: "Sarah Williams", cellGroup: "Freshers Group", phone: "0123456786", present: true },
        { id: "5", name: "David Brown", cellGroup: "Graduate Group", phone: "0123456785", present: false },
        { id: "6", name: "Emily Davis", cellGroup: "Campus Fellowship", phone: "0123456784", present: true },
        { id: "7", name: "Robert Wilson", cellGroup: "Freshers Group", phone: "0123456783", present: false },
        { id: "8", name: "Jennifer Taylor", cellGroup: "Graduate Group", phone: "0123456782", present: true },
      ])
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [params.eventId])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleCheckboxChange = (id: string) => {
    setAttendees((prev) =>
      prev.map((attendee) => (attendee.id === id ? { ...attendee, present: !attendee.present } : attendee)),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Success",
        description: "Attendance has been saved successfully",
      })

      // In a real app, you would redirect to the attendance page
      // router.push("/attendance")
    } catch (error) {
      console.error("Error saving attendance:", error)
      toast({
        title: "Error",
        description: "Failed to save attendance. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const filteredAttendees = attendees.filter(
    (attendee) =>
      attendee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.cellGroup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attendee.phone.includes(searchTerm),
  )

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/attendance">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Attendance
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{event.name}</CardTitle>
          <CardDescription>Mark attendance for {event.date}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search members..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Present</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Cell Group</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      Loading members...
                    </TableCell>
                  </TableRow>
                ) : filteredAttendees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No members found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttendees.map((attendee) => (
                    <TableRow key={attendee.id}>
                      <TableCell>
                        <Checkbox
                          checked={attendee.present}
                          onCheckedChange={() => handleCheckboxChange(attendee.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{attendee.name}</TableCell>
                      <TableCell>{attendee.cellGroup}</TableCell>
                      <TableCell>{attendee.phone}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href="/attendance">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading || isSaving}>
              {isSaving ? "Saving..." : "Save Attendance"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
