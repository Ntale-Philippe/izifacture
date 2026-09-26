import React from "react";
import Link from "next/link";
import clsx from "clsx";
import { Card } from "@/components/ui/Card";
import { CountUp } from "@/components/ui/CountUp";
import { TrendBadge } from "@/components/ui/TrendBadge";

interface StatCardProps {
  title: string;
  value: number;
  /** true (défaut) : montant FCFA ; false : simple nombre. */
  format?: boolean;
  /** Variation en % ; omise = pas de pastille. */
  trend?: number;
  icon: React.ElementType;
  className?: string;
  delay?: number;
  goodWhenDown?: boolean; // ex. retards : une baisse est une bonne nouvelle
  /** Rend la carte cliquable (ex. vers la liste filtrée). */
  href?: string;
  /** Texte secondaire sous la valeur. */
  hint?: string;
}

export function StatCard({ title, value, format = true, trend, icon: Icon, className, delay = 0, goodWhenDown = false, href, hint }: StatCardProps) {
  const card = (
    <Card hoverable className={clsx("p-6 flex flex-col gap-4 h-full animate-fade-up opacity-0", href && "cursor-pointer", className)} style={{ animationDelay: `${delay}s` }}>
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 bg-accent/10 text-accent rounded-full flex items-center justify-center transition-transform duration-300 group-hover/card:scale-110 group-hover/card:-rotate-6">
          <Icon size={24} aria-hidden="true" />
        </div>
        {trend !== undefined && <TrendBadge value={trend} goodWhenDown={goodWhenDown} />}
      </div>
      <div>
        <p className="text-muted text-sm font-medium mb-1">{title}</p>
        <p className="font-mono text-2xl font-bold text-ink tracking-tight">
          <CountUp value={value} format={false} />
          {format && <span className="text-sm font-medium text-muted ml-1.5">FCFA</span>}
        </p>
        {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
      </div>
    </Card>
  );

  return href ? (
    <Link href={href} className="block h-full rounded-2xl" aria-label={`${title} : voir le détail`}>
      {card}
    </Link>
  ) : (
    card
  );
}
