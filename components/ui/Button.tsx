import React from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    const baseStyles = "relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 ease-brand overflow-hidden hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group";
    
    const variants = {
      primary: "bg-accent text-white shadow-warm-md hover:shadow-warm-lg",
      secondary: "bg-card text-ink border border-line shadow-warm-sm hover:bg-hover hover:border-muted/30",
      ghost: "text-ink hover:bg-hover",
      danger: "bg-danger text-white hover:bg-danger/90",
    };

    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-5 text-sm",
      lg: "h-14 px-8 text-base",
    };

    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {variant === "primary" && (
          <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
        )}
        <span className={clsx("flex items-center gap-2 relative z-10", isLoading && "opacity-0")}>
          {children}
        </span>
        {isLoading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="animate-spin" size={20} />
          </span>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
