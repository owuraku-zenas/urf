declare module 'react-vis-force' {
  import { Component } from 'react'

  interface SimulationOptions {
    height?: number
    width?: number
    animate?: boolean
    labelAttr?: string
    nodeRelSize?: number
    linkDistance?: number
    chargeStrength?: number
    linkStrength?: number
  }

  interface GraphData {
    nodes: Array<{
      id: string
      label: string
      radius: number
      color: string
    }>
    links: Array<{
      source: string
      target: string
    }>
  }

  interface ForceGraphProps {
    simulationOptions: SimulationOptions
    graph: GraphData
  }

  export class ForceGraph extends Component<ForceGraphProps> {}
} 