"use client";

import { X } from "lucide-react";
import * as React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ChatList } from "./_subcomponents/chat-List";
import { SearchBar } from "./_subcomponents/search-bar";
import { useDialogStore, useMetaChatStore } from "@/store/SearchChats";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";

export function ChatDialog() {
  const { getToken, userId } = useAuth();
  const { setGroupedChats } = useMetaChatStore();

  React.useEffect(() => {
    async function fetchChats() {
      if (!userId) return; // Ensure userId exists before making the request

      const token = await getToken();
      try {
        const response = await axios.get(`/api/users/${userId}/chats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Response:", response.data);
        setGroupedChats(response.data);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    }
    fetchChats();
  }, [userId, getToken, setGroupedChats]); // Dependencies to re-fetch if userId changes

  const { open, setOpen } = useDialogStore();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTitle />
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
  );
}