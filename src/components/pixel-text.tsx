import type React from "react"
import { cn } from "@/lib/utils"

interface PixelTextProps {
  children: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

export function PixelText({ children, className, size = "md" }: PixelTextProps) {
  const sizeClasses = {
    sm: "text-lg md:text-xl",
    md: "text-xl md:text-2xl",
    lg: "text-2xl md:text-3xl",
    xl: "text-3xl md:text-4xl lg:text-5xl",
  }

  return (
    <div className={cn("font-mono tracking-wider text-white font-bold", sizeClasses[size], className)}>{children}</div>
  )
}
