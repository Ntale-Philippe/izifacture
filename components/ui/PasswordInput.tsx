"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "./Input";

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type">;

/** Champ mot de passe avec bouton Afficher / Masquer (évite les fautes de frappe invisibles). */
export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className="pr-12" />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={visible}
        // Centré sur le champ : hauteur du label (14px × 1,65) + écart (6px) + (hauteur du champ − bouton) / 2
        className={`absolute right-1.5 ${props.label ? "top-[33px]" : "top-1"} p-2 text-muted hover:text-ink rounded-lg transition-colors`}
      >
        {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
      </button>
    </div>
  );
}
