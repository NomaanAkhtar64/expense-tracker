import { NextResponse } from "next/server";

import { BACKEND_URL } from "@/lib/api";

export async function POST(request: Request) {
  const body = await request.json();

  const backendResponse = await fetch(`${BACKEND_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await backendResponse.json().catch(() => ({}));
  return NextResponse.json(data, { status: backendResponse.status });
}
