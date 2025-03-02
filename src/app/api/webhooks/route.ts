import { Webhook } from "svix";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error("Missing WEBHOOK_SECRET");
    return new Response("Missing WEBHOOK_SECRET", { status: 500 });
  }

  const headerPayload = headers();
  const svix_id = (await headerPayload).get("svix-id");
  const svix_timestamp = (await headerPayload).get("svix-timestamp");
  const svix_signature = (await headerPayload).get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("Missing Svix headers");
    return new Response("Missing Svix headers", { status: 400 });
  }

  const payload = await req.json();
  console.log("Webhook payload:", JSON.stringify(payload, null, 2));

  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);
  try {
    wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.log("Verification failed:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  if (payload.type === "user.created") {
    const { id, email_addresses, first_name, last_name } = payload.data;
    const email = email_addresses[0]?.email_address;
    const createdAt = new Date(payload.data.created_at); // Convert timestamp to Date

    console.log("Syncing user:", { id, email, first_name, last_name, createdAt });

    try {
      await prisma.user.upsert({
        where: { id },
        update: {
          email,
          firstName: first_name,
          lastName: last_name,
          updatedAt: new Date(),
        },
        create: {
          id,
          email,
          firstName: first_name,
          lastName: last_name,
          createdAt,
        },
      });
      console.log("User synced successfully");
      return new Response("User synced", { status: 200 });
    } catch (dbErr) {
      console.log("Database error:", dbErr);
      return new Response("Database error", { status: 500 });
    }
  }

  return new Response("Event ignored", { status: 200 });
}


export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}