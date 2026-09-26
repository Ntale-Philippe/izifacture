"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { Card, CardHeader } from "@/components/ui/Card";
import { CountUp } from "@/components/ui/CountUp";
import Link from "next/link";
import { useAppData } from "@/lib/store";
import { statusMeta, statusOrder } from "@/lib/status";
import { colors } from "@/lib/tokens";

// Donut SVG : circonférence normalisée à 100 (r = 15.915) pour exprimer
// dasharray directement en pourcentage. Un petit gap sépare les segments.
const R = 15.915;
const GAP = 0.8;

export function StatusDonut() {
  const [drawn, setDrawn] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDrawn(true), 300);
    return () => clearTimeout(t);
  }, []);

  const { invoices } = useAppData();
  const total = invoices.length;
  const segments = statusOrder
    .map((status) => ({ status, count: invoices.filter((i) => i.status === status).length }))
    .filter((s) => s.count > 0);

  let offset = 0;
  const activeSeg = segments.find((s) => s.status === active);

  return (
    <Card className="p-6 flex flex-col animate-fade-up opacity-0" style={{ animationDelay: "0.2s" }}>
      <CardHeader title="Répartition par statut" description="Payées, en attente, en retard et brouillons." />

      <div className="relative w-52 h-52 mx-auto my-6">
        <svg viewBox="0 0 42 42" className="-rotate-90 w-full h-full">
          <circle cx="21" cy="21" r={R} fill="none" stroke={colors.line.soft} strokeWidth="5" />
          {segments.map((s) => {
            const pct = (s.count / total) * 100;
            const dash = drawn ? Math.max(pct - GAP, 0) : 0;
            const el = (
              <circle
                key={s.status}
                cx="21"
                cy="21"
                r={R}
                fill="none"
                stroke={statusMeta[s.status].hex}
                strokeWidth={active === s.status ? 6.5 : 5}
                strokeDasharray={`${dash} ${100 - dash}`}
                strokeDashoffset={-offset}
                onMouseEnter={() => setActive(s.status)}
                onMouseLeave={() => setActive(null)}
                className={clsx(
                  "cursor-pointer transition-all duration-700 ease-out",
                  active && active !== s.status && "opacity-40"
                )}
              >
                <title>{`${s.status} : ${s.count}`}</title>
              </circle>
            );
            offset += pct;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-4xl font-bold font-mono text-ink leading-none">
            {activeSeg ? activeSeg.count : <CountUp value={total} format={false} />}
          </span>
          <span className="text-xs text-muted mt-2">{activeSeg ? activeSeg.status : "Factures au total"}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-auto">
        {segments.map((s) => (
          <Link
            key={s.status}
            href={`/factures?statut=${encodeURIComponent(s.status)}`}
            onMouseEnter={() => setActive(s.status)}
            onMouseLeave={() => setActive(null)}
            className="flex items-center gap-2 text-xs font-medium text-muted hover:text-ink px-2 py-1.5 rounded-lg hover:bg-hover transition-colors"
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusMeta[s.status].hex }} />
            {s.status}
            <span className="ml-auto font-mono text-ink">{s.count}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
