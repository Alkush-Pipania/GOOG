"use client";

import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@clerk/nextjs";
import DeepseekChatInput from "./ChatInput";
import { useMediaQuery } from "@/hooks/use-media-query";



export default function ChatInterface({ greetings} : {greetings : string}) {
  const isMobile = useMediaQuery("(max-width: 768px)")

  

  return (
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
  );
}