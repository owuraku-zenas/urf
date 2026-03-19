"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"

interface SmsDashboardProps {
  initialMembers: any[]
  initialLogs: any[]
  activeSemesterId: string | null
}

export default function SmsDashboard({ initialMembers, initialLogs, activeSemesterId }: SmsDashboardProps) {
  const { toast } = useToast()

  // State
  const [members, setMembers] = useState(initialMembers)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [activeTab, setActiveTab] = useState<"compose" | "history">("compose")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterMode, setFilterMode] = useState<"all" | "committed" | "level100" | "active">("all")

  // Filter members based on search and quick filters
  const filteredMembers = members.filter(member => {
    // 1. Search Query
    if (searchQuery && !member.name.toLowerCase().includes(searchQuery.toLowerCase()) && !member.phone.includes(searchQuery)) {
      return false
    }

    // 2. Quick Filters
    if (filterMode === "committed") {
      return member.commitments?.some((c: any) => c.semesterId === activeSemesterId && c.status === "COMMITTED")
    }
    if (filterMode === "level100") {
      return member.currentAcademicLevel === "100"
    }
    if (filterMode === "active") {
      return member.commitments?.some((c: any) => c.semesterId === activeSemesterId)
    }

    return true
  })

  // Handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredMembers.map(m => m.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleSend = async () => {
    if (selectedIds.length === 0) {
      toast({ title: "Error", description: "Please select at least one recipient.", variant: "destructive" })
      return
    }
    if (!message.trim()) {
      toast({ title: "Error", description: "Message cannot be empty.", variant: "destructive" })
      return
    }

    setIsSending(true)
    try {
      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientIds: selectedIds,
          message: message
        })
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || "Failed to send broadcast")

      toast({ title: "Broadcast Queued", description: data.message })
      setMessage("") // Clear the composer
      setSelectedIds([]) // Clear selection
    } catch (error) {
      toast({
        title: "Broadcast Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b pb-2">
        <button
          onClick={() => setActiveTab("compose")}
          className={`pb-2 font-medium text-sm transition-colors ${activeTab === "compose" ? "border-b-2 border-primary text-primary" : "text-gray-500 hover:text-gray-900"}`}
        >
          Compose Message
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-2 font-medium text-sm transition-colors ${activeTab === "history" ? "border-b-2 border-primary text-primary" : "text-gray-500 hover:text-gray-900"}`}
        >
          Delivery History
        </button>
      </div>

      {activeTab === "compose" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Member Selection Table */}
          <div className="lg:col-span-3 border rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">Select Recipients</h3>
              <span className="text-sm text-gray-500">{selectedIds.length} selected</span>
            </div>

            <div className="p-4 border-b bg-white flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-gray-500 mr-1">Filters:</span>
                <button
                  onClick={() => setFilterMode("all")}
                  className={`px-3 py-1 text-xs rounded-full border ${filterMode === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                >All</button>
                <button
                  onClick={() => setFilterMode("committed")}
                  className={`px-3 py-1 text-xs rounded-full border ${filterMode === "committed" ? "bg-primary text-primary-foreground border-primary" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                >Committed Only</button>
                <button
                  onClick={() => setFilterMode("level100")}
                  className={`px-3 py-1 text-xs rounded-full border ${filterMode === "level100" ? "bg-primary text-primary-foreground border-primary" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                >Level 100s</button>
                <button
                  onClick={() => setFilterMode("active")}
                  className={`px-3 py-1 text-xs rounded-full border ${filterMode === "active" ? "bg-primary text-primary-foreground border-primary" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                >Active Semester</button>
              </div>
              <input
                type="text"
                placeholder="Search name or phone..."
                className="text-sm border rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No members match the current filters.</div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="p-4 w-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedIds.length === filteredMembers.length && filteredMembers.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Phone</th>
                      <th className="px-6 py-3">Level</th>
                      <th className="px-6 py-3 hidden md:table-cell">Cell Group</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map(member => (
                      <tr key={member.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="p-4">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={selectedIds.includes(member.id)}
                            onChange={() => handleSelectOne(member.id)}
                          />
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">{member.name}</td>
                        <td className="px-6 py-4 text-gray-500">{member.phone}</td>
                        <td className="px-6 py-4 text-gray-500">{member.currentAcademicLevel || "-"}</td>
                        <td className="px-6 py-4 hidden md:table-cell text-gray-500">
                          {member.cellGroup?.name || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Composer Box (Always visible when composing) */}
      {activeTab === "compose" && (
        <div className="space-y-4">
          <div className="border rounded-lg p-6 bg-white shadow-sm sticky top-6">
            <h3 className="font-semibold text-gray-700 mb-4">Compose Broadcast</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message Body
                </label>
                <textarea
                  className="w-full min-h-[200px] rounded-md border border-gray-300 shadow-sm px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm"
                  placeholder="Type your announcement here... Use {{name}} to personalize."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">
                    {message.length} chars (approx {Math.ceil(message.length / 160) || 1} SMS credits)
                  </span>
                  <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                    Supports {"{{name}}"}
                  </span>
                </div>
              </div>

              <Button
                className="w-full"
                disabled={isSending || selectedIds.length === 0 || !message.trim()}
                onClick={handleSend}
              >
                {isSending ? "Dispatching..." : `Send to ${selectedIds.length} Members`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="border rounded-lg overflow-hidden bg-white shadow-sm p-6">
          <h3 className="font-semibold text-gray-700 mb-4">Recent Broadasts</h3>
          {initialLogs.length === 0 ? (
            <p className="text-gray-500 text-sm">No SMS history recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Recipient</th>
                    <th className="px-6 py-3">Phone</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Error</th>
                  </tr>
                </thead>
                <tbody>
                  {initialLogs.map(log => (
                    <tr key={log.id} className="bg-white border-b">
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{log.member?.name || "Unknown"}</td>
                      <td className="px-6 py-4 text-gray-500">{log.phoneNumber}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${log.status === "SENT" || log.status === "DELIVERED" ? "bg-green-100 text-green-800" :
                          log.status === "FAILED" ? "bg-red-100 text-red-800" :
                            "bg-yellow-100 text-yellow-800"
                          }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-red-500 max-w-[200px] truncate" title={log.errorMessage || ""}>
                        {log.errorMessage || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
