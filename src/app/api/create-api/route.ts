// app/api/chats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const user = await currentUser();

  if (!user || !user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Ensure user exists in local DB
    await prisma.user.upsert({
      where: { id: user.id },
      update: {}, // No update needed if exists
      create: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      },
    });

    const chat = await prisma.chat.create({
      data: {
        userId: user.id,
        title: "Untitled Chat",
      },
    });
    console.log(chat)
    return NextResponse.json({ chatId: chat.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}