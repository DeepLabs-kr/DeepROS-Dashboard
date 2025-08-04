"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Plus, Edit, Trash2, MessageCircle, Settings, Zap } from "lucide-react"
import type { Node, ROSDomain } from "@/lib/db"

export default function NodesPage() {
  const [nodes, setNodes] = useState<Node[]>([])
  const [domains, setDomains] = useState<ROSDomain[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingNode, setEditingNode] = useState<Node | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<string>("all")
  const [formData, setFormData] = useState({
    name: "",
    domain_id: "",
    node_type: "topic" as const,
    status: "active" as const,
    metadata: {},
  })

  useEffect(() => {
    fetchNodes()
    fetchDomains()
  }, [])

  const fetchNodes = async () => {
    try {
      const url = selectedDomain !== "all" ? `/api/nodes?domain_id=${selectedDomain}` : "/api/nodes"
      const response = await fetch(url)
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

  useEffect(() => {
    fetchNodes()
  }, [selectedDomain])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingNode ? `/api/nodes/${editingNode.id}` : "/api/nodes"
      const method = editingNode ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchNodes()
        setIsCreateOpen(false)
        setEditingNode(null)
        setFormData({ name: "", domain_id: "", node_type: "topic", status: "active", metadata: {} })
      }
    } catch (error) {
      console.error("Failed to save node:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this node?")) {
      try {
        const response = await fetch(`/api/nodes/${id}`, { method: "DELETE" })
        if (response.ok) {
          fetchNodes()
        }
      } catch (error) {
        console.error("Failed to delete node:", error)
      }
    }
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "topic":
        return <MessageCircle className="h-4 w-4" />
      case "service":
        return <Settings className="h-4 w-4" />
      case "action":
        return <Zap className="h-4 w-4" />
      default:
        return <MessageCircle className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "topic":
        return "bg-blue-100 text-blue-800"
      case "service":
        return "bg-green-100 text-green-800"
      case "action":
        return "bg-purple-100 text-purple-800"
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
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Node Management</h1>
          <p className="text-gray-600">Manage Topics, Services, and Actions across domains</p>
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
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Node
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingNode ? "Edit Node" : "Create New Node"}</DialogTitle>
                <DialogDescription>
                  {editingNode ? "Update the node information" : "Create a new node in a ROS domain"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Node Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter node name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="domain">Domain</Label>
                  <Select
                    value={formData.domain_id}
                    onValueChange={(value) => setFormData({ ...formData, domain_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select domain" />
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
                </div>
                <div>
                  <Label htmlFor="type">Node Type</Label>
                  <Select
                    value={formData.node_type}
                    onValueChange={(value: any) => setFormData({ ...formData, node_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="topic">Topic</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                      <SelectItem value="action">Action</SelectItem>
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
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false)
                      setEditingNode(null)
                      setFormData({ name: "", domain_id: "", node_type: "topic", status: "active", metadata: {} })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">{editingNode ? "Update" : "Create"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nodes.map((node) => (
          <Card key={node.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getNodeIcon(node.node_type)}
                    {node.name}
                  </CardTitle>
                  <CardDescription>{node.domain_name}</CardDescription>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge className={getTypeColor(node.node_type)}>{node.node_type}</Badge>
                  <Badge className={getStatusColor(node.status)}>{node.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500 mb-4">
                Created: {new Date(node.created_at).toLocaleDateString()}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingNode(node)
                    setFormData({
                      name: node.name,
                      domain_id: node.domain_id.toString(),
                      node_type: node.node_type,
                      status: node.status,
                      metadata: node.metadata,
                    })
                    setIsCreateOpen(true)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(node.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {nodes.length === 0 && (
        <div className="text-center py-12">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No nodes found</h3>
          <p className="text-gray-500 mb-4">
            {selectedDomain !== "all" ? "No nodes in the selected domain" : "Get started by creating your first node"}
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Node
          </Button>
        </div>
      )}
    </div>
  )
}
