import { type NextRequest, NextResponse } from "next/server"
import { classifyWasteImage } from "@/lib/ai-classifier"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("image") as File

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Convert file to data URL
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`

    // Classify the image
    const result = await classifyWasteImage(dataUrl)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Classification API error:", error)
    return NextResponse.json({ error: "Classification failed" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: "AI Classification API is running",
    models: ["huggingface-vit", "fallback-analysis"],
    version: "1.0.0",
  })
}
