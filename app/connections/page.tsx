"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, ArrowRight, GitBranch, Network, Shuffle, Filter } from "lucide-react"
import type { Node, NodeConnection, ROSDomain } from "@/lib/db"

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<NodeConnection[]>([])
  const [nodes, setNodes] = useState<Node[]>([])
  const [domains, setDomains] = useState<ROSDomain[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingConnection, setEditingConnection] = useState<NodeConnection | null>(null)
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>("all")
  const [formData, setFormData] = useState({
    source_node_id: "",
    target_node_id: "",
    connection_type: "publisher" as const,
    status: "active" as const,
    metadata: {},
  })

  useEffect(() => {
    fetchConnections()
    fetchNodes()
    fetchDomains()
  }, [])

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/connections")
      const data = await response.json()
      setConnections(data)
    } catch (error) {
      console.error("Failed to fetch connections:", error)
    }
  }

  const fetchNodes = async () => {
    try {
      const response = await fetch("/api/nodes")
      const data = await response.json()
      setNodes(data)
    } catch (error) {
      console.error("Failed to fetch nodes:", error)
    }
  }

  const fetchDomains = async () => {
    try {
      const response = await fetch("/api/domains")
      const data = await response.json()
      setDomains(data)
    } catch (error) {
      console.error("Failed to fetch domains:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingConnection ? `/api/connections/${editingConnection.id}` : "/api/connections"
      const method = editingConnection ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchConnections()
        setIsCreateOpen(false)
        setEditingConnection(null)
        setFormData({
          source_node_id: "",
          target_node_id: "",
          connection_type: "publisher",
          status: "active",
          metadata: {},
        })
      }
    } catch (error) {
      console.error("Failed to save connection:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this connection?")) {
      try {
        const response = await fetch(`/api/connections/${id}`, { method: "DELETE" })
        if (response.ok) {
          fetchConnections()
        }
      } catch (error) {
        console.error("Failed to delete connection:", error)
      }
    }
  }

  const getConnectionTypeColor = (type: string) => {
    switch (type) {
      case "publisher":
        return "bg-blue-100 text-blue-800"
      case "subscriber":
        return "bg-green-100 text-green-800"
      case "client":
        return "bg-purple-100 text-purple-800"
      case "server":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // 도메인 내부 연결과 크로스 도메인 연결 분리
  const internalConnections = connections.filter((conn) => conn.source_domain_name === conn.target_domain_name)

  const crossDomainConnections = connections.filter((conn) => conn.source_domain_name !== conn.target_domain_name)

  // 도메인별로 그룹화된 내부 연결
  const connectionsByDomain = domains.reduce(
    (acc, domain) => {
      acc[domain.name] = internalConnections.filter((conn) => conn.source_domain_name === domain.name)
      return acc
    },
    {} as Record<string, NodeConnection[]>,
  )

  // 필터링된 연결들
  const getFilteredConnections = (connectionList: NodeConnection[]) => {
    if (selectedDomainFilter === "all") return connectionList
    return connectionList.filter(
      (conn) => conn.source_domain_name === selectedDomainFilter || conn.target_domain_name === selectedDomainFilter,
    )
  }

  // 크로스 도메인 연결을 도메인 쌍별로 그룹화
  const crossDomainGroups = crossDomainConnections.reduce(
    (acc, conn) => {
      const key = `${conn.source_domain_name} ↔ ${conn.target_domain_name}`
      if (!acc[key]) acc[key] = []
      acc[key].push(conn)
      return acc
    },
    {} as Record<string, NodeConnection[]>,
  )

  const renderConnectionCard = (connection: NodeConnection, showDomainInfo = false) => (
    <Card key={connection.id} className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="text-center min-w-0 flex-1">
              <div className="font-medium truncate">{connection.source_node_name}</div>
              {showDomainInfo && <div className="text-xs text-gray-500 truncate">{connection.source_domain_name}</div>}
            </div>
            <div className="flex flex-col items-center">
              <ArrowRight className="h-5 w-5 text-gray-400" />
              <Badge className={`${getConnectionTypeColor(connection.connection_type)} text-xs mt-1`}>
                {connection.connection_type}
              </Badge>
            </div>
            <div className="text-center min-w-0 flex-1">
              <div className="font-medium truncate">{connection.target_node_name}</div>
              {showDomainInfo && <div className="text-xs text-gray-500 truncate">{connection.target_domain_name}</div>}
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <Badge className={getStatusColor(connection.status)}>{connection.status}</Badge>
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingConnection(connection)
                  setFormData({
                    source_node_id: connection.source_node_id.toString(),
                    target_node_id: connection.target_node_id.toString(),
                    connection_type: connection.connection_type,
                    status: connection.status,
                    metadata: connection.metadata,
                  })
                  setIsCreateOpen(true)
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(connection.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Created: {new Date(connection.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Connection Management</h1>
          <p className="text-gray-600">Manage connections between nodes across domains</p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedDomainFilter} onValueChange={setSelectedDomainFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by domain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {domains.map((domain) => (
                <SelectItem key={domain.id} value={domain.name}>
                  {domain.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Connection
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingConnection ? "Edit Connection" : "Create New Connection"}</DialogTitle>
                <DialogDescription>
                  {editingConnection ? "Update the connection information" : "Create a new connection between nodes"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="source">Source Node</Label>
                  <Select
                    value={formData.source_node_id}
                    onValueChange={(value) => setFormData({ ...formData, source_node_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source node" />
                    </SelectTrigger>
                    <SelectContent>
                      {nodes.map((node) => (
                        <SelectItem key={node.id} value={node.id.toString()}>
                          {node.name} ({node.domain_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="target">Target Node</Label>
                  <Select
                    value={formData.target_node_id}
                    onValueChange={(value) => setFormData({ ...formData, target_node_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target node" />
                    </SelectTrigger>
                    <SelectContent>
                      {nodes.map((node) => (
                        <SelectItem key={node.id} value={node.id.toString()}>
                          {node.name} ({node.domain_name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">Connection Type</Label>
                  <Select
                    value={formData.connection_type}
                    onValueChange={(value: any) => setFormData({ ...formData, connection_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="publisher">Publisher</SelectItem>
                      <SelectItem value="subscriber">Subscriber</SelectItem>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="server">Server</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false)
                      setEditingConnection(null)
                      setFormData({
                        source_node_id: "",
                        target_node_id: "",
                        connection_type: "publisher",
                        status: "active",
                        metadata: {},
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">{editingConnection ? "Update" : "Create"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Connections</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connections.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Internal Connections</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{internalConnections.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cross-Domain</CardTitle>
            <Shuffle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crossDomainConnections.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connections</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connections.filter((c) => c.status === "active").length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="internal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="internal" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Internal Connections
          </TabsTrigger>
          <TabsTrigger value="cross-domain" className="flex items-center gap-2">
            <Shuffle className="h-4 w-4" />
            Cross-Domain Connections
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            All Connections
          </TabsTrigger>
        </TabsList>

        <TabsContent value="internal" className="mt-6">
          <div className="space-y-6">
            {domains.map((domain) => {
              const domainConnections = getFilteredConnections(connectionsByDomain[domain.name] || [])
              if (
                domainConnections.length === 0 &&
                selectedDomainFilter !== "all" &&
                selectedDomainFilter !== domain.name
              ) {
                return null
              }

              return (
                <Card key={domain.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Network className="h-5 w-5" />
                      {domain.name}
                      <Badge variant="outline">{domainConnections.length} connections</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {domainConnections.length > 0 ? (
                      <div className="space-y-2">
                        {domainConnections.map((connection) => renderConnectionCard(connection, false))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Network className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No internal connections in this domain</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="cross-domain" className="mt-6">
          <div className="space-y-6">
            {Object.entries(crossDomainGroups).map(([domainPair, connections]) => {
              const filteredConnections = getFilteredConnections(connections)
              if (filteredConnections.length === 0) return null

              return (
                <Card key={domainPair} className="border-l-4 border-l-purple-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shuffle className="h-5 w-5 text-purple-600" />
                      {domainPair}
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        {filteredConnections.length} connections
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {filteredConnections.map((connection) => renderConnectionCard(connection, true))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            {Object.keys(crossDomainGroups).length === 0 && (
              <div className="text-center py-12">
                <Shuffle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No cross-domain connections</h3>
                <p className="text-gray-500 mb-4">Create connections between nodes in different domains</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {getFilteredConnections(connections).map((connection) => renderConnectionCard(connection, true))}
            {getFilteredConnections(connections).length === 0 && (
              <div className="text-center py-12">
                <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No connections found</h3>
                <p className="text-gray-500 mb-4">
                  {selectedDomainFilter !== "all"
                    ? `No connections found for ${selectedDomainFilter}`
                    : "Get started by creating your first node connection"}
                </p>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Connection
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
