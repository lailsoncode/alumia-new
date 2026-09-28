import type { ReactNode } from "react";
import { BottomNavigation, SidebarNavigation } from "./navigation";
import { Greeting } from "@/components/shared/Greeting";
import { cn } from "@/lib/utils";
import { MODULE_THEMES, type ModuleKey } from "@/lib/module-themes";
import { AchievementCelebration } from "@/components/shared/achievements";
import { FloatingAlumia } from "@/components/shared/alumia-presence";

interface AppShellProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  headerRole?: string;
  moduleKey?: ModuleKey;
}

export function AppShell({ children, className, contentClassName, headerRole, moduleKey }: AppShellProps) {
  return (
    <div className={cn("min-h-screen bg-background", moduleKey && MODULE_THEMES[moduleKey].themeClass, className)} data-module={moduleKey}>
      <SidebarNavigation />
      <div className="lg:pl-64">
        <main className={cn("mx-auto w-full max-w-7xl px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-[calc(0.75rem+env(safe-area-inset-top))] sm:px-5 sm:pt-[calc(1rem+env(safe-area-inset-top))] lg:px-6 lg:pb-6 lg:pt-[calc(1.25rem+env(safe-area-inset-top))]", contentClassName)}>
          <div className="space-y-3">
            <Greeting role={headerRole} />
            {children}
          </div>
        </main>
      </div>
      <FloatingAlumia />
      <BottomNavigation />
      <AchievementCelebration />
    </div>
  );
}
