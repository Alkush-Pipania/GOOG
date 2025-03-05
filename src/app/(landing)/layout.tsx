"use client"



import { ChatDialog } from "@/components/search/SearchDialog"
import { useDialogStore } from "@/store/SearchChats";
import React from "react"

 const HomePageLayout = ({children} : { children : React.ReactNode}) => {
  const { open } = useDialogStore();
  return(
    <>
    {open && <ChatDialog />}
    {children}
    </>
  )
}

export default HomePageLayout