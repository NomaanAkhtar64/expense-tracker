"use client";

import { useMemo, useState, type KeyboardEvent } from "react";

import type { ExpenseCategory } from "@/lib/categories-client";

export type CategorySelection =
  | { mode: "existing"; id: string; name: string }
  | { mode: "new"; name: string };

type Option =
  | { type: "existing"; category: ExpenseCategory }
  | { type: "create"; name: string };

type Props = {
  categories: ExpenseCategory[];
  value: CategorySelection | null;
  onChange: (value: CategorySelection) => void;
};

export function CategoryCombobox({ categories, value, onChange }: Props) {
  const [inputValue, setInputValue] = useState(value?.name ?? "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const trimmed = inputValue.trim();

  const filtered = useMemo(() => {
    const query = trimmed.toLowerCase();
    if (!query) return categories;
    return categories.filter((category) => category.name.toLowerCase().includes(query));
  }, [categories, trimmed]);

  const exactMatch = categories.find(
    (category) => category.name.toLowerCase() === trimmed.toLowerCase(),
  );
  const showCreateOption = trimmed !== "" && !exactMatch;

  const options: Option[] = [
    ...filtered.map((category): Option => ({ type: "existing", category })),
    ...(showCreateOption ? [{ type: "create" as const, name: trimmed }] : []),
  ];

  function selectOption(option: Option) {
    if (option.type === "existing") {
      onChange({ mode: "existing", id: option.category.id, name: option.category.name });
      setInputValue(option.category.name);
    } else {
      onChange({ mode: "new", name: option.name });
      setInputValue(option.name);
    }
    setIsOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      const option = options[highlightedIndex] ?? options[0];
      if (option) {
        // Selecting here only updates local state - for a "create" option
        // that means recording the intent to create a category, not calling
        // the API. The actual POST /categories only happens on form submit.
        event.preventDefault();
        selectOption(option);
      }
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  }

  return (
    <div className="relative">
      <input
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="category-combobox-listbox"
        aria-autocomplete="list"
        value={inputValue}
        onChange={(event) => {
          setInputValue(event.target.value);
          setIsOpen(true);
          setHighlightedIndex(0);
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={() => {
          // Delayed so a click on an option (onMouseDown, below) registers
          // before the dropdown closes.
          window.setTimeout(() => setIsOpen(false), 100);
        }}
        onKeyDown={handleKeyDown}
        placeholder="Search or create a category"
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
      />

      {isOpen && options.length > 0 && (
        <ul
          id="category-combobox-listbox"
          role="listbox"
          className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md border border-gray-200 bg-white text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          {options.map((option, index) => (
            <li
              key={option.type === "existing" ? option.category.id : `create:${option.name}`}
              role="option"
              aria-selected={index === highlightedIndex}
              onMouseDown={(event) => {
                // mousedown (not click) fires before the input's onBlur.
                event.preventDefault();
                selectOption(option);
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`cursor-pointer px-3 py-2 ${
                index === highlightedIndex ? "bg-blue-50 dark:bg-blue-950" : ""
              }`}
            >
              {option.type === "existing" ? (
                option.category.name
              ) : (
                <span>
                  Create <span className="font-medium">&ldquo;{option.name}&rdquo;</span>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
