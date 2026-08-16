import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/api";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const backendResponse = await backendFetch(`/expenses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  const data = await backendResponse.json().catch(() => ({}));
  return NextResponse.json(data, { status: backendResponse.status });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const backendResponse = await backendFetch(`/expenses/${id}`, { method: "DELETE" });

  if (backendResponse.status === 204) {
    // A 204 must not have a body - NextResponse.json() would attach one.
    return new NextResponse(null, { status: 204 });
  }

  const data = await backendResponse.json().catch(() => ({}));
  return NextResponse.json(data, { status: backendResponse.status });
}
