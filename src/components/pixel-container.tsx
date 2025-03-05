import type React from "react"
import { cn } from "@/lib/utils"

interface PixelContainerProps {
  children: React.ReactNode
  className?: string
}

export function PixelContainer({ children, className }: PixelContainerProps) {
  return (
    <div
      className={cn(
        "border-2 border-gray-700 bg-gray-900 p-6 rounded-md",
        "shadow-[5px_5px_0px_0px_rgba(255,255,255,0.1)]",
        className,
      )}
    >
      {children}
    </div>
  )
}

