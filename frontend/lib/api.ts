import "server-only";

import { cookies } from "next/headers";

export const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8000";
export const AUTH_COOKIE_NAME = "access_token";

/**
 * Server-only fetch helper for the FastAPI backend. Reads the JWT from the
 * httpOnly cookie (never readable by client-side JS) and attaches it as a
 * Bearer token, so callers never have to handle the token directly.
 */
export async function backendFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}
