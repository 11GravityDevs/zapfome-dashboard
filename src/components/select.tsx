"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/cn";

export type SelectOption = {
  value: string;
  label: string;
};

export type SelectProps = {
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: ReactNode;
  disabled?: boolean;
  className?: string;
  id?: string;
};

export function Select({
  value,
  onChange,
  options,
  placeholder,
  label,
  hint,
  error,
  leadingIcon,
  disabled,
  className,
  id,
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const listboxId = `${selectId}-listbox`;
  const hasError = Boolean(error);

  const [open, setOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption?.label ?? placeholder ?? "";

  const close = useCallback(() => {
    setOpen(false);
    setFocusedIndex(-1);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open, close]);

  useEffect(() => {
    if (!open || focusedIndex < 0) return;
    const items = listRef.current?.children;
    if (items?.[focusedIndex]) {
      (items[focusedIndex] as HTMLElement).scrollIntoView({ block: "nearest" });
    }
  }, [open, focusedIndex]);

  function toggle() {
    if (disabled || options.length === 0) return;
    setOpen((prev) => {
      if (!prev) {
        const idx = options.findIndex((o) => o.value === value);
        setFocusedIndex(idx >= 0 ? idx : 0);
      }
      return !prev;
    });
  }

  function selectOption(opt: SelectOption) {
    onChange?.(opt.value);
    close();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;

    switch (e.key) {
      case "Enter":
      case " ": {
        e.preventDefault();
        if (!open) {
          toggle();
        } else if (focusedIndex >= 0 && focusedIndex < options.length) {
          selectOption(options[focusedIndex]);
        }
        break;
      }
      case "ArrowDown": {
        e.preventDefault();
        if (!open) {
          toggle();
        } else {
          setFocusedIndex((i) => Math.min(i + 1, options.length - 1));
        }
        break;
      }
      case "ArrowUp": {
        e.preventDefault();
        if (open) {
          setFocusedIndex((i) => Math.max(i - 1, 0));
        }
        break;
      }
      case "Escape": {
        if (open) {
          e.preventDefault();
          close();
        }
        break;
      }
    }
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)} ref={containerRef}>
      {label && (
        <label id={`${selectId}-label`} className="text-xs font-medium text-font-secondary">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          id={selectId}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={open ? listboxId : undefined}
          aria-labelledby={label ? `${selectId}-label` : undefined}
          aria-invalid={hasError || undefined}
          aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
          aria-activedescendant={
            open && focusedIndex >= 0 ? `${selectId}-opt-${focusedIndex}` : undefined
          }
          disabled={disabled}
          onClick={toggle}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex w-full cursor-pointer items-center gap-2 rounded-md border bg-bg-card px-4 h-11 text-left transition-colors",
            "focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30",
            hasError
              ? "border-accent-red"
              : open
                ? "border-brand-primary ring-2 ring-brand-primary/30"
                : "border-border",
            disabled && "opacity-60 cursor-not-allowed",
          )}
        >
          {leadingIcon && <span className="text-font-secondary shrink-0">{leadingIcon}</span>}
          <span
            className={cn(
              "flex-1 truncate text-sm",
              selectedOption ? "text-font-primary" : "text-font-secondary",
            )}
          >
            {displayLabel}
          </span>
          <ChevronDown
            size={16}
            className={cn(
              "shrink-0 text-font-secondary transition-transform duration-150",
              open && "rotate-180",
            )}
          />
        </button>

        {open && (
          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-labelledby={label ? `${selectId}-label` : selectId}
            className="absolute left-0 z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-border bg-bg-card shadow-card"
          >
            {options.map((opt, index) => {
              const isSelected = opt.value === value;
              const isFocused = index === focusedIndex;
              return (
                <li
                  key={opt.value}
                  id={`${selectId}-opt-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setFocusedIndex(index)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectOption(opt)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm transition-colors",
                    isFocused && "bg-bg-hover",
                    isSelected ? "font-medium text-brand-primary" : "text-font-primary",
                  )}
                >
                  <span className="flex-1">{opt.label}</span>
                  {isSelected && <Check size={16} className="shrink-0 text-brand-primary" />}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {error ? (
        <p id={`${selectId}-error`} className="text-xs font-medium text-accent-red">
          {error}
        </p>
      ) : hint ? (
        <p id={`${selectId}-hint`} className="text-xs text-font-secondary">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
