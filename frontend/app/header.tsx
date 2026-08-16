import Link from "next/link";

import { backendFetch } from "@/lib/api";

import { LogoutButton } from "./logout-button";
import { ThemeToggle } from "./theme-toggle";

export async function Header() {
  const response = await backendFetch("/auth/me");
  const isAuthenticated = response.ok;

  return (
    <header className="border-b border-gray-200 dark:border-gray-800">
      <div className="mx-auto flex max-w-3xl items-center justify-between p-4">
        <Link href="/" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Expense Tracker
        </Link>
        <div className="flex items-center gap-3">
          {isAuthenticated && <LogoutButton />}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
