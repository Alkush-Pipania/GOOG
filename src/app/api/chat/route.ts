// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ChatService } from '@/actions/server/chat.service';
import { model, systemPrompts } from '@/actions/environment';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const chatService = new ChatService(model, systemPrompts);

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { userInput, promptType, chatId } = body;

  // Validate inputs
  if (!promptType) {
    return new Response("Missing promptType", { status: 400 });
  }

  try {
    let finalChatId = chatId;

    // If no chatId is provided, create a new chat
    if (!chatId) {
      const chat = await prisma.chat.create({
        data: {
          title: userInput ? userInput.substring(0, 50) + "..." : "New Chat",
          userId,
        },
      });
      finalChatId = chat.id;
    }

    if (!finalChatId) {
      return new Response("Failed to create or find chat", { status: 500 });
    }

    // If userInput is provided, process it
    if (userInput) {
      try {
        const stream: any = await chatService.processUserInput({
          userInput,
          promptType,
          userId,
          chatId: finalChatId,
        });

        // Create a TransformStream to handle the response
        const encoder = new TextEncoder();
        const streamResponse = new ReadableStream({
          async start(controller) {
            try {
              stream.on('data', (chunk: string) => {
                controller.enqueue(encoder.encode(chunk));
              });

              stream.on('end', () => {
                controller.close();
              });

              stream.on('error', (error: Error) => {
                console.error('Stream error:', error);
                controller.error(error);
              });
            } catch (error) {
              console.error('Stream processing error:', error);
              controller.error(error);
            }
          }
        });

        return new Response(streamResponse, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } catch (error) {
        console.error('Error processing user input:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to process request' }), 
          { 
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
      }
    }

    // If no userInput, return the chatId for redirection
    return NextResponse.json({ chatId: finalChatId }, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}