import React from "react";
import clsx from "clsx";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && <label className="text-sm font-medium text-ink">{label}</label>}
        <textarea
          ref={ref}
          className={clsx(
            "w-full px-4 py-2.5 bg-bg border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 min-h-[100px] resize-y",
            error ? "border-danger focus:ring-danger/20" : "border-line focus:border-accent/50 focus:ring-accent/20 hover:border-muted/30",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-danger font-medium">{error}</span>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
