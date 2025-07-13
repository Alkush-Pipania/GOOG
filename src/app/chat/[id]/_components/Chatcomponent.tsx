"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { ArrowDown, ArrowUp, Check, ChevronDown, ChevronUp, Copy, HelpCircle, RefreshCw, ThumbsDown, ThumbsUp } from "lucide-react"
import useConversationStore from "@/store/ConversationStore"
import type { Conversation } from "@/store/ConversationStore"
import InputBox from "../../_components/Input-Box"
import formatAssistantMessage from "@/actions/parsing"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useMsgSentStore, useResponseLoadStore } from "@/store/ChatStore"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

function Chatcomponent({ greetings }: { greetings: string }) {
  const { id: chatId } = useParams<{ id: string }>()
  const {
    conversations,
    currentChatId,
    isLoading,
    error,
    fetchConversations,
    streamingMessageId,
    setCurrentChatId,
    resetConversations,
  } = useConversationStore()
  const { isloaded, resetLoaded } = useResponseLoadStore()
  const {sent, setSentStatus, resetSent} = useMsgSentStore();

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isNewChat, setIsNewChat] = useState(false)

  // Reset all states when chatId changes
  useEffect(() => {
    if (chatId && chatId !== currentChatId) {
      setIsTransitioning(true)
      setIsInitialLoad(true)
      resetConversations()
      resetLoaded()
      resetSent()
      setCurrentChatId(chatId)
      
      // Check if this is a new chat by checking if the ID is a timestamp
      const isNew = /^\d{13}$/.test(chatId)
      setIsNewChat(isNew)
      
      if (!isNew) {
        fetchConversations(chatId)
      } else {
        setIsTransitioning(false)
        setIsInitialLoad(false)
      }
    }
  }, [chatId, currentChatId, fetchConversations, setCurrentChatId, resetConversations, resetLoaded, resetSent])

  // Update states after conversations are loaded
  useEffect(() => {
    if (conversations.length > 0) {
      setSentStatus(true)
      setIsInitialLoad(false)
      setIsTransitioning(false)
    } else if (!isLoading) {
      // If there are no conversations and loading is complete, show greetings
      setIsInitialLoad(false)
      setIsTransitioning(false)
    }
  }, [conversations, setSentStatus, isLoading])

  // Handle loading state timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isLoading && isInitialLoad && !isNewChat) {
      timeoutId = setTimeout(() => {
        setIsTransitioning(false)
        setIsInitialLoad(false)
      }, 5000); // 5 second timeout for loading state
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [isLoading, isInitialLoad, isNewChat])

  // Check if mobile
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768)
    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Scroll to bottom when conversations update or loading completes
  useEffect(() => {
    if (!isLoading && !isloaded) {
      scrollToBottom()
    }
  }, [conversations, isLoading, isloaded])

  // Show scroll-to-bottom button when user scrolls up
  useEffect(() => {
    const container = chatContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200)
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const getFormattedContent = (message: Conversation) => {
    if (message.role === "user") {
      return { prompt: message.content }
    }

    const isStreaming = message.id === streamingMessageId
    if (isStreaming) {
      return { prompt: message.content } 
    }

    try {
      return formatAssistantMessage(message.content) 
    } catch (error) {
      console.error("Formatting error:", error)
      return { prompt: message.content } 
    }
  }

  useEffect(() => {
    if (conversations.length > 0 && conversations[conversations.length - 1].role === "user") {
      scrollToBottom()
    }
  }, [conversations, scrollToBottom])

  useEffect(() => {
    if (isloaded) {
      scrollToBottom();
    }
  }, [isloaded]);


  const [copied, setCopied] = useState<boolean>(false)
  const [isPromptExpanded, setIsPromptExpanded] = useState<boolean>(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const copyContent = () => {
    if (contentRef.current) {
      // Extract heading
      const heading = contentRef.current.querySelector('h1')?.textContent || ''
      
      // Extract steps
      const stepsList = contentRef.current.querySelector('ol')
      const steps = stepsList 
        ? Array.from(stepsList.querySelectorAll('li'))
          .map(li => li.textContent)
          .join('\n') 
        : ''
      
      // Extract prompt
      const promptElement = contentRef.current.querySelector('.whitespace-pre-wrap')
      const prompt = promptElement?.textContent || ''
      
      // Construct formatted clipboard text
      const clipboardText = `${heading}\n\n--- What I Want ---\n${steps}\n\n---Your Task ---\n${prompt}`
      
      // Copy to clipboard
      navigator.clipboard.writeText(clipboardText).then(() => {
        toast("Copied to clipboard")
        setCopied(true)
        
        // Reset copied state after 2 seconds
        setTimeout(() => {
          setCopied(false)
        }, 2000)
      }).catch(err => {
        console.error('Failed to copy:', err)
        toast("Failed to copy")
      })
    }
  }

  return (
    <div className="flex flex-col h-screen bg-GoogBG text-white">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto my-4 px-6 py-8 sm:mb-0 mb-32 max-w-4xl mx-auto w-full hide-scrollbar relative"
      >
        {error && (
          <div className="bg-red-500/20 text-red-200 p-4 rounded-lg mb-4">
            Error: {error}
          </div>
        )}

        {(isInitialLoad && isLoading && !isNewChat && conversations.length > 0) || (isTransitioning && !isNewChat && conversations.length > 0) ? (
          <div className="flex-1 md:mt-3 flex flex-col items-center justify-center px-4">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex space-x-2 items-center">
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                <div className="w-3 h-3 bg-gray-400 rounded-full animate-pulse delay-300"></div>
              </div>
              <p className="text-gray-400 text-lg">
                {isTransitioning ? "Loading new chat..." : "Loading your chat..."}
              </p>
            </div>
          </div>
        ) : !sent && !isLoading ? (
          <div className="flex-1 md:mt-3 flex flex-col items-center justify-center px-4">
            <div className={`w-full max-w-3xl flex flex-col items-center ${isMobile ? "mt-16" : ""} mb-8`}>
              <Suspense>
                <div className="text-center mb-12">
                  <h1 className="text-2xl md:text-3xl font-medium mb-2">{greetings}</h1>
                  <p className="text-gray-500 text-lg font-DontWorry md:text-2xl">What's on your mind?</p>
                </div>
              </Suspense>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-12">
            {conversations.map((message: Conversation) => {
              const formattedContent = getFormattedContent(message)
              return (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] md:max-w-[70%] ${message.role === "user" ? "bg-SenderBG rounded-2xl px-4 py-2" : ""
                      }`}
                  >
                    {message.role === "user" ? (
                      <p>{formattedContent.prompt}</p>
                    ) : (
                      <TooltipProvider delayDuration={300}>
                        <div className="w-full max-w-3xl mx-auto p-4 space-y-6">
                          <Card className="border-2 border-none  bg-transparent shadow-lg overflow-hidden">
                            <CardHeader className=" text-white pb-4">
                              <div className="flex justify-between gap-x-1 items-center">
                                <CardTitle className="text-xl font-bold">{formattedContent.heading}</CardTitle>
                                {formattedContent.steps && formattedContent.steps.length > 0 && (
                                  <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={copyContent}
                                  className="flex items-center gap-1 hover:bg-GoogBG/50 cursor-copy hover:text-white  bg-GoogBG text-white/70 border-gray-500"
                                >
                                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                  <span className="hidden sm:inline">{copied ? "Copied!" : "Copy Template"}</span>
                                </Button>
                                )}
                              </div>
                            </CardHeader>

                            {formattedContent.steps && formattedContent.steps.length > 0 &&(
                              <div ref={contentRef}>
                              <CardContent className="p-6 space-y-6 bg-[#2E3033] text-white">
                                {formattedContent.steps && formattedContent.steps.length > 0 && (
                                  <div>
                                    <h2 className="text-xl font-semibold mb-3">Steps:</h2>
                                    <ol className="space-y-2 pl-6 list-decimal">
                                      {formattedContent.steps.map((step: string, index: number) => (
                                        <li key={index} className="text-sm sm:text-base">
                                          {step}
                                        </li>
                                      ))}
                                    </ol>
                                  </div>
                                )}

                                <Separator className="bg-slate-600" />

                                {
                                  formattedContent.prompt && (
                                    <div>
                                      <div className="flex justify-between items-center mb-3">
                                        <h2 className="text-xl font-semibold">Prompt:</h2>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                                          className="flex items-center gap-1 text-white hover:bg-slate-600"
                                        >
                                          {isPromptExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                          <span className="text-xs">{isPromptExpanded ? "Collapse" : "Expand"}</span>
                                        </Button>
                                      </div>
                                      <Card className="bg-black text-white border-none">
                                        <CardContent className="p-4">
                                          <ScrollArea className={isPromptExpanded ? "h-60" : "h-28"}>
                                            <p className="text-sm sm:text-base whitespace-pre-wrap">{formattedContent.prompt}</p>
                                          </ScrollArea>
                                        </CardContent>
                                      </Card>
                                    </div>
                                  )
                                }
                              </CardContent>
                            </div>
                            )}

                            {/* <Separator className="bg-slate-600 h-1" /> */}

                            {formattedContent.followUpQuestions && formattedContent.followUpQuestions.length > 0 && (
                              <CardFooter className="flex flex-col p-6 bg-[#2E3033]  text-white">
                                <div className="flex justify-between items-center w-full mb-3">
                                  <h2 className="text-xl font-semibold">Follow-up Questions:</h2>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
                                        <HelpCircle className="h-5 w-5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs bg-slate-700 text-white border-slate-600">
                                      <p>Answering these questions will help create a more effective and personalized UI design prompt.</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <div className="grid gap-3 w-full">
                                  {formattedContent.followUpQuestions.map((question: string, index: number) => (
                                    <Tooltip key={index}>
                                      <TooltipTrigger asChild>
                                        <div className="relative">
                                          <Input
                                            value={question}
                                            readOnly
                                            className="pr-10 bg-[#4A6A8A] hover:bg-slate-600 text-white border-slate-600 cursor-pointer transition-colors"
                                            onClick={(e) => {
                                              navigator.clipboard.writeText(question)
                                              const target = e.target as HTMLInputElement
                                              const originalValue = target.value
                                              target.value = "Copied!"
                                              setTimeout(() => {
                                                target.value = originalValue
                                              }, 1000)
                                            }}
                                          />
                                        </div>
                                      </TooltipTrigger>
                                      {/* <TooltipContent side="left" className="bg-slate-700 text-white border-slate-600">
                      <p>Answer this to improve your prompt</p>
                    </TooltipContent> */}
                                    </Tooltip>
                                  ))}
                                </div>
                              </CardFooter>
                            )}
                          </Card>
                        </div>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              )
            })}

            {(isLoading || isloaded) && !isTransitioning && (
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
        )}
        <div ref={messagesEndRef} />

        {/* Scroll-to-bottom button */}
        {showScrollButton && (
          <Button
            onClick={scrollToBottom}
            className="fixed sm:bottom-36  lg:right-2/4 bottom-40 right-8 sm:right-24 rounded-full p-3 bg-SenderBG hover:bg-SenderBG/80 shadow-lg z-10"
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="w-5 h-5" />
          </Button>
        )}
      </div>
      <InputBox id={chatId} isMobile={isMobile} />
    </div>
  )
}

export default Chatcomponent