import React from "react";
import clsx from "clsx";
import { InvoiceStatus } from "@/lib/data";
import { statusMeta } from "@/lib/status";

interface StatusBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const meta = statusMeta[status];

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
        meta.badge,
        className
      )}
    >
      <span className={clsx("w-1.5 h-1.5 rounded-full", meta.dot)} />
      {status}
    </span>
  );
}
