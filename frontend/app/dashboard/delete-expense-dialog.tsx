"use client";

import { useEffect, useRef } from "react";

import type { Expense } from "@/lib/expenses-client";

type Props = {
  expense: Expense;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteExpenseDialog({ expense, isDeleting, onCancel, onConfirm }: Props) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-expense-title"
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900"
      >
        <h2 id="delete-expense-title" className="text-lg font-semibold">
          Delete expense?
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          This will permanently delete the{" "}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {expense.category.name}
          </span>{" "}
          expense of{" "}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {expense.amount} {expense.currency}
          </span>{" "}
          from {expense.date}. This can&apos;t be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
