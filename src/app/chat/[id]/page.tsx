"use client"

import { useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { ArrowUp, Copy, Edit, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react"
import useConversationStore from "@/store/ConversationStore"
import { Conversation } from "@/store/ConversationStore"
import InputBox from "../_components/Input-Box"

export default  function ChatPage() {
  const { id: chatId } =  useParams<{ id: string }>()
  const {
    conversations,
    currentChatId,
    isLoading,
    error,
    fetchConversations,
    addUserMessage,
    setCurrentChatId
  } = useConversationStore()
  

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  

  // Check if mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkIfMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Load chat history when component mounts or chatId changes
  useEffect(() => {
    if (chatId && chatId !== currentChatId) {
      setCurrentChatId(chatId)
      fetchConversations(chatId)
    }
  }, [chatId, currentChatId, fetchConversations, setCurrentChatId])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [conversations])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }


  return (
    <div className="flex flex-col h-screen bg-GoogBG text-white">
      {/* Chat container */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto my-4 px-6 py-8 sm:mb-0 
      mb-32 max-w-4xl mx-auto w-full hide-scrollbar">
        {error && (
          <div className="bg-red-500/20 text-red-200 p-4 rounded-lg mb-4">
            Error: {error}
          </div>
        )}
        
        <div className="flex flex-col space-y-12">
          {conversations.map((message : Conversation) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] md:max-w-[70%] ${message.role === "user" ? "bg-SenderBG rounded-2xl px-4 py-2" : ""}`}
              >
                {message.role === "user" ? (
                  <p>{message.content}</p>
                ) : (
                  <div>
                    <p className="whitespace-pre-line">{message.content}</p>
                    <div className="flex mt-4 space-x-3">
                      <button className="p-1 rounded-full hover:bg-gray-800">
                        <RefreshCw className="w-5 h-5" />
                      </button>
                      <button className="p-1 rounded-full hover:bg-gray-800">
                        <Copy className="w-5 h-5" />
                      </button>
                      <button className="p-1 rounded-full hover:bg-gray-800">
                        <ArrowUp className="w-5 h-5 transform rotate-45" />
                      </button>
                      <button className="p-1 rounded-full hover:bg-gray-800">
                        <ThumbsUp className="w-5 h-5" />
                      </button>
                      <button className="p-1 rounded-full hover:bg-gray-800">
                        <ThumbsDown className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] md:max-w-[70%]">
                <div className="flex space-x-2 items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                  <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse delay-300"></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <InputBox id={chatId} isMobile={isMobile} />
    </div>
  )
}

