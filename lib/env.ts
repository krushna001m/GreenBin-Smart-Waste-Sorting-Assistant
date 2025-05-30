// Environment configuration for AI services
export const AI_CONFIG = {
  // Hugging Face API configuration
  HUGGINGFACE_API_KEY: process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || "",
  HUGGINGFACE_MODEL: "google/vit-base-patch16-224",

  // Alternative: OpenAI Vision API
  OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",

  // Fallback settings
  USE_FALLBACK: true,
  CONFIDENCE_THRESHOLD: 0.7,

  // Model endpoints
  ENDPOINTS: {
    HUGGINGFACE: "https://api-inference.huggingface.co/models/",
    CUSTOM_MODEL: "/api/classify", // For custom deployed models
  },
}

// Check if AI services are properly configured
export function checkAIConfiguration(): { configured: boolean; message: string } {
  if (AI_CONFIG.HUGGINGFACE_API_KEY) {
    return { configured: true, message: "Hugging Face API configured" }
  }

  if (AI_CONFIG.OPENAI_API_KEY) {
    return { configured: true, message: "OpenAI API configured" }
  }

  return {
    configured: false,
    message: "No AI API keys configured. Using fallback classification.",
  }
}
