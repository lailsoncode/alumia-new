import type { ReactNode } from "react";
import type { IconSvgElement } from "@hugeicons/react";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { cn } from "@/lib/utils";

interface SettingsRowProps {
  title: string;
  description: string;
  icon?: IconSvgElement;
  iconClassName?: string;
  children?: ReactNode;
  className?: string;
}

export function SettingsRow({ title, description, icon, iconClassName, children, className }: SettingsRowProps) {
  return (
    <div className={cn("flex min-h-16 items-center gap-3 px-3 py-2.5 sm:px-4", className)}>
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {icon && <AlumiaIcon icon={icon} size="md" className={cn("mt-0.5 shrink-0 text-primary", iconClassName)} />}
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
        </div>
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}

