import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type SurfaceVariant = "default" | "subtle" | "interactive" | "elevated";

interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: "section" | "article" | "div";
  variant?: SurfaceVariant;
}

export function Surface({ as: Comp = "section", variant = "default", className, ...props }: SurfaceProps) {
  return (
    <Comp
      className={cn(
        "rounded-2xl border border-border",
        variant === "default" && "bg-surface shadow-[var(--shadow-card)]",
        variant === "subtle" && "bg-surface-subtle",
        variant === "interactive" && "bg-surface transition-colors hover:border-primary/35 hover:bg-surface-subtle",
        variant === "elevated" && "alumia-elevated",
        className,
      )}
      {...props}
    />
  );
}

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, description, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

interface InlineFeedbackProps {
  children: ReactNode;
  tone?: "info" | "success" | "warning" | "danger";
  id?: string;
}

export function InlineFeedback({ children, tone = "info", id }: InlineFeedbackProps) {
  const tones = {
    info: "border-info/40 bg-info text-info-foreground",
    success: "border-success/40 bg-success text-success-foreground",
    warning: "border-warning/40 bg-warning text-warning-foreground",
    danger: "border-destructive/25 bg-destructive/10 text-destructive",
  };
  return (
    <p id={id} role="status" aria-live="polite" className={cn("rounded-xl border px-4 py-3 text-sm leading-relaxed", tones[tone])}>
      {children}
    </p>
  );
}
