import { AppShell } from "@/components/layout";
import { Greeting } from "@/components/shared/Greeting";
import { ModulesList } from "@/components/shared/modules";

export function ModulesPage() {
  return (
    <AppShell>
      <div className="space-y-7">
        <Greeting role="Escolha os cuidados que fazem sentido para você." />
        <ModulesList />
      </div>
    </AppShell>
  );
}
