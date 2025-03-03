import {create} from 'zustand'

// interface Dialog{
//   open : boolean;
//   setOpen : (open : boolean) => void;
// }

// export const useDialogStore = create<Dialog>((set)=>({
//   open : false,
//   setOpen : (open : boolean) => set({open})
// }))

interface LoadProp{
  isloaded : boolean;
  setLoading : (open : boolean) => void;
}

export const useResponseLoadStore = create<LoadProp>((set)=>({
  isloaded : false,
  setLoading : (isloaded : boolean) => set({isloaded})
}))


interface MsgProp{
  sent : boolean;
  setSentStatus : (open : boolean) => void;
}

export const useMsgSentStore = create<MsgProp>((set)=>({
  sent : false,
  setSentStatus : (sent : boolean) => set({sent})
}))

