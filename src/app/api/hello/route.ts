import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("Hello from the route!");
  return NextResponse.json({ message: "Hello from the route!" });
}