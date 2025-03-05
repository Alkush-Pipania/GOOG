"use client"

import { SignIn } from "@clerk/nextjs"
import { AuthLayout } from "@/components/auth-layout"

const SignInPage = () => {
  return (
    <AuthLayout title="Sign In">
      <div className="flex items-start sm:items-center justify-center">
        <SignIn />
      </div>
    </AuthLayout>
  )
}

export default SignInPage

