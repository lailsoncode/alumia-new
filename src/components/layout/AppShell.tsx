import type { ReactNode } from "react";
import { BottomNavigation, SidebarNavigation } from "./navigation";
import { Greeting } from "@/components/shared/Greeting";
import { cn } from "@/lib/utils";
import { MODULE_THEMES, type ModuleKey } from "@/lib/module-themes";

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
        <main className={cn("mx-auto w-full max-w-7xl px-4 pb-28 pt-3 sm:px-5 sm:pt-4 lg:px-6 lg:pb-6 lg:pt-5", contentClassName)}>
          <div className="space-y-3">
            <Greeting role={headerRole} />
            {children}
          </div>
        </main>
      </div>
      <BottomNavigation />
    </div>
  );
}
