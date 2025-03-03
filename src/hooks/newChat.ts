import prisma from "@/lib/prisma";
import { useAuth } from "@clerk/nextjs";

export async function CreateChat() {
  const { userId } = useAuth();
  
  if (!userId) {
    return {
      error: true,
      message: "User not found"
    };
  }

  try {
    const chatId = await prisma.chat.create({
      data: {
        userId: userId,  
        title: "New Chat" 
      }
    });
    
    return {
      error: false,
      chatId: chatId.id
    };
  } catch (e) {
    console.error("Error creating chat:", e);
    return {
      error: true,
      message: "Failed to create chat"
    };
  }
}