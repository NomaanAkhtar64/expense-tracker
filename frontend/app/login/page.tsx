import { redirect } from "next/navigation";

import { backendFetch } from "@/lib/api";

import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const response = await backendFetch("/auth/me");

  if (response.ok) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <LoginForm />
    </main>
  );
}
