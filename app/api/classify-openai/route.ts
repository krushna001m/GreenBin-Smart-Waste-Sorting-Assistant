import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 400 })
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this waste item image and classify it into one of these categories:
                
                1. "biodegradable" - organic waste like food scraps, plant matter, paper
                2. "recyclable" - plastic bottles, metal cans, glass, cardboard
                3. "hazardous" - batteries, electronics, chemicals, medical waste
                
                Respond with ONLY a JSON object in this exact format:
                {
                  "type": "biodegradable|recyclable|hazardous",
                  "item": "specific item name",
                  "confidence": 85
                }
                
                Be specific about the item (e.g., "Plastic Water Bottle", "Banana Peel", "AA Battery").`,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 150,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error("No response from OpenAI")
    }

    // Parse the JSON response
    const classification = JSON.parse(content)

    // Map to our classification format
    const wasteClassifications = {
      biodegradable: {
        instructions: [
          "Add to your compost bin or organic waste collection",
          "If composting at home, mix with brown materials",
          "Avoid adding meat or dairy to home compost",
          "Decomposes naturally in 2-8 weeks",
        ],
        tips: [
          "Organic waste makes excellent fertilizer",
          "Composting reduces methane emissions from landfills",
          "Can be used to enrich garden soil naturally",
        ],
        impact: "Composting this organic waste prevents methane emissions and creates nutrient-rich soil!",
      },
      recyclable: {
        instructions: [
          "Clean the item to remove any residue",
          "Check local recycling guidelines",
          "Place in appropriate recycling bin",
          "Remove caps and labels if required",
        ],
        tips: [
          "Recycling saves energy and natural resources",
          "Clean items recycle better than dirty ones",
          "Check recycling numbers on plastic items",
        ],
        impact: "Recycling this item saves energy and reduces landfill waste!",
      },
      hazardous: {
        instructions: [
          "Never throw in regular trash",
          "Take to designated hazardous waste facility",
          "Check for manufacturer take-back programs",
          "Keep away from children and water",
        ],
        tips: [
          "Hazardous waste can contaminate soil and water",
          "Many electronics stores accept old devices",
          "Proper disposal protects the environment",
        ],
        impact: "Proper disposal prevents environmental contamination!",
      },
    }

    const result = {
      type: classification.type,
      confidence: classification.confidence,
      item: classification.item,
      instructions: wasteClassifications[classification.type]?.instructions || [],
      tips: wasteClassifications[classification.type]?.tips || [],
      impact: wasteClassifications[classification.type]?.impact || "Proper disposal helps protect our environment!",
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("OpenAI classification error:", error)
    return NextResponse.json({ error: "Classification failed" }, { status: 500 })
  }
}
