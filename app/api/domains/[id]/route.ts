import { sql } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const [domain] = await sql`
      SELECT * FROM ros_domains WHERE id = ${params.id}
    `

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }

    return NextResponse.json(domain)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch domain" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const { name, description, agent_status } = await request.json()

    const [domain] = await sql`
      UPDATE ros_domains 
      SET name = ${name}, description = ${description}, agent_status = ${agent_status}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${params.id}
      RETURNING *
    `

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }

    return NextResponse.json(domain)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to update domain" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 })
    }

    const [domain] = await sql`
      DELETE FROM ros_domains WHERE id = ${params.id}
      RETURNING *
    `

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Domain deleted successfully" })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to delete domain" }, { status: 500 })
  }
}
