"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { createCategory, fetchCategories } from "@/lib/categories-client";
import { updateExpense, type Expense } from "@/lib/expenses-client";

import { CategoryCombobox, type CategorySelection } from "../../category-combobox";

export function EditExpenseForm({ expense }: { expense: Expense }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const [category, setCategory] = useState<CategorySelection | null>({
    mode: "existing",
    id: expense.category.id,
    name: expense.category.name,
  });
  const [amount, setAmount] = useState(expense.amount);
  const [currency, setCurrency] = useState(expense.currency);
  const [description, setDescription] = useState(expense.description ?? "");
  const [date, setDate] = useState(expense.date);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!category) {
        throw new Error("Choose or create a category");
      }

      const categoryId =
        category.mode === "existing" ? category.id : (await createCategory(category.name)).id;

      return updateExpense(expense.id, {
        category_id: categoryId,
        amount,
        currency,
        description: description.trim() === "" ? null : description,
        date,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      router.push("/dashboard");
      router.refresh();
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="category" className="text-sm font-medium">
          Category
        </label>
        <CategoryCombobox categories={categories} value={category} onChange={setCategory} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2 space-y-1">
          <label htmlFor="amount" className="text-sm font-medium">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="currency" className="text-sm font-medium">
            Currency
          </label>
          <input
            id="currency"
            type="text"
            required
            minLength={3}
            maxLength={3}
            value={currency}
            onChange={(e) => setCurrency(e.target.value.toUpperCase())}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="date" className="text-sm font-medium">
          Date
        </label>
        <input
          id="date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="text-sm font-medium">
          Description <span className="text-gray-400 dark:text-gray-500">(optional)</span>
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
        />
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {mutation.error instanceof Error ? mutation.error.message : "Failed to save expense"}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="flex-1 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {mutation.isPending ? "Saving..." : "Save changes"}
        </button>
        <Link
          href="/dashboard"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
