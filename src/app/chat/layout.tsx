"use client"
import type React from "react"
import Header from "./_components/Header"
import { ChatDialog } from "@/components/search/SearchDialog"
import { useDialogStore, useMetaChatStore } from "@/store/SearchChats"
import { useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import axios from "axios"
import { UseSearchStore } from "@/store/ChatStore"
export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const {userId , getToken} = useAuth();
  const { setGroupedChats } = useMetaChatStore();
  const {search} = UseSearchStore();
  useEffect(() => {
    async function fetchChats() {
      if (!userId) return; // Ensure userId exists before making the request

      const token = await getToken();
      try {
        const response = await axios.get(`/api/users/${userId}/chats?search=${encodeURIComponent(search)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setGroupedChats(response.data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    }
    fetchChats();
  }, [userId, getToken, setGroupedChats , search]);
  const { open } = useDialogStore();
  return <div className="h-screen bg-GoogBG text-white">
    <Header />
    {open && <ChatDialog />}
    {children}</div>
}

