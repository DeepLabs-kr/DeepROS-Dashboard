"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Node, NodeConnection, ROSDomain } from "@/lib/db"
import { MessageCircle, Settings, Zap, RefreshCw } from "lucide-react"

const nodeTypes = {
  topic: { icon: MessageCircle, color: "#3b82f6" },
  service: { icon: Settings, color: "#10b981" },
  action: { icon: Zap, color: "#8b5cf6" },
}

interface GraphNode extends Node {
  x: number
  y: number
}

export default function GraphPage() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [connections, setConnections] = useState<NodeConnection[]>([])
  const [domains, setDomains] = useState<ROSDomain[]>([])
  const [selectedDomain, setSelectedDomain] = useState<string>("all")
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([])
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    updateGraph()
  }, [nodes, connections, selectedDomain])

  const fetchData = async () => {
    try {
      const [nodesRes, connectionsRes, domainsRes] = await Promise.all([
        fetch("/api/nodes"),
        fetch("/api/connections"),
        fetch("/api/domains"),
      ])

      const [nodesData, connectionsData, domainsData] = await Promise.all([
        nodesRes.json(),
        connectionsRes.json(),
        domainsRes.json(),
      ])

      setNodes(nodesData)
      setConnections(connectionsData)
      setDomains(domainsData)
    } catch (error) {
      console.error("Failed to fetch data:", error)
    }
  }

  const updateGraph = () => {
    const filteredNodes =
      selectedDomain === "all" ? nodes : nodes.filter((node) => node.domain_id.toString() === selectedDomain)

    // Create graph layout using a simple force-directed approach
    const graphNodes: GraphNode[] = filteredNodes.map((node, index) => {
      const angle = (index / filteredNodes.length) * 2 * Math.PI
      const radius = Math.min(200, 50 + filteredNodes.length * 10)

      return {
        ...node,
        x: 300 + radius * Math.cos(angle),
        y: 200 + radius * Math.sin(angle),
      }
    })

    setGraphNodes(graphNodes)
  }

  const getFilteredConnections = () => {
    if (selectedDomain === "all") return connections

    return connections.filter((conn) => {
      const sourceNode = nodes.find((n) => n.id === conn.source_node_id)
      const targetNode = nodes.find((n) => n.id === conn.target_node_id)
      return sourceNode?.domain_id.toString() === selectedDomain || targetNode?.domain_id.toString() === selectedDomain
    })
  }

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(selectedNode?.id === node.id ? null : node)
  }

  const renderConnections = () => {
    const filteredConnections = getFilteredConnections()

    return filteredConnections.map((connection) => {
      const sourceNode = graphNodes.find((n) => n.id === connection.source_node_id)
      const targetNode = graphNodes.find((n) => n.id === connection.target_node_id)

      if (!sourceNode || !targetNode) return null

      const isActive = connection.status === "active"

      return (
        <g key={connection.id}>
          <line
            x1={sourceNode.x}
            y1={sourceNode.y}
            x2={targetNode.x}
            y2={targetNode.y}
            stroke={isActive ? "#10b981" : "#6b7280"}
            strokeWidth={isActive ? 3 : 2}
            strokeDasharray={isActive ? "none" : "5,5"}
            opacity={0.7}
          />
          <text
            x={(sourceNode.x + targetNode.x) / 2}
            y={(sourceNode.y + targetNode.y) / 2}
            textAnchor="middle"
            fontSize="10"
            fill="#6b7280"
            dy="-5"
          >
            {connection.connection_type}
          </text>
        </g>
      )
    })
  }

  const renderNodes = () => {
    return graphNodes.map((node) => {
      const nodeType = nodeTypes[node.node_type as keyof typeof nodeTypes]
      const Icon = nodeType.icon
      const isSelected = selectedNode?.id === node.id

      return (
        <g key={node.id} onClick={() => handleNodeClick(node)} style={{ cursor: "pointer" }}>
          <circle
            cx={node.x}
            cy={node.y}
            r={isSelected ? 35 : 30}
            fill={nodeType.color}
            opacity={0.2}
            stroke={nodeType.color}
            strokeWidth={isSelected ? 3 : 2}
          />
          <circle cx={node.x} cy={node.y} r={20} fill="white" stroke={nodeType.color} strokeWidth={2} />
          <foreignObject x={node.x - 10} y={node.y - 10} width={20} height={20}>
            <div className="flex items-center justify-center w-full h-full">
              <Icon className="h-4 w-4" style={{ color: nodeType.color }} />
            </div>
          </foreignObject>
          <text x={node.x} y={node.y + 45} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#374151">
            {node.name}
          </text>
          <text x={node.x} y={node.y + 60} textAnchor="middle" fontSize="10" fill="#6b7280">
            {node.domain_name}
          </text>
        </g>
      )
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Node Connection Graph</h1>
          <p className="text-gray-600">Visualize node interconnections across domains</p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedDomain} onValueChange={setSelectedDomain}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {domains.map((domain) => (
                <SelectItem key={domain.id} value={domain.id.toString()}>
                  {domain.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="h-[600px]">
            <CardContent className="p-4 h-full">
              <div className="w-full h-full overflow-auto">
                <svg width="100%" height="550" viewBox="0 0 600 400">
                  {renderConnections()}
                  {renderNodes()}
                </svg>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Graph Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Total Nodes:</span>
                <Badge variant="secondary">{graphNodes.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Total Connections:</span>
                <Badge variant="secondary">{getFilteredConnections().length}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Active Connections:</span>
                <Badge variant="secondary">
                  {getFilteredConnections().filter((conn) => conn.status === "active").length}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {selectedNode && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Node</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  {(() => {
                    const Icon = nodeTypes[selectedNode.node_type as keyof typeof nodeTypes].icon
                    return (
                      <Icon
                        className="h-4 w-4"
                        style={{ color: nodeTypes[selectedNode.node_type as keyof typeof nodeTypes].color }}
                      />
                    )
                  })()}
                  <span className="font-medium">{selectedNode.name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Domain: {selectedNode.domain_name}</div>
                  <div>Type: {selectedNode.node_type}</div>
                  <div>Status: {selectedNode.status}</div>
                  <div>Created: {new Date(selectedNode.created_at).toLocaleDateString()}</div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Node Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(nodeTypes).map(([type, config]) => {
                const Icon = config.icon
                const count = nodes.filter(
                  (node) =>
                    node.node_type === type &&
                    (selectedDomain === "all" || node.domain_id.toString() === selectedDomain),
                ).length

                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" style={{ color: config.color }} />
                      <span className="capitalize">{type}</span>
                    </div>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Connection Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {["publisher", "subscriber", "client", "server"].map((type) => {
                const count = getFilteredConnections().filter((conn) => conn.connection_type === type).length
                return (
                  <div key={type} className="flex items-center justify-between">
                    <span className="capitalize">{type}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {graphNodes.length === 0 && (
        <div className="text-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No nodes to display</h3>
          <p className="text-gray-500 mb-4">
            {selectedDomain !== "all"
              ? "No nodes found in the selected domain"
              : "Create some nodes and connections to see the graph"}
          </p>
        </div>
      )}
    </div>
  )
}
