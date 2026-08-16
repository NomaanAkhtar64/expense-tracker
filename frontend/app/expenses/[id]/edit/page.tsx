import { notFound, redirect } from "next/navigation";

import { backendFetch } from "@/lib/api";
import type { Expense } from "@/lib/expenses-client";

import { EditExpenseForm } from "./edit-expense-form";

export default async function EditExpensePage(props: PageProps<"/expenses/[id]/edit">) {
  const { id } = await props.params;

  const response = await backendFetch(`/expenses/${id}`);

  if (response.status === 401) {
    redirect("/login");
  }
  if (response.status === 404) {
    notFound();
  }
  if (!response.ok) {
    throw new Error("Failed to load expense");
  }

  const expense: Expense = await response.json();

  return (
    <main className="flex flex-1 justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold">Edit expense</h1>
        <EditExpenseForm expense={expense} />
      </div>
    </main>
  );
}
