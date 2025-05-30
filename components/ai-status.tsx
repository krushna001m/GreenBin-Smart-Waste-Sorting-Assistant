"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff, Zap } from "lucide-react"

export function AIStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [apiStatus, setApiStatus] = useState<"ready" | "loading" | "error">("ready")
  const [activeModel, setActiveModel] = useState<"huggingface" | "openai" | "fallback">("huggingface")

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check initial status and available models
    setIsOnline(navigator.onLine)
    checkAvailableModels()

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const checkAvailableModels = () => {
    if (process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY) {
      setActiveModel("huggingface")
    } else if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      setActiveModel("openai")
    } else {
      setActiveModel("fallback")
    }
  }

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-3 w-3" />
    if (apiStatus === "loading") return <Zap className="h-3 w-3 animate-pulse" />
    return <Wifi className="h-3 w-3" />
  }

  const getStatusText = () => {
    if (!isOnline) return "Offline Mode"
    if (apiStatus === "loading") return "AI Processing"

    switch (activeModel) {
      case "huggingface":
        return "HuggingFace AI"
      case "openai":
        return "OpenAI Vision"
      case "fallback":
        return "Local Analysis"
      default:
        return "AI Ready"
    }
  }

  const getStatusColor = () => {
    if (!isOnline) return "bg-orange-100 text-orange-800"
    if (apiStatus === "loading") return "bg-blue-100 text-blue-800"

    switch (activeModel) {
      case "huggingface":
        return "bg-purple-100 text-purple-800"
      case "openai":
        return "bg-green-100 text-green-800"
      case "fallback":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  return (
    <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor()}`}>
      {getStatusIcon()}
      {getStatusText()}
    </Badge>
  )
}
