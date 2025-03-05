"use client"

import type React from "react"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { GitBranchIcon as Github, X as Twitter } from "lucide-react"
import { cn } from "@/lib/utils"

interface PixelTextProps {
  children: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

 function PixelText({ children, className, size = "md" }: PixelTextProps) {
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

export function CustomSignInForm() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1500)
  }

  return (
    <div className="w-full space-y-6 px-2">
      <div className="space-y-2 text-center">
        <PixelText size="md">Sign In</PixelText>
        <p className="text-sm text-gray-400">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            className="bg-gray-800 border-gray-700"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Button variant="link" className="text-xs text-gray-400 px-0">
              Forgot password?
            </Button>
          </div>
          <Input id="password" type="password" required className="bg-gray-800 border-gray-700" />
        </div>

        <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-700"></span>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-gray-900 px-2 text-gray-400">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
          <Github className="mr-2 h-4 w-4" />
          Github
        </Button>
        <Button variant="outline" className="border-gray-700 hover:bg-gray-800">
          <Twitter className="mr-2 h-4 w-4" />
          Twitter
        </Button>
      </div>
    </div>
  )
}

