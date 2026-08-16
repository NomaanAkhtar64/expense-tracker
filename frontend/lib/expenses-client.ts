import type { ExpenseCategory } from "./categories-client";

export type Expense = {
  id: string;
  category: ExpenseCategory;
  amount: string;
  currency: string;
  description: string | null;
  date: string;
  created_at: string;
  updated_at: string;
};

export type ExpenseCreateInput = {
  category_id: string;
  amount: string;
  currency: string;
  description: string | null;
  date: string;
};

export async function fetchExpenses(): Promise<Expense[]> {
  const response = await fetch("/api/expenses");
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail ?? "Failed to load expenses");
  }
  return data;
}

export async function createExpense(input: ExpenseCreateInput): Promise<Expense> {
  const response = await fetch("/api/expenses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail ?? "Failed to create expense");
  }
  return data;
}

export async function updateExpense(id: string, input: ExpenseCreateInput): Promise<Expense> {
  const response = await fetch(`/api/expenses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail ?? "Failed to update expense");
  }
  return data;
}

export async function deleteExpense(id: string): Promise<void> {
  const response = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail ?? "Failed to delete expense");
  }
}

export async function deleteExpenses(ids: string[]): Promise<void> {
  // No bulk-delete endpoint on the backend - fire the single-delete calls in
  // parallel instead.
  await Promise.all(ids.map((id) => deleteExpense(id)));
}
