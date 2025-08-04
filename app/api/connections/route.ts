import { getConnectionsByDomain } from "@/lib/sample-data"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domainId = searchParams.get("domain_id")

    const connections = getConnectionsByDomain(domainId || undefined)
    return NextResponse.json(connections)
  } catch (error) {
    console.error("Failed to fetch connections:", error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { source_node_id, target_node_id, connection_type, metadata = {} } = await request.json()

    // For demo purposes, return a mock created connection
    const newConnection = {
      id: Date.now(),
      source_node_id: Number(source_node_id),
      target_node_id: Number(target_node_id),
      connection_type,
      status: "active" as const,
      metadata,
      created_at: new Date().toISOString(),
      source_node_name: "Source Node",
      target_node_name: "Target Node",
      source_domain_name: "Source Domain",
      target_domain_name: "Target Domain",
    }

    return NextResponse.json(newConnection, { status: 201 })
  } catch (error) {
    console.error("Failed to create connection:", error)
    return NextResponse.json({ error: "Failed to create connection" }, { status: 500 })
  }
}
