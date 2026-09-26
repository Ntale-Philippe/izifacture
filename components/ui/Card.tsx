import React from "react";
import clsx from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Carte cliquable ou résumé interactif : lévitation + ombre au survol. */
  hoverable?: boolean;
}

export function Card({ className, hoverable, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "group/card bg-card rounded-2xl border border-line shadow-warm-sm overflow-hidden",
        hoverable && "transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-warm-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: React.ReactNode;
  /** Élément aligné à droite : badge de tendance, lien « Voir tout »… */
  action?: React.ReactNode;
  className?: string;
}

/** Titre standard d'une carte : H3 display 16px + description muted 14px. */
export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <div className={clsx("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h3 className="font-display font-bold text-ink">{title}</h3>
        {description && <p className="text-sm text-muted mt-1">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
