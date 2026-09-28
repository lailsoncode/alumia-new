import type { ReactNode } from "react";
import type { IconSvgElement } from "@hugeicons/react";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Surface } from "@/components/ui/surface";
import { cn } from "@/lib/utils";

interface AlumiaModuleIntroProps {
  image: string;
  imageAlt: string;
  title: string;
  description: string;
  icon?: IconSvgElement;
  badge?: ReactNode;
  className?: string;
}

export function AlumiaModuleIntro({
  image,
  imageAlt,
  title,
  description,
  icon,
  badge,
  className,
}: AlumiaModuleIntroProps) {
  return (
    <Surface className={cn("module-surface overflow-hidden p-2 shadow-none sm:p-2.5", className)}>
      <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-2.5 min-[380px]:grid-cols-[5rem_minmax(0,1fr)] sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-3">
        <img
          src={image}
          alt={imageAlt}
          className="h-20 w-full rounded-lg object-cover sm:h-24"
          decoding="async"
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
            <h2 className="flex min-w-0 items-start gap-1.5 font-display text-sm font-semibold leading-snug text-foreground sm:text-base">
              {icon && <AlumiaIcon icon={icon} size="sm" className="module-text mt-0.5 shrink-0" />}
              <span>{title}</span>
            </h2>
            {badge}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-foreground/80 sm:text-sm">{description}</p>
        </div>
      </div>
    </Surface>
  );
}
