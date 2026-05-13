"use client";

import { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  rightElement?: ReactNode;
}

export default function Input({ icon, rightElement, className = "", ...props }: InputProps) {
  return (
    <div className="relative flex items-center">
      {icon && (
        <span className="absolute left-3 text-[var(--foreground-muted)] pointer-events-none">
          {icon}
        </span>
      )}
      <input
        className={`w-full bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] rounded-lg py-2.5 pr-4 text-sm outline-none focus:border-[var(--accent)] transition-colors ${icon ? "pl-10" : "pl-4"} ${className}`}
        {...props}
      />
      {rightElement && (
        <span className="absolute right-3 text-[var(--foreground-muted)]">
          {rightElement}
        </span>
      )}
    </div>
  );
}
