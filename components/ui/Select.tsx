import React from "react";
import clsx from "clsx";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-ink">{label}</label>}
        <select
          ref={ref}
          className={clsx(
            "w-full px-4 py-2.5 bg-bg border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 appearance-none",
            error ? "border-danger focus:ring-danger/20" : "border-line focus:border-accent/50 focus:ring-accent/20 hover:border-muted/30",
            className
          )}
          style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2378716C' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-xs text-danger font-medium">{error}</span>}
      </div>
    );
  }
);
Select.displayName = "Select";
