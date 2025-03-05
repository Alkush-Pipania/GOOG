"use client"

import { SignUp } from "@clerk/nextjs"
import { AuthLayout } from "@/components/auth-layout"

const SignUpPage = () => {
  return (
    <AuthLayout title="Sign Up">
      <div className="flex items-start sm:items-center justify-center">
        <SignUp />
      </div>
    </AuthLayout>
  )
}

export default SignUpPage