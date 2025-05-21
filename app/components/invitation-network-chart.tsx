"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import dynamic from 'next/dynamic'

// Import ForceGraph2D with no SSR and loading fallback
const ForceGraph2D = dynamic(
  () => import('react-force-graph-2d').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full flex items-center justify-center">
        <p>Loading graph...</p>
      </div>
    ),
  }
)

interface Member {
  id: string
  name: string
  invitedBy: {
    id: string
    name: string
  } | null
  invitees: Array<{
    id: string
    name: string
    createdAt: string
  }>
  cellGroup: {
    id: string
    name: string
  } | null
}

interface GraphData {
  nodes: Array<{
    id: string
    name: string
    val: number
    color: string
  }>
  links: Array<{
    source: string
    target: string
  }>
}

export default function InvitationNetworkChart() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [width, setWidth] = useState(0)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  useEffect(() => {
    const updateWidth = () => {
      const container = document.getElementById('graph-container')
      if (container) {
        setWidth(container.offsetWidth)
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/members')
        if (!response.ok) {
          throw new Error('Failed to fetch members')
        }
        const data = await response.json()
        setMembers(data)
        setError(null)
      } catch (error) {
        console.error('Error fetching members:', error)
        setError('Failed to load member data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredMembers = members.map(member => ({
    ...member,
    invitees: member.invitees.filter(invitee => {
      const inviteeDate = new Date(invitee.createdAt)
      return (!startDate || inviteeDate >= new Date(startDate)) &&
        (!endDate || inviteeDate <= new Date(endDate + 'T23:59:59'))
    })
  }))

  const graphData: GraphData = {
    nodes: filteredMembers.map(member => ({
      id: member.id,
      name: member.name,
      val: Math.max(1, member.invitees.length + 1), // Size based on number of invitees
      color: member.invitedBy ? '#8884d8' : '#82ca9d' // Different color for inviters
    })),
    links: filteredMembers
      .filter(member => member.invitedBy)
      .map(member => ({
        source: member.invitedBy!.id,
        target: member.id
      }))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
          <CardDescription>Please wait while we fetch the data.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitation Network</CardTitle>
        <CardDescription>
          Visual representation of member invitations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full sm:w-[180px]"
              placeholder="Start date"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full sm:w-[180px]"
              placeholder="End date"
            />
            <Button
              variant="outline"
              onClick={() => {
                setStartDate("")
                setEndDate("")
              }}
              className="w-full sm:w-auto"
            >
              Clear Dates
            </Button>
          </div>
        </div>

        <div id="graph-container" className="h-[400px] w-full border rounded-lg">
          {typeof window !== 'undefined' && width > 0 && (
            <ForceGraph2D
              width={width}
              height={400}
              graphData={graphData}
              nodeLabel="name"
              nodeRelSize={6}
              linkDirectionalArrowLength={6}
              linkDirectionalArrowRelPos={1}
              nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
                const label = node.name
                const fontSize = 12/globalScale
                ctx.font = `${fontSize}px Sans-Serif`
                const textWidth = ctx.measureText(label).width
                const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2)

                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
                ctx.fillRect(
                  node.x! - bckgDimensions[0] / 2,
                  node.y! - bckgDimensions[1] / 2,
                  bckgDimensions[0],
                  bckgDimensions[1]
                )

                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillStyle = node.color
                ctx.fillText(label, node.x!, node.y!)
              }}
              onEngineStop={() => {
                // Force a re-render after the graph stabilizes
                const container = document.getElementById('graph-container')
                if (container) {
                  container.style.opacity = '1'
                }
              }}
            />
          )}
        </div>
        <div className="mt-4">
          <div className="p-2 bg-gray-50 rounded">
            <h4 className="font-medium mb-2">Most Active Inviters</h4>
            {filteredMembers
              .sort((a, b) => b.invitees.length - a.invitees.length)
              .slice(0, 3)
              .map(member => (
                <div key={member.id} className="text-sm text-gray-600">
                  {member.name}: {member.invitees.length} invitees
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 