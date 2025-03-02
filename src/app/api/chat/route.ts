// app/api/chat/route.ts
import { model, systemPrompts } from "@/actions/environment";
import { ChatService } from "@/actions/server/chat.service";
import { auth } from "@clerk/nextjs/server";

const chatService = new ChatService(model, systemPrompts);

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { userInput, promptType, chatId } = body;
  if (!userInput || !promptType) {
    return new Response("Missing userInput or promptType", { status: 400 });
  }

  try {
    const stream : any = await chatService.processUserInput({
      userInput,
      promptType,
      userId,
      chatId,
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("API error in /api/chat:", error);
    return new Response("Internal server error", { status: 500 });
  }
}