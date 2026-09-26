import React from "react";
import { clientPalette } from "@/lib/tokens";

// Losange géométrique à 3 faces (motif inspiré des textiles d'Afrique de l'Ouest).
// Les couleurs sont dérivées du nom : un même client garde toujours le même logo.
export function ClientLogo({ name, className = "" }: { name: string; className?: string }) {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const c1 = clientPalette[hash % clientPalette.length];
  const c2 = clientPalette[(hash + 3) % clientPalette.length];
  const c3 = clientPalette[(hash + 5) % clientPalette.length];

  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className}>
      <path d="M20 5L35 15L20 25L5 15L20 5Z" fill={c1} opacity="0.9" />
      <path d="M20 25L35 15V30L20 40V25Z" fill={c2} opacity="0.8" />
      <path d="M20 25V40L5 30V15L20 25Z" fill={c3} opacity="0.7" />
    </svg>
  );
}
