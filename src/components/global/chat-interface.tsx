"use client";

import { Suspense } from "react";
import DeepseekChatInput from "./ChatInput";
import { useMediaQuery } from "@/hooks/use-media-query";
import Chatcomponent from "@/app/chat/[id]/_components/Chatcomponent";
import Header from "@/components/global/header"
import { useMsgSentStore } from "@/store/ChatStore";



export default function ChatInterface({ userid, greetings }: {userid: string| null , greetings: string }) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const {sent}= useMsgSentStore();


  return (
    <main className="flex min-h-screen flex-col bg-GoogBG text-white">
      <Header userid={userid} />
    {!sent ? (<>
    

    <div className="flex-1 flex flex-col items-center justify-center px-4">
    <div className={`w-full max-w-3xl flex flex-col items-center ${isMobile ? "mt-16" : ""} mb-8`}>
        <Suspense >
          <div className="text-center mb-12">
            <h1 className="text-2xl md:text-3xl font-medium mb-2">{greetings}</h1>
            <p className="text-gray-400 text-lg font-DontWorry md:text-2xl">What's on your mind?</p>
          </div>
        </Suspense>

        <div className={`w-full ${isMobile ? "mt-auto" : "mt-8"}`}>
          <DeepseekChatInput />
        </div>
      </div>
    </div>
  </>):(
    <></>
  )}
    </main>
  );
}