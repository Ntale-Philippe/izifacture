import React from "react";

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  /** Action(s) principale(s) de la page, alignées à droite (1 bouton primary max). */
  actions?: React.ReactNode;
}

/** En-tête standard de page (hors Dashboard, qui a son bandeau). */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-up opacity-0">
      <div className="min-w-0">
        <h1 className="font-display font-bold text-3xl md:text-4xl text-ink tracking-tight text-balance">{title}</h1>
        {description && <p className="text-sm text-muted mt-1 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
