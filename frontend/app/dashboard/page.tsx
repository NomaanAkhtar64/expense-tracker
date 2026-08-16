import { redirect } from "next/navigation";

import { backendFetch } from "@/lib/api";

import { ExpenseList } from "./expense-list";

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
    <main className="flex flex-1 justify-center p-6">
      <div className="w-full max-w-3xl space-y-8">
        <ExpenseList />
      </div>
    </main>
  );
}
