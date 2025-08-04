"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { RefreshCw, MessageSquare, Clock } from "lucide-react"
import type { NodeMessage, NodeConnection } from "@/lib/db"

export default function MessagesPage() {
  const [messages, setMessages] = useState<NodeMessage[]>([])
  const [connections, setConnections] = useState<NodeConnection[]>([])
  const [selectedConnection, setSelectedConnection] = useState<string>("all")
  const [isAutoRefresh, setIsAutoRefresh] = useState(false)

  useEffect(() => {
    fetchConnections()
    fetchMessages()
  }, [])

  useEffect(() => {
    fetchMessages()
  }, [selectedConnection])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isAutoRefresh) {
      interval = setInterval(fetchMessages, 2000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isAutoRefresh, selectedConnection])

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/connections")
      const data = await response.json()
      setConnections(data)
    } catch (error) {
      console.error("Failed to fetch connections:", error)
    }
  }

  const fetchMessages = async () => {
    try {
      const url =
        selectedConnection !== "all"
          ? `/api/messages?connection_id=${selectedConnection}&limit=100`
          : "/api/messages?limit=100"
      const response = await fetch(url)
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    }
  }

  const simulateMessage = async () => {
    if (!selectedConnection || selectedConnection === "all") return

    const samplePayloads = [
      { temperature: Math.random() * 30 + 10, humidity: Math.random() * 100 },
      { position: { x: Math.random() * 100, y: Math.random() * 100, z: Math.random() * 10 } },
      { velocity: Math.random() * 5, direction: Math.random() * 360 },
      { status: "active", battery: Math.random() * 100, signal_strength: Math.random() * 100 },
    ]

    const messageTypes = ["sensor_msgs/Temperature", "geometry_msgs/Pose", "nav_msgs/Odometry", "std_msgs/String"]

    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connection_id: Number.parseInt(selectedConnection),
          message_type: messageTypes[Math.floor(Math.random() * messageTypes.length)],
          payload: samplePayloads[Math.floor(Math.random() * samplePayloads.length)],
        }),
      })
      fetchMessages()
    } catch (error) {
      console.error("Failed to simulate message:", error)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatPayload = (payload: any) => {
    return JSON.stringify(payload, null, 2)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Message Viewer</h1>
          <p className="text-gray-600">Monitor real-time node communications</p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedConnection} onValueChange={setSelectedConnection}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by connection" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Connections</SelectItem>
              {connections.map((connection) => (
                <SelectItem key={connection.id} value={connection.id.toString()}>
                  {connection.source_node_name} → {connection.target_node_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant={isAutoRefresh ? "default" : "outline"} onClick={() => setIsAutoRefresh(!isAutoRefresh)}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isAutoRefresh ? "animate-spin" : ""}`} />
            Auto Refresh
          </Button>
          <Button onClick={fetchMessages} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {selectedConnection !== "all" && (
            <Button onClick={simulateMessage}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Simulate Message
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Messages
                {selectedConnection !== "all" && (
                  <Badge variant="secondary">
                    {connections.find((c) => c.id.toString() === selectedConnection)?.source_node_name} →{" "}
                    {connections.find((c) => c.id.toString() === selectedConnection)?.target_node_name}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {messages.length} messages{" "}
                {selectedConnection !== "all" ? "for selected connection" : "across all connections"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <Card key={message.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-sm font-medium">{message.message_type}</CardTitle>
                            <CardDescription className="flex items-center gap-2 text-xs">
                              <Clock className="h-3 w-3" />
                              {formatTimestamp(message.timestamp)}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            ID: {message.id}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
                          {formatPayload(message.payload)}
                        </pre>
                      </CardContent>
                    </Card>
                  ))}

                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
                      <p className="text-gray-500 mb-4">
                        {selectedConnection !== "all"
                          ? "No messages for the selected connection"
                          : "Messages will appear here as nodes communicate"}
                      </p>
                      {selectedConnection !== "all" && (
                        <Button onClick={simulateMessage}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Simulate Message
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Message Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Total Messages:</span>
                <Badge variant="secondary">{messages.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Last Hour:</span>
                <Badge variant="secondary">
                  {messages.filter((m) => new Date(m.timestamp) > new Date(Date.now() - 3600000)).length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Active Connections:</span>
                <Badge variant="secondary">{connections.filter((c) => c.status === "active").length}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Array.from(new Set(messages.map((m) => m.message_type))).map((type) => {
                const count = messages.filter((m) => m.message_type === type).length
                return (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm truncate">{type}</span>
                    <Badge variant="outline">{count}</Badge>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {messages.slice(0, 5).map((message) => (
                <div key={message.id} className="text-sm">
                  <div className="font-medium truncate">{message.message_type}</div>
                  <div className="text-xs text-gray-500">{formatTimestamp(message.timestamp)}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
