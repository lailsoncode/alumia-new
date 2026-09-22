import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";

const sizes = { xs: 14, sm: 18, md: 22, lg: 28, xl: 36 } as const;

interface AlumiaIconProps {
  icon: IconSvgElement;
  size?: keyof typeof sizes;
  label?: string;
  className?: string;
  strokeWidth?: number;
}

export function AlumiaIcon({ icon, size = "md", label, className, strokeWidth = 1.7 }: AlumiaIconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={sizes[size]}
      strokeWidth={strokeWidth}
      className={cn("shrink-0", className)}
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
    />
  );
}
