import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const [node] = await sql`
      SELECT n.*, d.name as domain_name 
      FROM nodes n
      JOIN ros_domains d ON n.domain_id = d.id
      WHERE n.id = ${params.id}
    `

    if (!node) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 })
    }

    return NextResponse.json(node)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch node" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const { name, node_type, status, metadata } = await request.json()

    const [node] = await sql`
      UPDATE nodes 
      SET name = ${name}, node_type = ${node_type}, status = ${status}, 
          metadata = ${JSON.stringify(metadata)}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `

    if (!node) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 })
    }

    return NextResponse.json(node)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to update node" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const [node] = await sql`
      DELETE FROM nodes WHERE id = ${params.id}
      RETURNING *
    `

    if (!node) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Node deleted successfully" })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to delete node" }, { status: 500 })
  }
}
