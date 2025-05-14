"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from 'next/dynamic'

const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false
})

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
  const [width, setWidth] = useState(0)

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
      } catch (error) {
        console.error('Error fetching members:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const graphData: GraphData = {
    nodes: members.map(member => ({
      id: member.id,
      name: member.name,
      val: Math.max(1, member.invitees.length + 1), // Size based on number of invitees
      color: member.invitedBy ? '#8884d8' : '#82ca9d' // Different color for inviters
    })),
    links: members
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitation Network</CardTitle>
        <CardDescription>
          Visual representation of member invitations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div id="graph-container" className="h-[400px] w-full">
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
            />
          )}
        </div>
        <div className="mt-4">
          <div className="p-2 bg-gray-50 rounded">
            <h4 className="font-medium mb-2">Most Active Inviters</h4>
            {members
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