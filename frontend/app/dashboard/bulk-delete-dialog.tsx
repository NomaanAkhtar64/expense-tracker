"use client";

import { ConfirmDialog } from "./confirm-dialog";

type Props = {
  count: number;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function BulkDeleteDialog({ count, isDeleting, onCancel, onConfirm }: Props) {
  const noun = count === 1 ? "expense" : "expenses";

  return (
    <ConfirmDialog
      title={`Delete ${count} ${noun}?`}
      description={`This will permanently delete the ${count} selected ${noun}. This can't be undone.`}
      confirmLabel={`Delete ${count} ${noun}`}
      confirmingLabel="Deleting..."
      isConfirming={isDeleting}
      onCancel={onCancel}
      onConfirm={onConfirm}
    />
  );
}
