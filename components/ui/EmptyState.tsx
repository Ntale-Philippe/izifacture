import React from "react";
import { FolderOpen, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

/** État vide : icône douce + titre encourageant + une phrase + CTA optionnel. */
export function EmptyState({ title, description, icon: Icon = FolderOpen, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center rounded-2xl border border-dashed border-muted/30 bg-bg">
      <div className="w-16 h-16 bg-card rounded-full shadow-warm-sm border border-line flex items-center justify-center text-accent mb-4">
        <Icon size={28} aria-hidden="true" />
      </div>
      <h3 className="font-display font-bold text-lg text-ink mb-2 text-balance">{title}</h3>
      <p className="text-muted text-sm max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}
