// app/api/chat/route.ts
import { model, systemPrompts } from "@/actions/environment";
import { ChatService } from "@/actions/server/chat.service";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const chatService = new ChatService(model, systemPrompts);

export async function POST(req: Request) {
  console.log("Method: POST"); // Debug
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { userInput, promptType, chatId } = body;
  if (!userInput || !promptType) {
    return NextResponse.json({ error: "Missing userInput or promptType" }, { status: 400 });
  }

  try {
    const result = await chatService.processUserInput({
      userInput,
      promptType,
      userId,
      chatId,
    });
    console.log("Result:", result);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}