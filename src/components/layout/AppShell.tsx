import type { ReactNode } from "react";
import { BottomNavigation, SidebarNavigation } from "./navigation";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function AppShell({ children, className, contentClassName }: AppShellProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      <SidebarNavigation />
      <div className="lg:pl-64">
        <main className={cn("mx-auto w-full max-w-7xl px-4 pb-28 pt-4 sm:px-5 sm:pt-5 lg:px-6 lg:pb-8 lg:pt-6", contentClassName)}>
          {children}
        </main>
      </div>
      <BottomNavigation />
    </div>
  );
}
