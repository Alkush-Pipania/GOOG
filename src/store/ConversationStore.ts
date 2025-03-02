
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export type Role = 'user' | 'assistant'

export interface Conversation {
  id: string
  content: string
  role: Role
  timestamp: string
  chatId: string
}

interface ConversationState {
  conversations: Conversation[]
  currentChatId: string | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setCurrentChatId: (chatId: string) => void
  fetchConversations: (chatId: string) => Promise<void>
  addConversation: (conversation: Conversation) => void
  addUserMessage: (content: string) => Promise<void>
  addAssistantMessage: (content: string) => void
  clearConversations: () => void
}

const useConversationStore = create<ConversationState>()(
  devtools(
    persist(
      (set, get) => ({
        conversations: [],
        currentChatId: null,
        isLoading: false,
        error: null,
        
        setCurrentChatId: (chatId) => set({ currentChatId: chatId }),
        
        fetchConversations: async (chatId) => {
          set({ isLoading: true, error: null })
          try {
            const response = await fetch(`/api/conversations/${chatId}`)
            if (!response.ok) throw new Error('Failed to fetch conversations')
            
            const data = await response.json()
            set({ conversations: data, currentChatId: chatId, isLoading: false })
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Unknown error',
              isLoading: false 
            })
          }
        },
        
        addConversation: (conversation) => {
          set((state) => ({
            conversations: [...state.conversations, conversation]
          }))
        },
        
        addUserMessage: async (content) => {
          const { currentChatId } = get()
          if (!currentChatId) return
          
          // Optimistically update UI
          const tempId = Date.now().toString()
          const userMessage: Conversation = {
            id: tempId,
            content,
            role: 'user',
            timestamp: new Date().toISOString(),
            chatId: currentChatId
          }
          
          set((state) => ({
            conversations: [...state.conversations, userMessage]
          }))
          
          // Send to backend
          try {
            const response = await fetch('/api/conversations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(userMessage)
            })
            
            if (!response.ok) throw new Error('Failed to save message')
            
            // Could update with the actual ID from server if needed
            const savedMessage = await response.json()
            
            // Handle AI response - this could be in a separate function
            // but keeping it here for simplicity
            set({ isLoading: true })
            const aiResponse = await fetch('/api/ai-response', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                message: content, 
                chatId: currentChatId 
              })
            })
            
            if (!aiResponse.ok) throw new Error('Failed to get AI response')
            
            const aiMessageData = await aiResponse.json()
            get().addAssistantMessage(aiMessageData.content)
            
          } catch (error) {
            set({ 
              error: error instanceof Error ? error.message : 'Unknown error',
              isLoading: false 
            })
          }
        },
        
        addAssistantMessage: (content) => {
          const { currentChatId } = get()
          if (!currentChatId) return
          
          const assistantMessage: Conversation = {
            id: Date.now().toString(),
            content,
            role: 'assistant',
            timestamp: new Date().toISOString(),
            chatId: currentChatId
          }
          
          set((state) => ({
            conversations: [...state.conversations, assistantMessage],
            isLoading: false
          }))
          
          // You might want to save this to the backend as well
          fetch('/api/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(assistantMessage)
          }).catch(error => {
            console.error('Failed to save assistant message:', error)
          })
        },
        
        clearConversations: () => set({ conversations: [] })
      }),
      {
        name: 'conversation-storage',
        partialize: (state) => ({ 
          currentChatId: state.currentChatId 
          // Only persist what's necessary, conversations will be loaded from API
        })
      }
    )
  )
)

export default useConversationStore