"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Eye } from "lucide-react"
import { useSession } from "next-auth/react"

interface Event {
  id: string
  name: string
  type: 'MIDWEEK' | 'SUNDAY' | 'PRAYER' | 'SPECIAL'
  date: string
  description: string | null
  attendance: {
    id: string
    member: {
      id: string
      name: string
    }
  }[]
}

export default function EventsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [events, setEvents] = useState<Event[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/events')
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }
        const data = await response.json()
        setEvents(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formatEventType(event.type).toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || event.type === selectedType
    return matchesSearch && matchesType
  })

  if (error) {
    return (
      <main className="flex-1">
        <div className="w-full max-w-7xl mx-auto px-5 py-10">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-800">Error</CardTitle>
              <CardDescription className="text-red-600">{error}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1">
      <div className="w-full max-w-7xl mx-auto px-5 py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Church Events</h1>
          {isAdmin && (
            <Button asChild className="w-full sm:w-auto">
              <Link href="/events/new">
                <Plus className="mr-2 h-4 w-4" />
                Create New Event
              </Link>
            </Button>
          )}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Event Search</CardTitle>
            <CardDescription>Search for events by name, type, or date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search events..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="MIDWEEK">Midweek Service</SelectItem>
                  <SelectItem value="SUNDAY">Sunday Service</SelectItem>
                  <SelectItem value="PRAYER">Prayer Service</SelectItem>
                  <SelectItem value="SPECIAL">Special Program</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Events</CardTitle>
            <CardDescription>Showing {filteredEvents.length} church events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden sm:table-cell">Date</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        Loading events...
                      </TableCell>
                    </TableRow>
                  ) : filteredEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No events found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.name}</TableCell>
                        <TableCell>{formatEventType(event.type)}</TableCell>
                        <TableCell className="hidden sm:table-cell">{new Date(event.date).toLocaleDateString()}</TableCell>
                        <TableCell>{event.attendance.length}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild className="w-full sm:w-auto">
                            <Link href={`/events/${event.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              <span className="hidden sm:inline">View Event</span>
                              <span className="sm:hidden">View</span>
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function formatEventType(type: string) {
  const types = {
    MIDWEEK: "Midweek Service",
    SUNDAY: "Sunday Service",
    PRAYER: "Prayer Service",
    SPECIAL: "Special Program",
  }
  return types[type as keyof typeof types] || type
}
