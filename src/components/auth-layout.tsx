import type React from "react"
import { PixelContainer } from "@/components/pixel-container"
import Link from "next/link"
import { Button } from "./ui/button"
import { ArrowLeft } from "lucide-react"
import { PixelText } from "./pixel-text"

interface AuthLayoutProps {
  children: React.ReactNode
  title: "Sign In" | "Sign Up"
}

export function AuthLayout({ children, title }: AuthLayoutProps) {
  const isSignIn = title === "Sign In"

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="w-full max-w-md mb-8 text-center">
        <PixelText size="xl" className="mb-2">
          PROMPTING
        </PixelText>
        <PixelText size="sm" className="text-gray-400">
          IS ALL YOU NEED
        </PixelText>
      </div>

      {/* Auth Container */}
      <PixelContainer className="w-full max-w-md mb-6">{children}</PixelContainer>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row items-center gap-4 text-gray-400">
        <Button variant="link" asChild className="text-gray-400 hover:text-white">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </Button>
        <span className="hidden sm:inline">•</span>
        <Button variant="link" asChild className="text-gray-400 hover:text-white">
          <Link href={isSignIn ? "/sign-up" : "/sign-in"}>
            {isSignIn ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </Link>
        </Button>
      </div>
    </div>
  )
}

