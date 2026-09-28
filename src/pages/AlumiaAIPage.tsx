import { useState } from "react";
import { AlumiaChat } from "@/components/shared/alumia-ai";
import { Surface } from "@/components/ui/surface";
import { consumeAlumiaPendingMessage } from "@/lib/alumia-presence";

export function AlumiaAIPage() {
  const previewEnabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_ALUMIA_AI_PREVIEW === "true";
  const [initialMessage] = useState(() => previewEnabled ? consumeAlumiaPendingMessage() : null);

  if (!previewEnabled) {
    return (
      <Surface className="mx-auto max-w-2xl p-5 text-center sm:p-7">
        <h1 className="font-display text-2xl font-semibold">Alum.IA está sendo preparada com cuidado</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          A conversa ainda não foi liberada neste ambiente. Estamos definindo privacidade, segurança e limites antes de abrir a experiência.
        </p>
      </Surface>
    );
  }

  return <AlumiaChat initialMessage={initialMessage} />;
}
