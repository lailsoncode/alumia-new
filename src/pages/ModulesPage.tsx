import { AppShell } from "@/components/layout";
import { Greeting } from "@/components/shared/Greeting";
import { ModulesList } from "@/components/shared/modules";

export function ModulesPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <Greeting role="Escolha o que faz sentido para você agora. Um passo de cada vez." />
        <ModulesList />
      </div>
    </AppShell>
  );
}
