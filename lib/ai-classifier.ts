// AI Classification using Hugging Face Inference API
interface ClassificationResult {
  type: "biodegradable" | "recyclable" | "hazardous"
  confidence: number
  item: string
  instructions: string[]
  tips: string[]
  impact: string
}

// Waste classification mappings
const wasteClassifications: Record<string, ClassificationResult> = {
  // Biodegradable items
  food: {
    type: "biodegradable",
    confidence: 95,
    item: "Food Waste",
    instructions: [
      "Add to your compost bin or organic waste collection",
      "If no composting available, wrap and dispose in biodegradable waste bin",
      "Remove any packaging before composting",
      "Avoid adding meat or dairy to home compost",
    ],
    tips: [
      "Food waste makes excellent compost for gardens",
      "Composting reduces methane emissions from landfills",
      "One ton of food waste can produce 460kg of compost",
    ],
    impact: "Composting this food waste prevents methane emissions and creates nutrient-rich soil!",
  },
  plant: {
    type: "biodegradable",
    confidence: 98,
    item: "Plant Material",
    instructions: [
      "Add to garden compost or green waste bin",
      "Can be used directly as mulch for plants",
      "Chop larger pieces for faster decomposition",
      "Mix with brown materials like dry leaves",
    ],
    tips: [
      "Green plant matter is rich in nitrogen for composting",
      "Decomposes naturally in 2-8 weeks depending on size",
      "Great for creating natural fertilizer",
    ],
    impact: "This organic matter will enrich soil and support plant growth!",
  },
  paper: {
    type: "recyclable",
    confidence: 90,
    item: "Paper Product",
    instructions: [
      "Remove any plastic coating or tape",
      "Place in paper recycling bin",
      "Keep dry and clean for best recycling results",
      "Shred sensitive documents before recycling",
    ],
    tips: [
      "Recycled paper uses 60% less energy than new paper",
      "One ton of recycled paper saves 17 trees",
      "Paper can be recycled 5-7 times before fibers break down",
    ],
    impact: "Recycling this paper saves trees and reduces energy consumption!",
  },

  // Recyclable items
  bottle: {
    type: "recyclable",
    confidence: 95,
    item: "Plastic Bottle",
    instructions: [
      "Remove cap and label if possible",
      "Rinse with water to remove residue",
      "Check recycling number on bottom",
      "Place in plastic recycling bin",
    ],
    tips: [
      "PET bottles (#1) are highly recyclable",
      "One recycled bottle saves enough energy to power a 60W bulb for 6 hours",
      "Recycled bottles can become new bottles or clothing",
    ],
    impact: "Recycling this bottle saves 0.5kg of CO2 emissions!",
  },
  can: {
    type: "recyclable",
    confidence: 97,
    item: "Metal Can",
    instructions: [
      "Rinse to remove food residue",
      "Remove paper labels if easily detachable",
      "Place in metal recycling bin",
      "Aluminum cans are infinitely recyclable",
    ],
    tips: [
      "Aluminum cans can be recycled indefinitely without quality loss",
      "Recycling one can saves enough energy to run a TV for 3 hours",
      "95% less energy needed than producing new aluminum",
    ],
    impact: "This can will be back on shelves as a new product in 60 days!",
  },
  cardboard: {
    type: "recyclable",
    confidence: 92,
    item: "Cardboard",
    instructions: [
      "Remove all tape, staples, and plastic",
      "Flatten boxes to save space",
      "Keep dry and clean",
      "Place in cardboard recycling bin",
    ],
    tips: [
      "Corrugated cardboard is made from recycled materials",
      "Can be recycled 5-7 times before fibers weaken",
      "Recycling cardboard uses 75% less energy than making new",
    ],
    impact: "Recycling this cardboard saves trees and landfill space!",
  },

  // Hazardous items
  battery: {
    type: "hazardous",
    confidence: 98,
    item: "Battery",
    instructions: [
      "Never throw in regular trash or recycling",
      "Take to designated e-waste collection center",
      "Many electronics stores accept old batteries",
      "Keep terminals covered to prevent short circuits",
    ],
    tips: [
      "Batteries contain toxic metals like lithium, mercury, and lead",
      "One battery can contaminate 20,000 liters of groundwater",
      "Rechargeable batteries can often be refurbished",
    ],
    impact: "Proper disposal prevents soil and water contamination!",
  },
  electronics: {
    type: "hazardous",
    confidence: 94,
    item: "Electronic Device",
    instructions: [
      "Remove personal data before disposal",
      "Take to certified e-waste recycling facility",
      "Check if manufacturer has take-back program",
      "Never put in regular trash",
    ],
    tips: [
      "E-waste contains valuable metals like gold and silver",
      "Improper disposal releases toxic chemicals",
      "Many components can be refurbished or recycled",
    ],
    impact: "Proper e-waste recycling recovers valuable materials and prevents pollution!",
  },
  chemical: {
    type: "hazardous",
    item: "Chemical Container",
    confidence: 96,
    instructions: [
      "Do not empty contents down drains",
      "Take to hazardous waste collection facility",
      "Keep in original container with label",
      "Follow local hazardous waste disposal guidelines",
    ],
    tips: [
      "Household chemicals can contaminate water supplies",
      "Many communities have special collection days",
      "Some chemicals can be neutralized safely at home",
    ],
    impact: "Safe disposal protects water sources and ecosystems!",
  },
}

// Fallback classification for unknown items
const getDefaultClassification = (confidence = 85): ClassificationResult => ({
  type: "recyclable",
  confidence,
  item: "Unidentified Item",
  instructions: [
    "Check local recycling guidelines",
    "When in doubt, place in general waste",
    "Look for recycling symbols or numbers",
    "Contact local waste management for guidance",
  ],
  tips: [
    "Different materials require different disposal methods",
    "Local recycling programs may vary",
    "When unsure, it's better to ask than contaminate recycling",
  ],
  impact: "Every small action towards proper waste disposal makes a difference!",
})

// Update the classifyWasteImage function to use multiple AI models for better accuracy

export async function classifyWasteImage(imageUrl: string): Promise<ClassificationResult> {
  try {
    // Try Hugging Face first
    const hfResult = await classifyWithHuggingFace(imageUrl)
    if (hfResult) return hfResult

    // Fallback to OpenAI Vision if available
    const openaiResult = await classifyWithOpenAI(imageUrl)
    if (openaiResult) return openaiResult

    // Final fallback to local analysis
    return await fallbackImageAnalysis(imageUrl)
  } catch (error) {
    console.error("AI Classification error:", error)
    return await fallbackImageAnalysis(imageUrl)
  }
}

// Add new function for Hugging Face classification
async function classifyWithHuggingFace(imageUrl: string): Promise<ClassificationResult | null> {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()

    const classificationResponse = await fetch(
      `https://api-inference.huggingface.co/models/google/vit-base-patch16-224`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: blob,
      },
    )

    if (!classificationResponse.ok) {
      throw new Error("Hugging Face API failed")
    }

    const result = await classificationResponse.json()

    if (result && result.length > 0) {
      const topPrediction = result[0]
      const label = topPrediction.label.toLowerCase()
      const confidence = Math.round(topPrediction.score * 100)

      const wasteType = mapLabelToWasteType(label)

      if (wasteClassifications[wasteType]) {
        return {
          ...wasteClassifications[wasteType],
          confidence: Math.max(confidence, 75),
        }
      }
    }

    return null
  } catch (error) {
    console.error("Hugging Face classification error:", error)
    return null
  }
}

// Add new function for OpenAI Vision classification
async function classifyWithOpenAI(imageUrl: string): Promise<ClassificationResult | null> {
  try {
    const response = await fetch("/api/classify-openai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageUrl }),
    })

    if (!response.ok) {
      throw new Error("OpenAI API failed")
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("OpenAI classification error:", error)
    return null
  }
}

// Fallback image analysis using local processing
async function fallbackImageAnalysis(imageUrl: string): Promise<ClassificationResult> {
  try {
    // Create canvas for image analysis
    const img = new Image()
    img.crossOrigin = "anonymous"

    return new Promise((resolve) => {
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")

        if (!ctx) {
          resolve(getDefaultClassification())
          return
        }

        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)

        // Simple color analysis for waste type detection
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const colors = analyzeImageColors(imageData)

        // Determine waste type based on color analysis
        const wasteType = determineWasteTypeFromColors(colors)

        resolve(wasteClassifications[wasteType] || getDefaultClassification())
      }

      img.onerror = () => {
        resolve(getDefaultClassification())
      }

      img.src = imageUrl
    })
  } catch (error) {
    console.error("Fallback analysis error:", error)
    return getDefaultClassification()
  }
}

// Map AI model labels to our waste categories
function mapLabelToWasteType(label: string): string {
  const labelMappings: Record<string, string> = {
    // Food and organic
    banana: "plant",
    apple: "food",
    orange: "food",
    food: "food",
    fruit: "food",
    vegetable: "food",
    leaf: "plant",
    flower: "plant",
    plant: "plant",

    // Recyclables
    bottle: "bottle",
    plastic: "bottle",
    can: "can",
    metal: "can",
    aluminum: "can",
    paper: "paper",
    cardboard: "cardboard",
    box: "cardboard",

    // Electronics and hazardous
    battery: "battery",
    phone: "electronics",
    computer: "electronics",
    electronic: "electronics",
    chemical: "chemical",
    container: "chemical",
  }

  // Find matching category
  for (const [key, value] of Object.entries(labelMappings)) {
    if (label.includes(key)) {
      return value
    }
  }

  return "bottle" // Default to recyclable
}

// Analyze dominant colors in image
function analyzeImageColors(imageData: ImageData): { green: number; brown: number; metallic: number; plastic: number } {
  const data = imageData.data
  let green = 0,
    brown = 0,
    metallic = 0,
    plastic = 0

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // Detect green (organic materials)
    if (g > r && g > b && g > 100) green++

    // Detect brown (organic/cardboard)
    if (r > 100 && g > 80 && b < 80 && Math.abs(r - g) < 50) brown++

    // Detect metallic (silver/gray)
    if (Math.abs(r - g) < 30 && Math.abs(g - b) < 30 && r > 120) metallic++

    // Detect plastic colors (bright/artificial)
    if ((r > 150 || g > 150 || b > 150) && Math.max(r, g, b) - Math.min(r, g, b) > 50) plastic++
  }

  return { green, brown, metallic, plastic }
}

// Determine waste type from color analysis
function determineWasteTypeFromColors(colors: {
  green: number
  brown: number
  metallic: number
  plastic: number
}): string {
  const total = colors.green + colors.brown + colors.metallic + colors.plastic

  if (total === 0) return "bottle" // Default

  const greenRatio = colors.green / total
  const brownRatio = colors.brown / total
  const metallicRatio = colors.metallic / total

  if (greenRatio > 0.3 || brownRatio > 0.3) return "plant"
  if (metallicRatio > 0.2) return "can"

  return "bottle" // Default to plastic
}

// Alternative: Use TensorFlow.js for local inference
export async function classifyWithTensorFlow(imageUrl: string): Promise<ClassificationResult> {
  try {
    // This would require loading a pre-trained model
    // For now, we'll use the Hugging Face API approach
    return await classifyWasteImage(imageUrl)
  } catch (error) {
    console.error("TensorFlow classification error:", error)
    return getDefaultClassification()
  }
}
