"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, ImageIcon, Sparkles } from "lucide-react"

interface DemoModeProps {
  onDemoClassification: (result: any) => void
}

export function DemoMode({ onDemoClassification }: DemoModeProps) {
  const [isRunning, setIsRunning] = useState(false)

  const demoItems = [
    {
      name: "Plastic Water Bottle",
      image: "/placeholder.svg?height=200&width=200",
      type: "recyclable",
      confidence: 96,
      description: "Clear PET plastic bottle",
    },
    {
      name: "Banana Peel",
      image: "/placeholder.svg?height=200&width=200",
      type: "biodegradable",
      confidence: 98,
      description: "Fresh organic fruit waste",
    },
    {
      name: "AA Battery",
      image: "/placeholder.svg?height=200&width=200",
      type: "hazardous",
      confidence: 94,
      description: "Alkaline battery",
    },
    {
      name: "Cardboard Box",
      image: "/placeholder.svg?height=200&width=200",
      type: "recyclable",
      confidence: 92,
      description: "Corrugated cardboard packaging",
    },
  ]

  const runDemo = async (item: (typeof demoItems)[0]) => {
    setIsRunning(true)

    // Simulate AI processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const mockResult = {
      type: item.type,
      confidence: item.confidence,
      item: item.name,
      instructions: getInstructions(item.type),
      tips: getTips(item.type),
      impact: getImpact(item.type),
    }

    onDemoClassification(mockResult)
    setIsRunning(false)
  }

  const getInstructions = (type: string) => {
    const instructions = {
      recyclable: [
        "Clean the item to remove any residue",
        "Check local recycling guidelines",
        "Place in appropriate recycling bin",
        "Remove caps and labels if required",
      ],
      biodegradable: [
        "Add to your compost bin",
        "Mix with brown materials for best results",
        "Keep compost moist but not soggy",
        "Turn compost regularly for faster decomposition",
      ],
      hazardous: [
        "Never throw in regular trash",
        "Take to designated hazardous waste facility",
        "Check for manufacturer take-back programs",
        "Keep away from children and water",
      ],
    }
    return instructions[type] || []
  }

  const getTips = (type: string) => {
    const tips = {
      recyclable: [
        "Recycling saves energy and natural resources",
        "Clean items recycle better than dirty ones",
        "Check recycling numbers on plastic items",
      ],
      biodegradable: [
        "Composting reduces methane emissions",
        "Creates nutrient-rich soil for plants",
        "Reduces the need for chemical fertilizers",
      ],
      hazardous: [
        "Improper disposal can contaminate water sources",
        "Many electronics contain valuable recoverable materials",
        "Proper disposal protects wildlife and ecosystems",
      ],
    }
    return tips[type] || []
  }

  const getImpact = (type: string) => {
    const impacts = {
      recyclable: "Recycling this item saves energy and reduces landfill waste!",
      biodegradable: "Composting this organic waste prevents methane emissions!",
      hazardous: "Proper disposal prevents environmental contamination!",
    }
    return impacts[type] || "Proper disposal helps protect our environment!"
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "biodegradable":
        return "bg-green-100 text-green-800"
      case "recyclable":
        return "bg-blue-100 text-blue-800"
      case "hazardous":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Demo Mode - Try Sample Items
        </CardTitle>
        <CardDescription>See how our AI classifies different types of waste with these sample items</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {demoItems.map((item, index) => (
            <div key={index} className="text-center">
              <div className="relative mb-3">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                />
                <Badge className={`absolute -top-2 -right-2 text-xs ${getTypeColor(item.type)}`}>
                  {item.confidence}%
                </Badge>
              </div>
              <h4 className="font-medium text-sm mb-1">{item.name}</h4>
              <p className="text-xs text-gray-500 mb-2">{item.description}</p>
              <Button size="sm" variant="outline" onClick={() => runDemo(item)} disabled={isRunning} className="w-full">
                {isRunning ? (
                  <>
                    <Zap className="h-3 w-3 mr-1 animate-pulse" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-3 w-3 mr-1" />
                    Classify
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
