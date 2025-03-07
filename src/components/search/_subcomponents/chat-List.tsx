import { useDialogStore, useMetaChatStore } from "@/store/SearchChats";
import axios from "axios";
import { History, Plus, ChevronDown, ChevronUp, MessageSquare } from "lucide-react"
import { useRouter } from "next/navigation";
import { useState } from "react";

const chatData = {
  today: [
    { title: "PDF Image Extraction LangChain", icon: History },
    { title: "AI Prompt Test Cases", icon: History },
  ],
  yesterday: [{ title: "Prompt Generator Name Ideas", icon: History }],
  previousDays: [{ title: "Signup Route Implementation", icon: History }],
}

export function ChatList() {
  const router = useRouter();
  const { groupedChats } = useMetaChatStore();
  const { setOpen } = useDialogStore();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    today: false,
    yesterday: false,
    older: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderChats = (items: any[], section: string) => {
    if (!items.length) return null;
    
    const isExpanded = expandedSections[section];
    const displayItems = isExpanded ? items : items.slice(0, 3);
    const hasMore = items.length > 3;

    return (
      <div className="space-y-2">
        <div className="px-3 text-xs text-white/50 flex items-center justify-between">
          <span>{section}</span>
          {hasMore && (
            <button
              onClick={() => toggleSection(section)}
              className="flex items-center gap-1 text-white/50 hover:text-white/70 transition-colors"
            >
              {isExpanded ? (
                <>
                  <span className="text-xs">Show less</span>
                  <ChevronUp className="w-3 h-3" />
                </>
              ) : (
                <>
                  <span className="text-xs">Show all</span>
                  <ChevronDown className="w-3 h-3" />
                </>
              )}
            </button>
          )}
        </div>
        {displayItems.map((item) => (
          <button
            onClick={() => {
              router.push(`/chat/${item.id}`);
              setOpen(false);
            }}
            key={item.id}
            className="w-full p-3 sm:p-2.5 cursor-pointer flex items-center gap-3 text-sm hover:bg-white/5 rounded-lg transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-white/50" />
            <span className="truncate text-left">{item.title}</span>
          </button>
        ))}
      </div>
    );
  };

  const hasAnyChats = groupedChats.today.length > 0 || 
                      groupedChats.yesterday.length > 0 || 
                      groupedChats.older.length > 0;

  return (
    <div className="p-2 sm:p-3">
      <button 
        onClick={async () => {
          try {
            const res = await axios.post('/api/create-api');
            router.push(`/chat/${res.data.chatId}`);
          } catch (e) {
            alert('some error coming up');
            console.log(e);
          }
        }}
        className="w-full p-3 sm:p-2.5 flex items-center gap-3 text-sm hover:bg-white/5 rounded-lg transition-colors"
      >
        <Plus className="h-4 w-4" />
        <span>New chat</span>
      </button>

      {!hasAnyChats ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MessageSquare className="w-12 h-12 text-white/20 mb-4" />
          <p className="text-white/50 text-sm">No chats yet. Start a new conversation!</p>
        </div>
      ) : (
        <div className="mt-4 space-y-6">
          {renderChats(groupedChats.today, "Today")}
          {renderChats(groupedChats.yesterday, "Yesterday")}
          {renderChats(groupedChats.older, "Previous 7 Days")}
        </div>
      )}
    </div>
  );
}

function Section({ title, items  }: {
  title: string; items: {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    userId: string;
  }[];
}) {
  const router = useRouter();
  const {  setOpen } = useDialogStore();
  return (
    <div className="space-y-2">
      <div className="px-3 text-xs text-white/50">{title}</div>
      {items.map((item, index) => (
        <button
         
         onClick={()=>{
          router.push(`/chat/${item.id}`);
          setOpen(false);
         }}
          key={item.id}
          className="w-full p-3 sm:p-2.5 cursor-pointer flex items-center gap-3 text-sm hover:bg-white/5 rounded-lg transition-colors"
        >
          <span className="truncate text-left">{item.title}</span>
        </button>
      ))}
    </div>
  )
}

