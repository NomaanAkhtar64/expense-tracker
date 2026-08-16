"use client";

import type { Expense } from "@/lib/expenses-client";

import { ConfirmDialog } from "./confirm-dialog";

type Props = {
  expense: Expense;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function DeleteExpenseDialog({ expense, isDeleting, onCancel, onConfirm }: Props) {
  return (
    <ConfirmDialog
      title="Delete expense?"
      description={
        <>
          This will permanently delete the{" "}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {expense.category.name}
          </span>{" "}
          expense of{" "}
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {expense.amount} {expense.currency}
          </span>{" "}
          from {expense.date}. This can&apos;t be undone.
        </>
      }
      confirmLabel="Delete"
      confirmingLabel="Deleting..."
      isConfirming={isDeleting}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
