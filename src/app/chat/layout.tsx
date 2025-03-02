"use client"
import type React from "react"
import Header from "./_components/Header"
import { ChatDialog } from "@/components/search/SearchDialog"
import { useDialogStore } from "@/store/SearchChats"
export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const {open} = useDialogStore();
  return <div className="h-screen bg-GoogBG text-white">
    <Header/>
    {open && <ChatDialog />}
    {children}</div>
}

