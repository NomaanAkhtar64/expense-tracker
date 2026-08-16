import { redirect } from "next/navigation";

import { backendFetch } from "@/lib/api";

export default async function Home() {
  const response = await backendFetch("/auth/me");
  redirect(response.ok ? "/dashboard" : "/login");
}
