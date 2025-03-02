"use client"

import { X } from "lucide-react"
import * as React from "react"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ChatList } from "./_subcomponents/chat-List"
import { SearchBar } from "./_subcomponents/search-bar"
import { useDialogStore } from "@/store/chatStore"

export function ChatDialog() {
  const {open , setOpen} = useDialogStore()
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTitle  />
      <DialogContent className="max-w-md p-0 gap-0 sm:rounded-lg rounded-none border-0 sm:border h-full sm:h-auto">
        <div className="bg-[#0F172A] text-white h-[100dvh] sm:h-[500px] relative">
          <div className="p-4 border-b border-white/10">
            <SearchBar />
          </div>
          <div className="h-[calc(100%-73px)] overflow-auto">
            <ChatList />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

