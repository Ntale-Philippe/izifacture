"use client";

import React, { useState } from "react";
import clsx from "clsx";
import { Card, CardHeader } from "@/components/ui/Card";
import { TrendBadge } from "@/components/ui/TrendBadge";
import { formatFCFA } from "@/lib/format";
import { colors } from "@/lib/tokens";
import { useAppData } from "@/lib/store";
import { todayISO } from "@/lib/invoice";

const MONTHS = ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];

const W = 300;
const H = 140;

export function RevenueChart() {
  const [hover, setHover] = useState<number | null>(null);
  const { invoices } = useAppData();

  // Encaissements des 6 derniers mois (date de paiement), mois courant inclus.
  const [year, month] = todayISO().split("-").map(Number);
  const data = Array.from({ length: 6 }, (_, k) => {
    const d = new Date(year, month - 1 - (5 - k), 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const value = invoices
      .filter((i) => i.status === "Payée" && (i.paidAt ?? i.dueDate).startsWith(key))
      .reduce((s, i) => s + i.amount, 0);
    return { month: MONTHS[d.getMonth()], year: d.getFullYear(), value };
  });
  const max = Math.max(1, ...data.map((d) => d.value)) * 1.1;
  const pts = data.map((d, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - (d.value / max) * H,
  }));
  const line = pts.map((p, i) => `${i ? "L" : "M"}${p.x},${p.y}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;

  const shown = hover ?? data.length - 1;
  const last = data[data.length - 1].value;
  const prev = data[data.length - 2].value;
  const growth = prev ? Math.round(((last - prev) / prev) * 100) : 0;

  return (
    <Card className="p-6 h-full flex flex-col animate-fade-up opacity-0" style={{ animationDelay: "0.5s" }}>
      <CardHeader title="Encaissements" description="6 derniers mois" action={<TrendBadge value={growth} />} />

      <div className="mt-4">
        <p className="font-mono text-2xl font-bold text-ink tracking-tight">{formatFCFA(data[shown].value)}</p>
        <p className="text-xs text-muted">{data[shown].month} {data[shown].year}</p>
      </div>

      <div className="relative mt-4 flex-1 min-h-[160px]" onMouseLeave={() => setHover(null)}>
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.accent.DEFAULT} stopOpacity="0.25" />
              <stop offset="100%" stopColor={colors.accent.DEFAULT} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75].map((f) => (
            <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke={colors.line.DEFAULT} strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
          ))}
          <g className="chart-reveal">
            <path d={area} fill="url(#revenueGradient)" />
            <path
              d={line}
              fill="none"
              stroke={colors.accent.DEFAULT}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
          <line x1={pts[shown].x} x2={pts[shown].x} y1="0" y2={H} stroke={colors.accent.DEFAULT} strokeOpacity="0.25" vectorEffect="non-scaling-stroke" />
        </svg>
        {/* Point actif positionné en HTML pour rester rond malgré preserveAspectRatio="none" */}
        <span
          className="absolute w-3 h-3 rounded-full bg-accent ring-4 ring-accent/20 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-200"
          style={{ left: `${(pts[shown].x / W) * 100}%`, top: `${(pts[shown].y / H) * 100}%` }}
        />
        <div className="absolute inset-0 flex">
          {data.map((d, i) => (
            <button
              key={d.month}
              aria-label={`${d.month} : ${formatFCFA(d.value)}`}
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              className="flex-1 focus:outline-none"
            />
          ))}
        </div>
      </div>

      <div className="flex justify-between mt-3 text-xs text-muted font-mono">
        {data.map((d, i) => (
          <span key={d.month} className={clsx("transition-colors", i === shown && "text-accent font-bold")}>
            {d.month}
          </span>
        ))}
      </div>
    </Card>
  );
}
