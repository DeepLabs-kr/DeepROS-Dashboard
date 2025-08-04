import sampleData from "@/data/sample-data.json"
import type { ROSDomain, Node, NodeConnection, NodeMessage } from "@/lib/db"

export function getSampleDomains(): ROSDomain[] {
  return sampleData.domains as ROSDomain[]
}

export function getSampleNodes(): Node[] {
  return sampleData.nodes as Node[]
}

export function getSampleConnections(): NodeConnection[] {
  return sampleData.connections as NodeConnection[]
}

export function getSampleMessages(): NodeMessage[] {
  return sampleData.messages as NodeMessage[]
}

export function getSampleStats() {
  const domains = getSampleDomains()
  const nodes = getSampleNodes()
  const connections = getSampleConnections()
  const messages = getSampleMessages()

  return {
    domains: domains.length,
    nodes: nodes.length,
    connections: connections.length,
    messages: messages.length,
    activeDomains: domains.filter((d) => d.agent_status === "active").length,
    activeNodes: nodes.filter((n) => n.status === "active").length,
    activeConnections: connections.filter((c) => c.status === "active").length,
    recentMessages: messages.filter((m) => {
      const messageTime = new Date(m.timestamp)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      return messageTime > oneHourAgo
    }).length,
  }
}

export function getNodesByDomain(domainId?: string): Node[] {
  const nodes = getSampleNodes()
  if (!domainId || domainId === "all") {
    return nodes
  }
  return nodes.filter((node) => node.domain_id.toString() === domainId)
}

export function getConnectionsByDomain(domainId?: string): NodeConnection[] {
  const connections = getSampleConnections()
  const nodes = getSampleNodes()

  if (!domainId || domainId === "all") {
    return connections
  }

  return connections.filter((conn) => {
    const sourceNode = nodes.find((n) => n.id === conn.source_node_id)
    const targetNode = nodes.find((n) => n.id === conn.target_node_id)
    return sourceNode?.domain_id.toString() === domainId || targetNode?.domain_id.toString() === domainId
  })
}

export function getMessagesByConnection(connectionId?: string): NodeMessage[] {
  const messages = getSampleMessages()
  if (!connectionId || connectionId === "all") {
    return messages
  }
  return messages.filter((message) => message.connection_id.toString() === connectionId)
}
