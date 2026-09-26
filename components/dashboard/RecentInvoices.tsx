"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ClientLogo } from "@/components/ui/ClientLogo";
import { useAppData } from "@/lib/store";
import { formatFCFA, formatDate } from "@/lib/format";

export function RecentInvoices() {
  const router = useRouter();
  const { invoices, getClient } = useAppData();
  const recent = [...invoices].sort((a, b) => b.date.localeCompare(a.date) || b.number.localeCompare(a.number)).slice(0, 5);

  return (
    <Card className="flex flex-col h-full animate-fade-up opacity-0" style={{ animationDelay: "0.6s" }}>
      <CardHeader
        className="p-6 border-b border-line"
        title="Factures récentes"
        action={
          <Link href="/factures" className="group text-sm font-medium text-accent flex items-center gap-1">
            <span className="link-underline">Voir tout</span>
            <ArrowRight size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        }
      />
      <div className="flex-1 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-bg text-muted font-medium text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3">Client</th>
              <th className="px-6 py-3 hidden sm:table-cell">Date</th>
              <th className="px-6 py-3 text-right">Montant</th>
              <th className="px-6 py-3 text-center">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {recent.map((inv) => {
              const name = getClient(inv.clientId)?.name ?? "Client supprimé";
              return (
                <tr key={inv.id} onClick={() => router.push(`/factures/${inv.id}`)} className="hover:bg-hover transition-colors cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <ClientLogo name={name} className="w-8 h-8 shrink-0" />
                      <div className="min-w-0">
                        <Link href={`/factures/${inv.id}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-ink hover:text-accent transition-colors truncate block">
                          {name}
                        </Link>
                        <div className="font-mono text-xs text-muted">{inv.number}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted font-mono hidden sm:table-cell whitespace-nowrap">{formatDate(inv.date)}</td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-ink whitespace-nowrap">{formatFCFA(inv.amount)}</td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={inv.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
