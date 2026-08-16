"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { createCategory, fetchCategories } from "@/lib/categories-client";
import { createExpense } from "@/lib/expenses-client";

import { CategoryCombobox, type CategorySelection } from "../category-combobox";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function NewExpensePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const [category, setCategory] = useState<CategorySelection | null>(null);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(today);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!category) {
        throw new Error("Choose or create a category");
      }

      // Only step that hits the network for a "new" category selection -
      // deferred until here (form submit), not when Enter was pressed in
      // the combobox.
      const categoryId =
        category.mode === "existing" ? category.id : (await createCategory(category.name)).id;

      return createExpense({
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
    <main className="flex flex-1 justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold">Add expense</h1>

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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {mutation.isError && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {mutation.error instanceof Error ? mutation.error.message : "Failed to add expense"}
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {mutation.isPending ? "Adding..." : "Add expense"}
          </button>
        </form>
      </div>
    </main>
  );
}
