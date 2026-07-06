import { HugeiconsIcon } from "@hugeicons/react";
import { GlassWaterIcon, CupSodaIcon, DrinkIcon } from "@hugeicons/core-free-icons";
import { RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { getTodayHydration, logWaterIntake, undoLastWaterLog } from "@/services/hydrationService";
import { getLocalDateString } from "@/lib/utils";

const GOAL = 2000;

const cups = [
  { label: "Copo 200ml", icon: CupSodaIcon, ml: 200 },
  { label: "Jarra 500ml", icon: GlassWaterIcon, ml: 500 },
  { label: "Out...", icon: DrinkIcon, ml: 100 },
];

/**
 * HydrationCard — acompanhamento de hidratação do dia.
 * Exibe o total ingerido, barra de progresso e botões de adição por tipo de copo.
 */
export function HydrationCard() {
  const [intake, setIntake] = useState(0);
  const [loading, setLoading] = useState(true);
  const pct = Math.min(100, (intake / GOAL) * 100);

  const loadTodayHydration = async () => {
    try {
      const today = getLocalDateString();
      const total = await getTodayHydration(today);
      setIntake(total);
    } catch (err) {
      console.error("Erro ao carregar hidratação:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodayHydration();
  }, []);

  const handleAddWater = async (ml: number) => {
    const today = getLocalDateString();
    try {
      // Atualização otimista
      setIntake((v) => Math.min(GOAL, v + ml));
      await logWaterIntake(ml, today);
      // Sincroniza com o banco
      const total = await getTodayHydration(today);
      setIntake(total);
    } catch (err) {
      console.error("Erro ao registrar água:", err);
      // Reverte em caso de erro
      loadTodayHydration();
    }
  };

  const handleUndo = async () => {
    const today = getLocalDateString();
    try {
      await undoLastWaterLog(today);
      // Sincroniza com o banco
      const total = await getTodayHydration(today);
      setIntake(total);
    } catch (err) {
      console.error("Erro ao desfazer registro de água:", err);
      loadTodayHydration();
    }
  };

  return (
    <section className="alumia-card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-sm sm:text-base">
          <HugeiconsIcon
            icon={GlassWaterIcon}
            size={18}
            strokeWidth={1.5}
            className="shrink-0 text-tone-sky-fg"
          />
          <span>
            {loading ? (
              "Buscando hidratação do dia..."
            ) : (
              <>
                Seu corpo já recebeu <strong>{intake}ml</strong> de carinho!
              </>
            )}
          </span>
        </p>

        {!loading && intake > 0 && (
          <button
            onClick={handleUndo}
            title="Desfazer última entrada"
            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Desfazer</span>
          </button>
        )}
      </div>

      {/* Barra de progresso cinza — preenche com primary ao adicionar */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary/70 transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={intake}
          aria-valuemin={0}
          aria-valuemax={GOAL}
          aria-label="Progresso de hidratação"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {cups.map((c) => (
          <button
            key={c.label}
            disabled={loading}
            onClick={() => handleAddWater(c.ml)}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50 cursor-pointer"
          >
            {c.label}
            <HugeiconsIcon icon={c.icon} size={14} strokeWidth={1.5} className="text-tone-sky-fg" />
          </button>
        ))}
      </div>
    </section>
  );
}

