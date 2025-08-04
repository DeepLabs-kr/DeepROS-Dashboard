import { getSampleDomains } from "@/lib/sample-data"
import { type NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const domains = getSampleDomains()
    return NextResponse.json(domains)
  } catch (error) {
    console.error("Failed to fetch domains:", error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json()

    // For demo purposes, return a mock created domain
    const newDomain = {
      id: Date.now(),
      name,
      description,
      agent_status: "active" as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    return NextResponse.json(newDomain, { status: 201 })
  } catch (error) {
    console.error("Failed to create domain:", error)
    return NextResponse.json({ error: "Failed to create domain" }, { status: 500 })
  }
}
