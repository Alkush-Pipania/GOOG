// app/api/users/[userId]/chats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  );
};

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    // Extract userId from Clerk's auth (server-side)
    const { userId: clerkUserId } = await auth();

    // Extract userId from route params
    const { userId: routeUserId } = params;

    // Ensure the authenticated user matches the requested userId
    if (!clerkUserId || clerkUserId !== routeUserId) {
      return NextResponse.json({ error: 'Unauthorized or invalid user ID' }, { status: 401 });
    }

    // Extract search query from URL (e.g., ?search=someText)
    const url = new URL(req.url);
    const searchQuery = url.searchParams.get("search")?.trim();

    // Fetch chats from the database with optional search filter
    const chats = await prisma.chat.findMany({
      where: {
        userId: routeUserId,
        ...(searchQuery && {
          title: {
            contains: searchQuery,
            mode: "insensitive", // Case-insensitive search
          },
        }),
      },
      include: {},
      orderBy: { updatedAt: 'desc' },
    });

    // Group chats by date
    const groupedChats = {
      today: [] as any[],
      yesterday: [] as any[],
      older: [] as any[],
    };

    chats.forEach((chat) => {
      const chatDate = new Date(chat.updatedAt);
      if (isToday(chatDate)) {
        groupedChats.today.push(chat);
      } else if (isYesterday(chatDate)) {
        groupedChats.yesterday.push(chat);
      } else {
        groupedChats.older.push(chat);
      }
    });

    return NextResponse.json(groupedChats, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Error fetching user chats',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}