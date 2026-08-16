"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { deleteExpense, deleteExpenses, fetchExpenses } from "@/lib/expenses-client";

import { BulkDeleteDialog } from "./bulk-delete-dialog";
import { DeleteExpenseDialog } from "./delete-expense-dialog";

function SelectAllCheckbox({
  total,
  selectedCount,
  onChange,
}: {
  total: number;
  selectedCount: number;
  onChange: (checked: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const allSelected = total > 0 && selectedCount === total;
  const someSelected = selectedCount > 0 && !allSelected;

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={allSelected}
      onChange={(event) => onChange(event.target.checked)}
      aria-label="Select all expenses"
      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700"
    />
  );
}

export function ExpenseList() {
  const queryClient = useQueryClient();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkConfirming, setBulkConfirming] = useState(false);

  const {
    data: expenses,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["expenses"],
    queryFn: fetchExpenses,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: (_data, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setConfirmingId(null);
      setSelectedIds((prev) => {
        if (!prev.has(deletedId)) return prev;
        const next = new Set(prev);
        next.delete(deletedId);
        return next;
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: deleteExpenses,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      setSelectedIds(new Set());
      setBulkConfirming(false);
    },
  });

  const confirmingExpense = expenses?.find((expense) => expense.id === confirmingId) ?? null;

  function toggleSelected(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  function toggleSelectAll(checked: boolean) {
    setSelectedIds(checked ? new Set(expenses?.map((expense) => expense.id)) : new Set());
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Expenses</h2>
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={() => setBulkConfirming(true)}
              className="rounded-md border border-red-600 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-500 dark:text-red-400 dark:hover:bg-red-950"
            >
              Delete {selectedIds.size} expense{selectedIds.size === 1 ? "" : "s"}
            </button>
          )}
          <Link
            href="/expenses/new"
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Add expense
          </Link>
        </div>
      </div>

      {isLoading && <p className="text-sm text-gray-600 dark:text-gray-400">Loading expenses...</p>}

      {isError && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error instanceof Error ? error.message : "Failed to load expenses"}
        </p>
      )}

      {deleteMutation.isError && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {deleteMutation.error instanceof Error
            ? deleteMutation.error.message
            : "Failed to delete expense"}
        </p>
      )}

      {bulkDeleteMutation.isError && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {bulkDeleteMutation.error instanceof Error
            ? bulkDeleteMutation.error.message
            : "Failed to delete expenses"}
        </p>
      )}

      {expenses && expenses.length === 0 && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No expenses yet. Add your first one to get started.
        </p>
      )}

      {expenses && expenses.length > 0 && (
        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-800">
          <table className="min-w-full divide-y divide-gray-200 text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/60">
              <tr>
                <th scope="col" className="w-10 px-4 py-2">
                  <SelectAllCheckbox
                    total={expenses.length}
                    selectedCount={selectedIds.size}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400"
                >
                  Category
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-4 py-2 text-right font-medium text-gray-600 dark:text-gray-400"
                >
                  Amount
                </th>
                <th scope="col" className="px-4 py-2 text-right">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="w-10 px-4 py-2">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(expense.id)}
                      onChange={(event) => toggleSelected(expense.id, event.target.checked)}
                      aria-label={`Select ${expense.category.name} expense from ${expense.date}`}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700"
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {expense.date}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {expense.category.name}
                  </td>
                  <td className="px-4 py-2 text-gray-500 dark:text-gray-400">
                    {expense.description ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-right font-medium whitespace-nowrap text-gray-900 dark:text-gray-100">
                    {expense.amount} {expense.currency}
                  </td>
                  <td className="px-4 py-2 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/expenses/${expense.id}/edit`}
                        className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => setConfirmingId(expense.id)}
                        className="font-medium text-red-600 hover:underline dark:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmingExpense && (
        <DeleteExpenseDialog
          expense={confirmingExpense}
          isDeleting={deleteMutation.isPending}
          onCancel={() => setConfirmingId(null)}
          onConfirm={() => deleteMutation.mutate(confirmingExpense.id)}
        />
      )}

      {bulkConfirming && (
        <BulkDeleteDialog
          count={selectedIds.size}
          isDeleting={bulkDeleteMutation.isPending}
          onCancel={() => setBulkConfirming(false)}
          onConfirm={() => bulkDeleteMutation.mutate(Array.from(selectedIds))}
        />
      )}
    </section>
  );
}
