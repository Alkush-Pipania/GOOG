// app/api/conversations/[chatId]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()


export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const { chatId } = params
    
    if (!chatId) {
      return NextResponse.json({ error: "Chat ID is required" }, { status: 400 })
    }
    
    const conversations = await prisma.conversation.findMany({
      where: { chatId },
      orderBy: { timestamp: 'asc' }
    })
    
    return NextResponse.json(conversations)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json(
      { error: "Error fetching chat history", 
        details: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    )
  }
}


