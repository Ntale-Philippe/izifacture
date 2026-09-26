import React from "react";
import clsx from "clsx";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface TrendBadgeProps {
  /** Variation (ex. 12 pour +12). Le signe détermine la flèche. */
  value: number;
  /** Unité affichée après la valeur : "%" (défaut) ou " pts". */
  unit?: string;
  /** true quand une baisse est une bonne nouvelle (retards, impayés…). */
  goodWhenDown?: boolean;
  className?: string;
}

/** Pastille de variation : la couleur dit « bon / mauvais », la flèche dit « hausse / baisse ». */
export function TrendBadge({ value, unit = "%", goodWhenDown = false, className }: TrendBadgeProps) {
  const isUp = value >= 0;
  const isGood = goodWhenDown ? !isUp : isUp;
  const Arrow = isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap",
        isGood ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
        className
      )}
    >
      <Arrow size={14} aria-hidden="true" />
      <span className="font-mono">
        {isUp ? "+" : "−"}
        {Math.abs(value)}
        {unit}
      </span>
    </span>
  );
}
