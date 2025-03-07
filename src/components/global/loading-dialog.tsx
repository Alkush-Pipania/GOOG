"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Loader2, MessageSquare, Sparkles, Zap } from "lucide-react"

interface LoadingDialogProps {
  open: boolean
}

const loadingMessages = [
  "Initializing your chat space...",
  "Preparing AI models...",
  "Setting up secure environment...",
  "Almost ready to chat...",
]

export default function LoadingDialog({ open }: LoadingDialogProps) {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [progress, setProgress] = useState(0)
  const [showPixelText, setShowPixelText] = useState(false)

  useEffect(() => {
    if (!open) {
      setCurrentMessage(0)
      setProgress(0)
      setShowPixelText(false)
      return
    }

    // Show pixel text after a delay
    const pixelTextTimer = setTimeout(() => {
      setShowPixelText(true)
    }, 500)

    // Cycle through loading messages
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % loadingMessages.length)
    }, 1500)

    // Update progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 5
      })
    }, 150)

    return () => {
      clearInterval(messageInterval)
      clearInterval(progressInterval)
      clearTimeout(pixelTextTimer)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden bg-GoogBG border-0">
        {/* Pixel art header */}
        <div className="bg-black/50 w-full p-8 flex flex-col items-center justify-center backdrop-blur-sm">
          {showPixelText && (
            <div className="pixel-text-container">
              <div className="pixel-text text-white/90 text-4xl font-bold mb-4">PROMPTING</div>
              <div className="pixel-text text-white/80 text-4xl font-bold">IS ALL YOU NEED</div>
            </div>
          )}
        </div>

        {/* Loading content */}
        <div className="p-8 space-y-8">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
              <Loader2 className="h-16 w-16 text-primary animate-spin relative z-10" />
              <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse z-20" />
            </div>
          </div>

          <div className="text-center space-y-3">
            <h3 className="text-2xl font-semibold text-white">Creating Your Chat</h3>
            <p className="text-gray-400 min-h-[24px] text-lg transition-all duration-300 ease-in-out">
              {loadingMessages[currentMessage]}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden backdrop-blur-sm">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="flex justify-center gap-4">
            <div className="w-2 h-2 bg-primary/50 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-primary/50 rounded-full animate-pulse delay-150"></div>
            <div className="w-2 h-2 bg-primary/50 rounded-full animate-pulse delay-300"></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

