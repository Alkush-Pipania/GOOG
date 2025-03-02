import {create} from 'zustand'

interface Dialog{
  open : boolean;
  setOpen : (open : boolean) => void;
}

export const useDialogStore = create<Dialog>((set)=>({
  open : false,
  setOpen : (open : boolean) => set({open})
}))

interface LoadProp{
  isLoading : boolean;
  setLoading : (open : boolean) => void;
}

export const useResponseLoadStore = create<LoadProp>((set)=>({
  isLoading : false,
  setLoading : (isLoading : boolean) => set({isLoading})
}))