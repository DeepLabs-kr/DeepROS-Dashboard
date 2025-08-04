import { getNodesByDomain } from "@/lib/sample-data"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domainId = searchParams.get("domain_id")

    const nodes = getNodesByDomain(domainId || undefined)
    return NextResponse.json(nodes)
  } catch (error) {
    console.error("Failed to fetch nodes:", error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, domain_id, node_type, metadata = {} } = await request.json()

    // For demo purposes, return a mock created node
    const newNode = {
      id: Date.now(),
      name,
      domain_id: Number(domain_id),
      node_type,
      status: "active" as const,
      metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      domain_name: "Sample Domain",
    }

    return NextResponse.json(newNode, { status: 201 })
  } catch (error) {
    console.error("Failed to create node:", error)
    return NextResponse.json({ error: "Failed to create node" }, { status: 500 })
  }
}
