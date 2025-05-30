"use client"

import type React from "react"

import { useState } from "react"
import { Camera, Upload, Recycle, Leaf, AlertTriangle, Award, MapPin, BookOpen, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AIStatus } from "@/components/ai-status"
import { classifyWasteImage } from "@/lib/ai-classifier"
import { DemoMode } from "@/components/demo-mode"

interface WasteClassification {
  type: "biodegradable" | "recyclable" | "hazardous"
  confidence: number
  item: string
  instructions: string[]
  tips: string[]
  impact: string
}

const mockClassifications: Record<string, WasteClassification> = {
  "plastic-bottle": {
    type: "recyclable",
    confidence: 95,
    item: "Plastic Bottle (PET)",
    instructions: [
      "Remove the cap and label if possible",
      "Rinse with water to remove any residue",
      "Place in recyclable waste bin",
      "Take to nearest recycling center",
    ],
    tips: [
      "PET bottles can be recycled into new bottles or clothing",
      "One recycled bottle saves enough energy to power a 60W bulb for 6 hours",
      "Always check the recycling number - this is #1 PET",
    ],
    impact: "Recycling this bottle saves 0.5kg of CO2 emissions!",
  },
  "banana-peel": {
    type: "biodegradable",
    confidence: 98,
    item: "Banana Peel",
    instructions: [
      "Add to your compost bin",
      "If no compost bin, bury in garden soil",
      "Can be used as natural fertilizer",
      "Decomposes in 2-5 weeks",
    ],
    tips: [
      "Banana peels are rich in potassium - great for plants",
      "Can be used to polish shoes naturally",
      "Dry and grind to make organic fertilizer powder",
    ],
    impact: "Composting this peel enriches soil and reduces methane emissions!",
  },
  battery: {
    type: "hazardous",
    confidence: 92,
    item: "Battery (Lithium/Alkaline)",
    instructions: [
      "Never throw in regular trash",
      "Take to designated e-waste collection center",
      "Many electronics stores accept old batteries",
      "Keep away from children and water",
    ],
    tips: [
      "Batteries contain toxic metals like mercury and lead",
      "One battery can contaminate 20,000 liters of water",
      "Rechargeable batteries can often be refurbished",
    ],
    impact: "Proper disposal prevents soil and water contamination!",
  },
}

// Mock function for waste image classification (replace with your actual API call)
// async function classifyWasteImage(imageUrl: string): Promise<WasteClassification> {
//   // Simulate an API call with a 1-second delay
//   await new Promise(resolve => setTimeout(resolve, 1000))

//   // For demonstration purposes, return a random classification
//   const classifications = Object.values(mockClassifications)
//   return classifications[Math.floor(Math.random() * classifications.length)]
// }

export default function GreenBinApp() {
  const [currentView, setCurrentView] = useState<"home" | "upload" | "result">("home")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [classification, setClassification] = useState<WasteClassification | null>(null)
  const [userPoints, setUserPoints] = useState(1250)
  const [itemsClassified, setItemsClassified] = useState(47)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setIsAnalyzing(true)

      try {
        // Create image element for processing
        const imageUrl = URL.createObjectURL(file)
        const result = await classifyWasteImage(imageUrl)

        setClassification(result)
        setCurrentView("result")
        setUserPoints((prev) => prev + 50)
        setItemsClassified((prev) => prev + 1)

        // Clean up object URL
        URL.revokeObjectURL(imageUrl)
      } catch (error) {
        console.error("Classification error:", error)
        // Fallback to mock classification
        const classifications = Object.values(mockClassifications)
        const randomClassification = classifications[Math.floor(Math.random() * classifications.length)]
        setClassification(randomClassification)
        setCurrentView("result")
      } finally {
        setIsAnalyzing(false)
      }
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "biodegradable":
        return <Leaf className="h-6 w-6 text-green-600" />
      case "recyclable":
        return <Recycle className="h-6 w-6 text-blue-600" />
      case "hazardous":
        return <AlertTriangle className="h-6 w-6 text-red-600" />
      default:
        return null
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "biodegradable":
        return "bg-green-100 text-green-800 border-green-200"
      case "recyclable":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "hazardous":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (currentView === "result" && classification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setCurrentView("home")} className="flex items-center gap-2">
              ← Back to Home
            </Button>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                {userPoints} points
              </Badge>
            </div>
          </div>

          <Card className="mb-6">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-3 mb-2">
                {getTypeIcon(classification.type)}
                <CardTitle className="text-2xl">Classification Result</CardTitle>
              </div>
              <Badge className={`w-fit mx-auto ${getTypeColor(classification.type)}`}>
                {classification.type.toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold mb-2">{classification.item}</h3>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-sm text-gray-600">Confidence:</span>
                  <Progress value={classification.confidence} className="w-32" />
                  <span className="text-sm font-medium">{classification.confidence}%</span>
                </div>
                <p className="text-green-600 font-medium">{classification.impact}</p>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="instructions" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="instructions">Disposal Guide</TabsTrigger>
              <TabsTrigger value="tips">Learn More</TabsTrigger>
              <TabsTrigger value="impact">Environmental Impact</TabsTrigger>
            </TabsList>

            <TabsContent value="instructions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Recycle className="h-5 w-5" />
                    How to Dispose Properly
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3">
                    {classification.instructions.map((instruction, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ol>
                  <Button className="mt-4 w-full" variant="outline">
                    <MapPin className="h-4 w-4 mr-2" />
                    Find Nearby Recycling Centers
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tips">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Educational Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {classification.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="impact">
              <Card>
                <CardHeader>
                  <CardTitle>Your Environmental Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{itemsClassified}</div>
                      <div className="text-sm text-gray-600">Items Classified</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">12.5kg</div>
                      <div className="text-sm text-gray-600">CO2 Saved</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{userPoints}</div>
                      <div className="text-sm text-gray-600">Eco Points</div>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg">
                    <p className="text-center font-medium">
                      🌱 You're making a difference! Keep up the great work in protecting our environment.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center">
            <Button
              onClick={() => {
                setCurrentView("upload")
                setSelectedFile(null)
                setClassification(null)
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Classify Another Item
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === "upload") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => setCurrentView("home")}>
              ← Back
            </Button>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Award className="h-4 w-4" />
              {userPoints} points
            </Badge>
          </div>

          <Card className="text-center">
            <CardHeader>
              <CardTitle className="text-2xl">Upload Waste Image</CardTitle>
              <CardDescription>
                Take a photo or upload an image of your waste item for AI classification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-green-400 transition-colors">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Upload className="h-12 w-12 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">Click to upload image</p>
                      <p className="text-sm text-gray-500">or drag and drop</p>
                    </div>
                  </div>
                </label>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">Or use your camera</p>
                <Button variant="outline" className="flex items-center gap-2 mx-auto">
                  <Camera className="h-4 w-4" />
                  Take Photo
                </Button>
              </div>

              {selectedFile && isAnalyzing && (
                <div className="space-y-4">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-green-600" />
                    <p className="text-sm text-gray-600">AI is analyzing your image...</p>
                    <Progress value={75} className="w-full mt-2" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Tips for Better Results</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Ensure good lighting
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Focus on the waste item
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Avoid cluttered backgrounds
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Include any visible labels or markings
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
        <DemoMode
          onDemoClassification={(result) => {
            setClassification(result)
            setCurrentView("result")
            setUserPoints((prev) => prev + 25) // Less points for demo
            setItemsClassified((prev) => prev + 1)
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Recycle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">GreenBin</h1>
                <p className="text-sm text-gray-600">Smart Waste Sorting Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AIStatus />
              <Badge variant="secondary" className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                {userPoints} points
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Your AI-Powered Personal <span className="text-green-600">Waste Guide</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Just take a picture, and we'll tell you how to recycle, compost, or dispose—helping you save the planet one
            item at a time.
          </p>
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
            onClick={() => setCurrentView("upload")}
          >
            <Camera className="h-5 w-5 mr-2" />
            Start Classifying Waste
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">How GreenBin Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>1. Capture or Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Take a photo of your waste item or upload an existing image from your device.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Recycle className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>2. AI Classification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Our AI instantly identifies whether it's biodegradable, recyclable, or hazardous waste.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>3. Learn & Act</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get step-by-step disposal instructions, composting tips, and environmental impact insights.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Waste Categories */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12">Waste Categories We Identify</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-green-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Leaf className="h-8 w-8 text-green-600" />
                  <CardTitle className="text-green-700">Biodegradable</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Organic waste that can be composted or naturally decomposed.</p>
                <div className="space-y-2">
                  <Badge variant="outline" className="mr-2">
                    Food scraps
                  </Badge>
                  <Badge variant="outline" className="mr-2">
                    Garden waste
                  </Badge>
                  <Badge variant="outline" className="mr-2">
                    Paper
                  </Badge>
                  <Badge variant="outline">Wood</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Recycle className="h-8 w-8 text-blue-600" />
                  <CardTitle className="text-blue-700">Recyclable</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Materials that can be processed and reused to create new products.</p>
                <div className="space-y-2">
                  <Badge variant="outline" className="mr-2">
                    Plastic bottles
                  </Badge>
                  <Badge variant="outline" className="mr-2">
                    Metal cans
                  </Badge>
                  <Badge variant="outline" className="mr-2">
                    Glass
                  </Badge>
                  <Badge variant="outline">Cardboard</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                  <CardTitle className="text-red-700">Hazardous</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Dangerous materials requiring special disposal methods.</p>
                <div className="space-y-2">
                  <Badge variant="outline" className="mr-2">
                    Batteries
                  </Badge>
                  <Badge variant="outline" className="mr-2">
                    Electronics
                  </Badge>
                  <Badge variant="outline" className="mr-2">
                    Chemicals
                  </Badge>
                  <Badge variant="outline">Medical waste</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-12">Community Impact</h3>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">50K+</div>
              <div className="text-gray-600">Items Classified</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">2.5T</div>
              <div className="text-gray-600">CO2 Saved</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">15K</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600 mb-2">95%</div>
              <div className="text-gray-600">Accuracy Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">Ready to Make a Difference?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who are already making smarter waste decisions with GreenBin.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-3" onClick={() => setCurrentView("upload")}>
            <Camera className="h-5 w-5 mr-2" />
            Start Your Green Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Recycle className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">GreenBin</span>
              </div>
              <p className="text-gray-400">Making waste sorting smart and sustainable for everyone.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>AI Classification</li>
                <li>Disposal Guides</li>
                <li>Impact Tracking</li>
                <li>Educational Content</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Learn</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Composting Tips</li>
                <li>Recycling Guide</li>
                <li>Sustainability Blog</li>
                <li>Community Forum</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 GreenBin. All rights reserved. Built for a sustainable future.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
