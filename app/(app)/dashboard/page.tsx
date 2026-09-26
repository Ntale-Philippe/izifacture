"use client";

import React from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/dashboard/StatCard";
import { StatusDonut } from "@/components/dashboard/StatusDonut";
import { PaymentRate } from "@/components/dashboard/PaymentRate";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentInvoices } from "@/components/dashboard/RecentInvoices";
import { MobileMoneySplit } from "@/components/dashboard/MobileMoneySplit";
import { Onboarding } from "@/components/dashboard/Onboarding";
import { useAppData } from "@/lib/store";
import { formatFCFA } from "@/lib/format";
import { Wallet, Clock, AlertCircle, FileText, Plus } from "lucide-react";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-36 w-full rounded-2xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="p-6 space-y-6">
            <div className="flex justify-between">
              <Skeleton className="w-12 h-12 rounded-full" />
              <Skeleton className="w-14 h-7 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="w-20 h-4 rounded-full" />
              <Skeleton className="w-36 h-7 rounded-full" />
            </div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Card className="p-6 space-y-6">
          <Skeleton className="w-40 h-5 rounded-full" />
          <Skeleton className="w-52 h-52 rounded-full mx-auto" />
          <Skeleton className="w-full h-8 rounded-lg" />
        </Card>
        <Card className="p-6 space-y-6">
          <Skeleton className="w-36 h-5 rounded-full" />
          <Skeleton className="w-24 h-12 rounded-full mt-16" />
          <Skeleton className="w-full h-3 rounded-full" />
        </Card>
        <Card className="p-6 space-y-5 md:col-span-2 xl:col-span-1">
          <Skeleton className="w-44 h-5 rounded-full" />
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="w-full h-8 rounded-lg" />)}
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { hydrated, invoices, settings } = useAppData();
  const isLoading = !hydrated;

  const sum = (status: string) => invoices.filter((i) => i.status === status).reduce((s, i) => s + i.amount, 0);
  const totalCashed = sum("Payée");
  const totalPending = sum("En attente");
  const totalOverdue = sum("En retard");
  const pendingCount = invoices.filter((i) => i.status === "En attente").length;
  const overdueCount = invoices.filter((i) => i.status === "En retard").length;

  const today = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date());

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {/* Bandeau d'accueil */}
      <div className="relative overflow-hidden rounded-2xl bg-ink text-white p-6 md:p-8 animate-fade-up opacity-0">
        <div className="absolute inset-0 kente-pattern-light" />
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-sm text-white/60 font-medium mb-2 first-letter:uppercase">{today}</p>
            <h1 className="font-display font-bold text-2xl md:text-4xl tracking-tight mb-3">Bonjour, {settings.user.firstName || "à vous"}</h1>
            <p className="text-white/70 max-w-xl">
              {invoices.length === 0 ? (
                <>Bienvenue sur Izifacture. Suivez les étapes ci-dessous pour envoyer votre première facture.</>
              ) : (
                <>
                  <strong className="text-white font-semibold">{pendingCount} facture{pendingCount > 1 ? "s" : ""}</strong> en attente de paiement et{" "}
                  <strong className="text-accent-light font-semibold">{overdueCount} en retard</strong>, soit{" "}
                  <span className="font-mono text-white">{formatFCFA(totalOverdue)}</span> à relancer.
                </>
              )}
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/factures?statut=En%20retard" tabIndex={-1}>
              <Button variant="secondary" className="bg-white/10 border-white/15 text-white hover:bg-white/20 shadow-none">
                Relancer
              </Button>
            </Link>
            <Link href="/factures/nouvelle" tabIndex={-1}>
              <Button>
                <Plus size={18} /> Nouvelle facture
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {invoices.length === 0 ? (
        <Onboarding />
      ) : (
      <>
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Encaissé" value={totalCashed} trend={12} icon={Wallet} delay={0.1} href="/factures?statut=Pay%C3%A9e" />
        <StatCard title="En attente" value={totalPending} trend={-5} icon={Clock} delay={0.15} goodWhenDown href="/factures?statut=En%20attente" />
        <StatCard title="En retard" value={totalOverdue} trend={2} icon={AlertCircle} delay={0.2} goodWhenDown href="/factures?statut=En%20retard" />
        <StatCard title="Factures émises" value={invoices.length} format={false} trend={8} icon={FileText} delay={0.25} href="/factures" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <StatusDonut />
        <PaymentRate />
        <div className="md:col-span-2 xl:col-span-1">
          <MobileMoneySplit />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <RecentInvoices />
        </div>
        <RevenueChart />
      </div>
      </>
      )}
    </div>
  );
}
