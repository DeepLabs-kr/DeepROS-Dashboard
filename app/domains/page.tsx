"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Plus, Edit, Trash2, Activity, AlertCircle, CheckCircle } from "lucide-react"
import type { ROSDomain } from "@/lib/db"

export default function DomainsPage() {
  const [domains, setDomains] = useState<ROSDomain[]>([])
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingDomain, setEditingDomain] = useState<ROSDomain | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    agent_status: "active" as const,
  })

  useEffect(() => {
    fetchDomains()
  }, [])

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
      const url = editingDomain ? `/api/domains/${editingDomain.id}` : "/api/domains"
      const method = editingDomain ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        fetchDomains()
        setIsCreateOpen(false)
        setEditingDomain(null)
        setFormData({ name: "", description: "", agent_status: "active" })
      }
    } catch (error) {
      console.error("Failed to save domain:", error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this domain?")) {
      try {
        const response = await fetch(`/api/domains/${id}`, { method: "DELETE" })
        if (response.ok) {
          fetchDomains()
        }
      } catch (error) {
        console.error("Failed to delete domain:", error)
      }
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "inactive":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
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
          <h1 className="text-3xl font-bold">ROS Domains</h1>
          <p className="text-gray-600">Manage your ROS domains and their agents</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDomain ? "Edit Domain" : "Create New Domain"}</DialogTitle>
              <DialogDescription>
                {editingDomain ? "Update the domain information" : "Create a new ROS domain with a node agent"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Domain Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter domain name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter domain description"
                />
              </div>
              <div>
                <Label htmlFor="status">Agent Status</Label>
                <Select
                  value={formData.agent_status}
                  onValueChange={(value: any) => setFormData({ ...formData, agent_status: value })}
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
                    setEditingDomain(null)
                    setFormData({ name: "", description: "", agent_status: "active" })
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">{editingDomain ? "Update" : "Create"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {domains.map((domain) => (
          <Card key={domain.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(domain.agent_status)}
                    {domain.name}
                  </CardTitle>
                  <CardDescription>{domain.description}</CardDescription>
                </div>
                <Badge className={getStatusColor(domain.agent_status)}>{domain.agent_status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500 mb-4">
                Created: {new Date(domain.created_at).toLocaleDateString()}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingDomain(domain)
                    setFormData({
                      name: domain.name,
                      description: domain.description || "",
                      agent_status: domain.agent_status,
                    })
                    setIsCreateOpen(true)
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(domain.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {domains.length === 0 && (
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No domains found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first ROS domain</p>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Domain
          </Button>
        </div>
      )}
    </div>
  )
}
