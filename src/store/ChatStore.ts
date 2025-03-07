import { Search } from 'lucide-react';
import { create } from 'zustand'

// interface Dialog{
//   open : boolean;
//   setOpen : (open : boolean) => void;
// }

// export const useDialogStore = create<Dialog>((set)=>({
//   open : false,
//   setOpen : (open : boolean) => set({open})
// }))

interface LoadProp {
  isloaded: boolean;
  setLoading: (open: boolean) => void;
  resetLoaded: () => void;
}

export const useResponseLoadStore = create<LoadProp>((set) => ({
  isloaded: false,
  setLoading: (isloaded: boolean) => set({ isloaded }),
  resetLoaded: () => set({ isloaded: false })
}))


interface MsgProp {
  sent: boolean;
  setSentStatus: (open: boolean) => void;
  resetSent: () => void;
}

export const useMsgSentStore = create<MsgProp>((set) => ({
  sent: false,
  setSentStatus: (sent: boolean) => set({ sent }),
  resetSent: () => set({ sent: false })
}))


interface SearchProp {
  search: string;
  setSearch: (search: string) => void;
}

export const UseSearchStore = create<SearchProp>((set) => (
  {
    search: "",
    setSearch: (search: string) => set({ search })
  }
))

interface createProps {
  creating: boolean;
  setCreate: (change: boolean) => void;
}

export const CreatingChatStore = create<createProps>((set) => (
  {
    creating: false,
    setCreate: (change: boolean) => set({ creating : change })
  }
))
