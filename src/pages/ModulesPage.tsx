import { BottomNav } from "@/components/layout";
import { Greeting } from "@/components/shared/Greeting";
import { ModulesList } from "@/components/shared/modules";

export function ModulesPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8">
        <div className="space-y-4 sm:space-y-5">
          <Greeting />
          <p className="text-sm text-muted-foreground sm:text-base">
            Organize o seu dia, do seu jeito ✨
          </p>
          <ModulesList />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
