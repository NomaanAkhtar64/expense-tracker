import { redirect } from "next/navigation";

import { backendFetch } from "@/lib/api";

import { LogoutButton } from "./logout-button";

type CurrentUser = {
  id: string;
  email: string;
  created_at: string;
};

export default async function DashboardPage() {
  const response = await backendFetch("/auth/me");

  if (!response.ok) {
    redirect("/login");
  }

  const user: CurrentUser = await response.json();

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-600">
          Logged in as <span className="font-medium text-gray-900">{user.email}</span>
        </p>
        <LogoutButton />
      </div>
    </main>
  );
}
