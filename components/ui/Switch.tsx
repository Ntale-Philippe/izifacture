"use client";

import React from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Libellé affiché à gauche ; toute la ligne est cliquable. */
  label: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  id?: string;
}

/** Interrupteur à ressort, présenté en ligne cliquable (rounded-xl). */
export function Switch({ checked, onChange, label, description, disabled, id }: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={clsx(
        "w-full min-h-11 px-3 py-2.5 border rounded-xl text-sm font-medium flex items-center justify-between gap-3 text-left transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        checked ? "bg-accent/5 border-accent/40 text-ink" : "bg-bg border-line text-muted hover:border-muted/30 hover:text-ink"
      )}
    >
      <span className="min-w-0">
        <span className="block">{label}</span>
        {description && <span className="block text-xs font-normal text-muted mt-0.5">{description}</span>}
      </span>
      <span className={clsx("relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0", checked ? "bg-accent" : "bg-line")}>
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 600, damping: 30 }}
          className={clsx(
            "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-warm-md flex items-center justify-center",
            checked ? "right-0.5" : "left-0.5"
          )}
        >
          {checked && <Check size={10} className="text-accent" strokeWidth={3} aria-hidden="true" />}
        </motion.span>
      </span>
    </button>
  );
}
