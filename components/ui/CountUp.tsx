"use client";

import React, { useEffect, useRef, useState } from "react";
import { formatFCFA, formatNumber } from "@/lib/format";

interface CountUpProps {
  value: number;
  duration?: number;
  format?: boolean;
}

function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

// Anime de la valeur affichée actuelle vers la nouvelle : 0 → valeur au premier
// rendu, puis transitions douces lors des mises à jour (totaux en direct).
export function CountUp({ value, duration = 1200, format = true }: CountUpProps) {
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);

  useEffect(() => {
    const from = currentRef.current;
    const delta = value - from;
    if (delta === 0) return;

    let raf: number;
    let start: number | null = null;
    const animate = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / duration, 1);
      const next = p === 1 ? value : from + delta * easeOutExpo(p);
      currentRef.current = next;
      setCurrent(next);
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{format ? formatFCFA(current) : formatNumber(current)}</>;
}
