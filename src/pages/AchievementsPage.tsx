import { AchievementCollection } from "@/components/shared/achievements";
import { Surface } from "@/components/ui/surface";

export function AchievementsPage() {
  return (
    <div className="space-y-4">
      <Surface variant="subtle" className="p-4 shadow-none sm:p-5">
        <p className="font-display text-lg font-semibold">Sua coleção cresce quando o cuidado acontece.</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Não há pontos, ranking, sequência obrigatória ou conquista perdida. Cada insígnia é só uma lembrança gentil de algo que você viveu.
        </p>
      </Surface>
      <AchievementCollection />
    </div>
  );
}
