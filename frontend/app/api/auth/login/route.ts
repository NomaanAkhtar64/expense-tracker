import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, BACKEND_URL } from "@/lib/api";

export async function POST(request: Request) {
  const body = await request.json();

  const backendResponse = await fetch(`${BACKEND_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!backendResponse.ok) {
    const error = await backendResponse.json().catch(() => ({ detail: "Login failed" }));
    return NextResponse.json(error, { status: backendResponse.status });
  }

  const data: { access_token: string } = await backendResponse.json();

  const response = NextResponse.json({ ok: true });

  // httpOnly means client-side JS (and any XSS payload that ends up running
  // on the page) can never read or exfiltrate this cookie, unlike a token
  // stored in localStorage. The browser only ever sends it back to this
  // origin over subsequent requests.
  response.cookies.set(AUTH_COOKIE_NAME, data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 30,
  });

  return response;
}
