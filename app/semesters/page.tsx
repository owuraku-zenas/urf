"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface Semester {
  id: string
  name: string
  startDate: string
  endDate: string
  academicYear: string
  status: "ACTIVE" | "CLOSED"
  isArchive: boolean
}

export default function SemestersPage() {
  const { data: session } = useSession()
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    academicYear: "",
    status: "ACTIVE",
    isArchive: false,
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

  function handleEditClick(semester: Semester) {
    setForm({
      name: semester.name,
      startDate: format(new Date(semester.startDate), "yyyy-MM-dd"),
      endDate: format(new Date(semester.endDate), "yyyy-MM-dd"),
      academicYear: semester.academicYear,
      status: semester.status,
      isArchive: semester.isArchive,
    })
    setEditingId(semester.id)
    setShowModal(true)
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this semester?")) return
    const res = await fetch(`/api/semesters/${id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success("Semester deleted")
      setSemesters(semesters.filter(s => s.id !== id))
    } else {
      toast.error(await res.text())
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const url = editingId ? `/api/semesters/${editingId}` : "/api/semesters"
    const method = editingId ? "PATCH" : "POST"
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
    
    if (res.ok) {
      setShowModal(false)
      const savedSemester = await res.json()
      if (editingId) {
        if (savedSemester.status === "ACTIVE") {
           setSemesters(prev => prev.map(s => s.id === editingId ? savedSemester : { ...s, status: "CLOSED" }))
        } else {
           setSemesters(prev => prev.map(s => s.id === editingId ? savedSemester : s))
        }
      } else {
        if (savedSemester.status === "ACTIVE") {
           setSemesters(prev => [savedSemester, ...prev.map(s => ({ ...s, status: "CLOSED" as const }))])
        } else {
           setSemesters(prev => [savedSemester, ...prev])
        }
      }
      toast.success(editingId ? "Semester updated successfully" : "Semester created successfully")
      setEditingId(null)
    } else {
      toast.error(await res.text())
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
                <Button variant="default" onClick={() => {
                  setEditingId(null)
                  setForm({ name: "", startDate: "", endDate: "", academicYear: "", status: "ACTIVE", isArchive: false })
                }}>Create Semester</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Semester" : "Create Semester"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.isArchive}
                      onChange={e => setForm(f => ({ ...f, isArchive: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Archive semester (for historical members before recorded semesters)
                  </label>
                  <Button type="submit" variant="default">{editingId ? "Save Changes" : "Create"}</Button>
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
                  <TableHead>Type</TableHead>
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
                      <TableCell>{semester.isArchive ? <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Archive</span> : <span className="text-gray-400 text-xs">Regular</span>}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(semester)}>Edit</Button>
                        {session?.user?.email === "urfzone4@gmail.com" && (
                           <Button variant="destructive" size="sm" className="ml-2" onClick={() => handleDelete(semester.id)}>Delete</Button>
                        )}
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
