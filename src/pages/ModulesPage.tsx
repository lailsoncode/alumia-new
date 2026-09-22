import { AppShell } from "@/components/layout";
import { Greeting } from "@/components/shared/Greeting";
import { ModulesList } from "@/components/shared/modules";

export function ModulesPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <Greeting role="Escolha só o que fizer sentido para você agora." />
        <ModulesList />
      </div>
    </AppShell>
  );
}
