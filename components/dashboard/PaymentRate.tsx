"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { TrendBadge } from "@/components/ui/TrendBadge";
import { CountUp } from "@/components/ui/CountUp";
import { useAppData } from "@/lib/store";
import { formatFCFA } from "@/lib/format";

export function PaymentRate() {
  const [rate, setRate] = useState(0);

  // Les brouillons ne sont pas encore facturés : exclus du taux.
  const { invoices } = useAppData();
  const issued = invoices.filter((i) => i.status !== "Brouillon");
  const totalAmount = issued.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = issued.filter((i) => i.status === "Payée").reduce((sum, inv) => sum + inv.amount, 0);
  const targetRate = totalAmount ? Math.round((paidAmount / totalAmount) * 100) : 0;

  useEffect(() => {
    const timer = setTimeout(() => setRate(targetRate), 400);
    return () => clearTimeout(timer);
  }, [targetRate]);

  return (
    <Card className="p-6 flex flex-col animate-fade-up opacity-0" style={{ animationDelay: "0.3s" }}>
      <CardHeader
        title="Taux de paiement"
        description="Part du montant émis déjà encaissée."
        action={<TrendBadge value={6} unit=" pts" />}
      />

      <div className="mt-auto pt-8">
        <span className="font-mono text-5xl font-bold text-ink tracking-tight">
          <CountUp value={targetRate} format={false} />%
        </span>

        <div className="h-3 w-full bg-line-soft rounded-full overflow-hidden mt-6">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-accent-warm transition-[width] duration-1000 ease-out"
            style={{ width: `${rate}%` }}
          />
        </div>

        <div className="flex justify-between mt-4 text-sm">
          <div>
            <p className="text-xs text-muted">Encaissé</p>
            <p className="font-mono font-bold text-ink">{formatFCFA(paidAmount)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">Émis</p>
            <p className="font-mono font-bold text-ink">{formatFCFA(totalAmount)}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
