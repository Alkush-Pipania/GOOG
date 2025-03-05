import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface Chat {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

interface GroupedChats {
  today: Chat[];
  yesterday: Chat[];
  older: Chat[];
}

interface ChatStore {
  groupedChats: GroupedChats;
  setGroupedChats: (groupedChats: GroupedChats) => void;
  addChat: (chat: Chat) => void;
  deleteChat: (id: string) => void;
  // Helper method to get all chats (if needed for backward compatibility)
  getAllChats: () => Chat[];
}

export const useMetaChatStore = create<ChatStore>()(
  devtools((set, get) => ({
    groupedChats: {
      today: [],
      yesterday: [],
      older: []
    },
    
    setGroupedChats: (groupedChats) => set(() => ({ groupedChats })),
    
    addChat: (chat: Chat) => {
      // Determine which group the chat belongs to based on its createdAt date
      const now = new Date();
      const chatDate = new Date(chat.createdAt);
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      
      let targetGroup: 'today' | 'yesterday' | 'older';
      
      if (chatDate.toDateString() === now.toDateString()) {
        targetGroup = 'today';
      } else if (chatDate.toDateString() === yesterday.toDateString()) {
        targetGroup = 'yesterday';
      } else {
        targetGroup = 'older';
      }
      
      set((state) => ({
        groupedChats: {
          ...state.groupedChats,
          [targetGroup]: [...state.groupedChats[targetGroup], chat]
        }
      }));
    },
    
    deleteChat: (id) => {
      set((state) => ({
        groupedChats: {
          today: state.groupedChats.today.filter(chat => chat.id !== id),
          yesterday: state.groupedChats.yesterday.filter(chat => chat.id !== id),
          older: state.groupedChats.older.filter(chat => chat.id !== id)
        }
      }));
    },
    
    getAllChats: () => {
      const { groupedChats } = get();
      return [
        ...groupedChats.today,
        ...groupedChats.yesterday,
        ...groupedChats.older
      ];
    }
  }))
);


interface Dialog{
  open : boolean;
  setOpen : (open : boolean)=> void;
}

export const useDialogStore = create<Dialog>((set)=>({
  open : false,
  setOpen : (open) => set({open})
}))