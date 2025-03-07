"use client"



import LoadingDialog from "@/components/global/loading-dialog";
import { ChatDialog } from "@/components/search/SearchDialog"
import { CreatingChatStore } from "@/store/ChatStore";
import { useDialogStore } from "@/store/SearchChats";
import React from "react"


 const HomePageLayout = ({children} : { children : React.ReactNode}) => {
  const {creating} = CreatingChatStore();
  const { open } = useDialogStore();
  return(
    <>
    {creating && <LoadingDialog open={creating}/>}
    {open && <ChatDialog />}
    {children}
    </>
  )
}

export default HomePageLayout