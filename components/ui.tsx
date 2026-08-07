"use client";

import { ReactNode, CSSProperties } from "react";

export function Card({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={style}
      className={`bg-[var(--surface)] border border-[var(--border)] rounded-[10px] ${className}`}
    >
      {children}
    </div>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <label className="block text-[11px] uppercase tracking-wide text-[var(--text-faint)] mb-1.5 font-medium">
      {children}
    </label>
  );
}

export function Input({
  value,
  onChange,
  type = "text",
  suffix,
  mono = true,
  placeholder,
  name,
  required,
}: {
  value: string | number;
  onChange: (v: string) => void;
  type?: string;
  suffix?: string;
  mono?: boolean;
  placeholder?: string;
  name?: string;
  required?: boolean;
}) {
  const numerico = type === "number";
  return (
    <div className="relative">
      <input
        type={numerico ? "text" : type}
        inputMode={numerico ? "decimal" : undefined}
        name={name}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-[var(--surface-2)] border border-[var(--border-light)] rounded-[7px] px-2.5 py-2 text-[13.5px] outline-none focus:border-[var(--amber)] transition-colors ${
          mono ? "font-mono" : ""
        }`}
      />
      {suffix && (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-[var(--text-faint)] font-mono pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

export function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-[var(--surface-2)] border border-[var(--border-light)] rounded-[7px] px-2.5 py-2 text-[13px]"
    >
      {children}
    </select>
  );
}

export function Btn({
  children,
  onClick,
  type = "button",
  variant = "primary",
  full = false,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "ghost" | "danger";
  full?: boolean;
  disabled?: boolean;
}) {
  const styles = {
    primary: "bg-[var(--amber)] text-[#1a1300] border-transparent",
    ghost: "bg-transparent text-[var(--text)] border-[var(--border-light)]",
    danger: "bg-transparent text-[var(--red)] border-[var(--red)]",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles[variant]} border px-4 py-2 rounded-lg font-semibold text-[13.5px] flex items-center gap-1.5 justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
        full ? "w-full" : ""
      }`}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  color = "muted",
}: {
  children: ReactNode;
  color?: "muted" | "amber" | "green" | "red";
}) {
  const styles = {
    muted: "bg-[var(--surface-2)] text-[var(--text-muted)] border-[var(--border-light)]",
    amber: "bg-[var(--amber-dim)]/30 text-[var(--amber)] border-[var(--amber)]/40",
    green: "bg-[var(--green-dim)]/30 text-[var(--green)] border-[var(--green)]/40",
    red: "bg-[var(--red-dim)]/30 text-[var(--red)] border-[var(--red)]/40",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium ${styles[color]}`}
    >
      {children}
    </span>
  );
}

export function SectionTitle({
  icon,
  children,
}: {
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-3.5 font-display font-semibold text-[14.5px]">
      {icon}
      {children}
    </div>
  );
}
