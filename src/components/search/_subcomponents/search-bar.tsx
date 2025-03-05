import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { UseSearchStore } from "@/store/ChatStore"

export function SearchBar() {
  const {setSearch} = UseSearchStore();

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
      <Input
       onChange={(e)=> setSearch(e.target.value)}
        placeholder="Search chats..."
        className="pl-9 bg-white/5 border-0 text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  )
}

