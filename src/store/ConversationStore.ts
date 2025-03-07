// store/ConversationStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export type Role = "user" | "assistant";

export interface Conversation {
  id: string;
  content: string;
  role: Role;
  timestamp: string;
  chatId: string;
}

interface ConversationState {
  conversations: Conversation[];
  currentChatId: string | null;
  isLoading: boolean;
  error: string | null;
  streamingMessageId: string | null; // New field

  setCurrentChatId: (chatId: string) => void;
  fetchConversations: (chatId: string) => Promise<void>;
  addConversation: (conversation: Conversation) => void;
  addUserMessage: (content: string) => Promise<void>;
  addAssistantMessage: (content: string) => void;
  updateAssistantMessageStream: (content: string) => void;
  clearConversations: () => void;
  resetConversations: () => void;
}

const useConversationStore = create<ConversationState>()(
  devtools(
    persist(
      (set, get) => ({
        conversations: [],
        currentChatId: null,
        isLoading: false,
        error: null,
        streamingMessageId: null,

        setCurrentChatId: (chatId) => set({ currentChatId: chatId }),

        fetchConversations: async (chatId) => {
          set({ isLoading: true, error: null });
          try {
            const response = await fetch(`/api/conversations/${chatId}`);
            if (!response.ok) throw new Error("Failed to fetch conversations");
            const data = await response.json();
            set({ conversations: data, currentChatId: chatId, isLoading: false, streamingMessageId: null });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : "Unknown error",
              isLoading: false,
            });
          }
        },

        addUserMessage: async (content) => {
          const { currentChatId } = get();
          if (!currentChatId) throw new Error("No current chat ID");
          const userMessage: Conversation = {
            id: Date.now().toString(),
            content,
            role: "user",
            timestamp: new Date().toISOString(),
            chatId: currentChatId,
          };
          set((state) => ({
            conversations: [...state.conversations, userMessage],
          }));
        },

        addAssistantMessage: (content) => {
          const { currentChatId } = get();
          if (!currentChatId) return;
          const assistantMessage: Conversation = {
            id: Date.now().toString(),
            content,
            role: "assistant",
            timestamp: new Date().toISOString(),
            chatId: currentChatId,
          };
          set((state) => ({
            conversations: [...state.conversations, assistantMessage],
            isLoading: false,
          }));
        },

        updateAssistantMessageStream: (content) => {
          const { currentChatId, conversations } = get();
          if (!currentChatId) return;

          const lastMessage = conversations[conversations.length - 1];
          if (lastMessage && lastMessage.role === "assistant" && get().streamingMessageId === lastMessage.id) {
            set((state) => ({
              conversations: [
                ...state.conversations.slice(0, -1),
                { ...lastMessage, content: lastMessage.content + content },
              ],
            }));
          } else {
            const assistantMessage: Conversation = {
              id: Date.now().toString(),
              content,
              role: "assistant",
              timestamp: new Date().toISOString(),
              chatId: currentChatId,
            };
            set((state) => ({
              conversations: [...state.conversations, assistantMessage],
              streamingMessageId: assistantMessage.id,
            }));
          }
        },

        addConversation: (conversation) =>
          set((state) => ({
            conversations: [...state.conversations, conversation],
          })),

        clearConversations: () => set({ conversations: [], streamingMessageId: null }),
        resetConversations: () => set({ 
          conversations: [], 
          currentChatId: null, 
          isLoading: false, 
          error: null, 
          streamingMessageId: null 
        }),
      }),
      {
        name: "conversation-storage",
        partialize: (state) => ({ currentChatId: state.currentChatId }),
      }
    )
  )
);

export default useConversationStore;