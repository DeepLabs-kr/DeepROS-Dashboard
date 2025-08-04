import { neon } from "@neondatabase/serverless"

// Only initialize if DATABASE_URL is available
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null

export { sql }

export interface ROSDomain {
  id: number
  name: string
  description?: string
  agent_status: "active" | "inactive" | "error"
  created_at: string
  updated_at: string
}

export interface Node {
  id: number
  name: string
  domain_id: number
  node_type: "topic" | "service" | "action"
  status: "active" | "inactive" | "error"
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  domain_name?: string
}

export interface NodeConnection {
  id: number
  source_node_id: number
  target_node_id: number
  connection_type: "publisher" | "subscriber" | "client" | "server"
  status: "active" | "inactive"
  metadata: Record<string, any>
  created_at: string
  source_node_name?: string
  target_node_name?: string
  source_domain_name?: string
  target_domain_name?: string
}

export interface NodeMessage {
  id: number
  connection_id: number
  message_type: string
  payload: Record<string, any>
  payload: Record<string, any>
  timestamp: string
}
