"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"

interface Semester {
  id: string
  name: string
  startDate: string
  endDate: string
  academicYear: string
  status: "ACTIVE" | "CLOSED"
}

export default function SemestersPage() {
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    academicYear: "",
    status: "ACTIVE"
  })

  useEffect(() => {
    // Fetch semesters from API
    async function fetchSemesters() {
      setLoading(true)
      const res = await fetch("/api/semesters")
      if (res.ok) {
        setSemesters(await res.json())
      }
      setLoading(false)
    }
    fetchSemesters()
  }, [])

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleCreateSemester(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/semesters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
    if (res.ok) {
      setShowModal(false)
      setForm({ name: "", startDate: "", endDate: "", academicYear: "", status: "ACTIVE" })
      setSemesters(await res.json())
    }
  }

  return (
    <div className="py-10">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Semesters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <Dialog open={showModal} onOpenChange={setShowModal}>
              <DialogTrigger asChild>
                <Button variant="default">Create Semester</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Semester</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateSemester} className="space-y-4">
                  <Input name="name" value={form.name} onChange={handleInputChange} placeholder="Semester Name" required />
                  <Input name="academicYear" value={form.academicYear} onChange={handleInputChange} placeholder="Academic Year" required />
                  <Input name="startDate" type="date" value={form.startDate} onChange={handleInputChange} placeholder="Start Date" required />
                  <Input name="endDate" type="date" value={form.endDate} onChange={handleInputChange} placeholder="End Date" required />
                  <Select name="status" value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="submit" variant="default">Create</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                  </TableRow>
                ) : semesters.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No semesters found</TableCell>
                  </TableRow>
                ) : (
                  semesters.map(semester => (
                    <TableRow key={semester.id}>
                      <TableCell>{semester.name}</TableCell>
                      <TableCell>{semester.academicYear}</TableCell>
                      <TableCell>{format(new Date(semester.startDate), "yyyy-MM-dd")}</TableCell>
                      <TableCell>{format(new Date(semester.endDate), "yyyy-MM-dd")}</TableCell>
                      <TableCell>{semester.status === "ACTIVE" ? <span className="font-medium text-green-600">Active</span> : <span className="font-medium text-gray-400">Closed</span>}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Edit</Button>
                        <Button variant="destructive" size="sm" className="ml-2">Delete</Button>
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
  )
}
