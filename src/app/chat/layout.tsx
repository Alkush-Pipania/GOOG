import type React from "react"
import Header from "./_components/Header"
export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="h-screen bg-GoogBG text-white">
    <Header/>
    {children}</div>
}

