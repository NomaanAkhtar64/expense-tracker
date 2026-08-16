export type ExpenseCategory = {
  id: string;
  user_id: string | null;
  name: string;
};

export async function fetchCategories(): Promise<ExpenseCategory[]> {
  const response = await fetch("/api/categories");
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail ?? "Failed to load categories");
  }
  return data;
}

export async function createCategory(name: string): Promise<ExpenseCategory> {
  const response = await fetch("/api/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail ?? "Failed to create category");
  }
  return data;
}
