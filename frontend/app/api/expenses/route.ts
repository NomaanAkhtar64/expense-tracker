import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/api";

export async function GET() {
  const backendResponse = await backendFetch("/expenses");
  const data = await backendResponse.json().catch(() => ({}));
  return NextResponse.json(data, { status: backendResponse.status });
}

export async function POST(request: Request) {
  const body = await request.json();
  const backendResponse = await backendFetch("/expenses", {
    method: "POST",
    body: JSON.stringify(body),
  });
  const data = await backendResponse.json().catch(() => ({}));
  return NextResponse.json(data, { status: backendResponse.status });
}
