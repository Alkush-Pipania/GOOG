import { useMetaChatStore } from "@/store/chatStore";
import { History, Plus } from "lucide-react"

const chatData = {
  today: [
    { title: "PDF Image Extraction LangChain", icon: History },
    { title: "AI Prompt Test Cases", icon: History },
  ],
  yesterday: [{ title: "Prompt Generator Name Ideas", icon: History }],
  previousDays: [{ title: "Signup Route Implementation", icon: History }],
}

export function ChatList() {
  const { groupedChats } = useMetaChatStore();
  return (
    <div className="p-2 sm:p-3">
      <button className="w-full p-3 sm:p-2.5 flex items-center gap-3 text-sm hover:bg-white/5 rounded-lg transition-colors">
        <Plus className="h-4 w-4" />
        <span>New chat</span>
      </button>

      <div className="mt-4 space-y-6">
        <Section title="Today" items={groupedChats.today} />
        <Section title="Yesterday" items={groupedChats.yesterday} />
        <Section title="Previous 7 Days" items={groupedChats.older} />
      </div>
    </div>
  )
}

function Section({ title, items }: { title: string; items: {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}[]}) {
  return (
    <div className="space-y-2">
      <div className="px-3 text-xs text-white/50">{title}</div>
      {items.slice(0,3).map((item, index) => (
        <button
          key={item.id}
          className="w-full p-3 sm:p-2.5 flex items-center gap-3 text-sm hover:bg-white/5 rounded-lg transition-colors"
        >
          <span className="truncate text-left">{item.title}</span>
        </button>
      ))}
    </div>
  )
}

