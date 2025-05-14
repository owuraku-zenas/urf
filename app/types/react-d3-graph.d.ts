declare module 'react-d3-graph' {
  import { Component } from 'react'

  interface NodeConfig {
    color?: string
    size?: number
    highlightStrokeColor?: string
    labelProperty?: string
    fontSize?: number
    fontColor?: string
    fontWeight?: string
    highlightFontSize?: number
    highlightFontWeight?: string
    highlightFontColor?: string
    highlightColor?: string
    highlightStrokeWidth?: number
    opacity?: number
    renderLabel?: boolean
    symbolType?: string
    viewGenerator?: null | ((node: any) => any)
  }

  interface LinkConfig {
    highlightColor?: string
    highlightFontSize?: number
    highlightFontWeight?: string
    highlightFontColor?: string
    highlightStrokeWidth?: number
    opacity?: number
    semanticStrokeWidth?: boolean
    strokeWidth?: number
    markerHeight?: number
    markerWidth?: number
    type?: string
  }

  interface D3Config {
    alphaTarget?: number
    gravity?: number
    linkLength?: number
    linkStrength?: number
    disableLinkForce?: boolean
  }

  interface GraphConfig {
    nodeHighlightBehavior?: boolean
    node?: NodeConfig
    link?: LinkConfig
    d3?: D3Config
  }

  interface GraphData {
    nodes: Array<{
      id: string
      label: string
      size: number
      color: string
    }>
    links: Array<{
      source: string
      target: string
    }>
  }

  interface GraphProps {
    id: string
    data: GraphData
    config: GraphConfig
  }

  export class Graph extends Component<GraphProps> {}
} 