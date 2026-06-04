"use client"

import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

const MONTHS = [
  { value: 1, label: "January" }, { value: 2, label: "February" },
  { value: 3, label: "March" }, { value: 4, label: "April" },
  { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" },
  { value: 9, label: "September" }, { value: 10, label: "October" },
  { value: 11, label: "November" }, { value: 12, label: "December" },
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: currentYear - 2009 }, (_, i) => currentYear - i)

function formatMonthYear(date: string | null) {
  if (!date) return "—"
  const d = new Date(date)
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

interface Semester {
  id: string
  name: string
  startDate: string | null
  endDate: string | null
  academicYear: string
  status: "ACTIVE" | "CLOSED"
  isArchive: boolean
}

interface FormState {
  name: string
  academicYear: string
  startMonth: number
  startYear: number
  endMonth: number
  endYear: number
  status: string
  isArchive: boolean
}

const emptyForm = (): FormState => ({
  name: "",
  academicYear: "",
  startMonth: new Date().getMonth() + 1,
  startYear: currentYear,
  endMonth: new Date().getMonth() + 1,
  endYear: currentYear,
  status: "ACTIVE",
  isArchive: false,
})

export default function SemestersPage() {
  const { data: session } = useSession()
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [migrating, setMigrating] = useState(false)
  const [recalculating, setRecalculating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())

  useEffect(() => {
    async function fetchSemesters() {
      setLoading(true)
      const res = await fetch("/api/semesters")
      if (res.ok) setSemesters(await res.json())
      setLoading(false)
    }
    fetchSemesters()
  }, [])

  function handleEditClick(semester: Semester) {
    const startD = semester.startDate ? new Date(semester.startDate) : null
    const endD = semester.endDate ? new Date(semester.endDate) : null
    setForm({
      name: semester.name,
      academicYear: semester.academicYear,
      startMonth: startD ? startD.getMonth() + 1 : 1,
      startYear: startD ? startD.getFullYear() : currentYear,
      endMonth: endD ? endD.getMonth() + 1 : 12,
      endYear: endD ? endD.getFullYear() : currentYear,
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

  async function handleMigrateLegacy() {
    setMigrating(true)
    try {
      const res = await fetch("/api/admin/migrate-legacy", { method: "POST" })
      const data = await res.json()
      if (res.ok) toast.success(data.message)
      else toast.error(data.error || "Migration failed")
    } catch {
      toast.error("Failed to run migration")
    } finally {
      setMigrating(false)
    }
  }

  async function handleRecalculate() {
    setRecalculating(true)
    try {
      const res = await fetch("/api/admin/recalculate-commitments", { method: "POST" })
      const data = await res.json()
      if (res.ok) toast.success(data.message)
      else toast.error(data.error || "Recalculation failed")
    } catch {
      toast.error("Failed to run recalculation")
    } finally {
      setRecalculating(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const url = editingId ? `/api/semesters/${editingId}` : "/api/semesters"
    const method = editingId ? "PATCH" : "POST"

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      setShowModal(false)
      const saved: Semester = await res.json()
      if (editingId) {
        setSemesters(prev =>
          saved.status === "ACTIVE"
            ? prev.map(s => s.id === editingId ? saved : { ...s, status: "CLOSED" as const })
            : prev.map(s => s.id === editingId ? saved : s)
        )
      } else {
        setSemesters(prev =>
          saved.status === "ACTIVE"
            ? [saved, ...prev.map(s => ({ ...s, status: "CLOSED" as const }))]
            : [saved, ...prev]
        )
      }
      toast.success(editingId ? "Semester updated" : "Semester created")
      setEditingId(null)
    } else {
      toast.error(await res.text())
    }
  }

  function setF(patch: Partial<FormState>) {
    setForm(f => ({ ...f, ...patch }))
  }

  return (
    <div className="py-10">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Semesters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex justify-end">
            <Dialog open={showModal} onOpenChange={open => { setShowModal(open); if (!open) setEditingId(null) }}>
              <DialogTrigger asChild>
                <Button variant="default" onClick={() => { setEditingId(null); setForm(emptyForm()) }}>
                  Create Semester
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit Semester" : "Create Semester"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    value={form.name}
                    onChange={e => setF({ name: e.target.value })}
                    placeholder="Semester Name"
                    required
                  />
                  <Input
                    value={form.academicYear}
                    onChange={e => setF({ academicYear: e.target.value })}
                    placeholder="Academic Year (e.g. 2025/2026)"
                    required
                  />

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Start month</p>
                      <div className="flex gap-2">
                        <Select value={String(form.startMonth)} onValueChange={v => setF({ startMonth: Number(v) })}>
                          <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {MONTHS.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select value={String(form.startYear)} onValueChange={v => setF({ startYear: Number(v) })}>
                          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-1">End month</p>
                      <div className="flex gap-2">
                        <Select value={String(form.endMonth)} onValueChange={v => setF({ endMonth: Number(v) })}>
                          <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {MONTHS.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select value={String(form.endYear)} onValueChange={v => setF({ endYear: Number(v) })}>
                          <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Select value={form.status} onValueChange={v => setF({ status: v })}>
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.isArchive}
                      onChange={e => setF({ isArchive: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    Archive semester (historical members before recorded semesters)
                  </label>

                  <Button type="submit">{editingId ? "Save Changes" : "Create"}</Button>
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
                  <TableHead>Start</TableHead>
                  <TableHead>End</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="text-center">Loading...</TableCell></TableRow>
                ) : semesters.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center">No semesters found</TableCell></TableRow>
                ) : semesters.map(semester => (
                  <TableRow key={semester.id}>
                    <TableCell>{semester.name}</TableCell>
                    <TableCell>{semester.academicYear}</TableCell>
                    <TableCell>{formatMonthYear(semester.startDate)}</TableCell>
                    <TableCell>{formatMonthYear(semester.endDate)}</TableCell>
                    <TableCell>
                      {semester.status === "ACTIVE"
                        ? <span className="font-medium text-green-600">Active</span>
                        : <span className="font-medium text-gray-400">Closed</span>}
                    </TableCell>
                    <TableCell>
                      {semester.isArchive
                        ? <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Archive</span>
                        : <span className="text-gray-400 text-xs">Regular</span>}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(semester)}>Edit</Button>
                      {session?.user?.email === "urfzone4@gmail.com" && (
                        <Button variant="destructive" size="sm" className="ml-2" onClick={() => handleDelete(semester.id)}>Delete</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Maintenance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Recalculate Commitment Scores</p>
                <p className="mt-1 text-sm text-gray-500">
                  Recalculates commitment status for every member across all semesters based on
                  their attendance records. Run this after adding historical attendance data or if
                  scores look incorrect.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleRecalculate} disabled={recalculating} className="shrink-0">
                {recalculating ? "Running..." : "Recalculate"}
              </Button>
            </div>
            <div className="flex items-start gap-4 border-t pt-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Fix Legacy Member Status</p>
                <p className="mt-1 text-sm text-gray-500">
                  Updates members whose join date falls outside all recorded semester ranges from
                  <span className="font-medium"> NEW MEMBER</span> to
                  <span className="font-medium"> LEGACY</span>. Run this once after creating an archive
                  semester, or if you notice historical members showing incorrect statuses.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleMigrateLegacy} disabled={migrating} className="shrink-0">
                {migrating ? "Running..." : "Run Migration"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
