import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({ id, label, hint, error, children, className }: FormFieldProps) {
  const descriptionId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="block text-sm font-semibold text-foreground">
        {label}
      </label>
      {children}
      {hint && <p id={descriptionId} className="text-xs leading-relaxed text-muted-foreground">{hint}</p>}
      {error && <p id={errorId} role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
