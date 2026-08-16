export type AuthCredentials = { email: string; password: string };

async function postJson(path: string, body: unknown) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail ?? "Request failed");
  }
  return data;
}

export function registerRequest(credentials: AuthCredentials) {
  return postJson("/api/auth/register", credentials);
}

export function loginRequest(credentials: AuthCredentials) {
  return postJson("/api/auth/login", credentials);
}
