import { getMessagesByConnection } from "@/lib/sample-data"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const connectionId = searchParams.get("connection_id")
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    let messages = getMessagesByConnection(connectionId || undefined)

    // Apply limit
    messages = messages.slice(0, limit)

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Failed to fetch messages:", error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { connection_id, message_type, payload } = await request.json()

    // For demo purposes, return a mock created message
    const newMessage = {
      id: Date.now(),
      connection_id: Number(connection_id),
      message_type,
      payload,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(newMessage, { status: 201 })
  } catch (error) {
    console.error("Failed to create message:", error)
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 })
  }
}
