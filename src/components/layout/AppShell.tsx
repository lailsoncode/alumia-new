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
        <main className={cn("mx-auto w-full max-w-6xl px-4 pb-32 pt-7 sm:px-6 sm:pt-9 lg:px-10 lg:pb-14 lg:pt-11", contentClassName)}>
          {children}
        </main>
      </div>
      <BottomNavigation />
    </div>
  );
}
