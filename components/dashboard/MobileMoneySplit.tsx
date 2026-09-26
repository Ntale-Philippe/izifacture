"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { useAppData } from "@/lib/store";
import { formatFCFA } from "@/lib/format";
import { channelColors as channelColor } from "@/lib/tokens";

export function MobileMoneySplit() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(t);
  }, []);

  const { invoices } = useAppData();
  const pmStats = invoices
    .filter((i) => i.status === "Payée" && i.paymentMethod)
    .reduce((acc, inv) => {
      acc[inv.paymentMethod!] = (acc[inv.paymentMethod!] || 0) + inv.amount;
      return acc;
    }, {} as Record<string, number>);

  const total = Object.values(pmStats).reduce((a, b) => a + b, 0);
  const sortedStats = Object.entries(pmStats).sort((a, b) => b[1] - a[1]);
  const mobileShare = total
    ? Math.round((sortedStats.filter(([m]) => m !== "Virement Bancaire" && m !== "Espèces").reduce((s, [, v]) => s + v, 0) / total) * 100)
    : 0;

  return (
    <Card className="p-6 h-full flex flex-col animate-fade-up opacity-0" style={{ animationDelay: "0.4s" }}>
      <CardHeader
        title="Canaux d'encaissement"
        description={<><span className="font-mono font-bold text-accent">{mobileShare}%</span> encaissés via Mobile Money.</>}
      />

      <div className="space-y-5 mt-6">
        {sortedStats.map(([method, amount]) => {
          const percent = Math.round((amount / total) * 100);
          return (
            <div key={method}>
              <div className="flex justify-between items-baseline text-sm mb-2">
                <span className="flex items-center gap-2 font-medium text-ink">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: channelColor[method] }} />
                  {method}
                </span>
                <span className="font-mono text-xs text-muted">
                  {formatFCFA(amount)} · <span className="text-ink font-bold">{percent}%</span>
                </span>
              </div>
              <div className="h-2 w-full bg-line-soft rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-1000 ease-out"
                  style={{ width: ready ? `${percent}%` : "0%", backgroundColor: channelColor[method] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
