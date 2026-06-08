import { HugeiconsIcon } from "@hugeicons/react";
import { GlassWaterIcon, CupSodaIcon, DrinkIcon } from "@hugeicons/core-free-icons";
import { useState } from "react";

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
  const pct = Math.min(100, (intake / GOAL) * 100);

  return (
    <section className="alumia-card p-4 sm:p-5">
      <p className="flex items-center gap-2 text-sm sm:text-base">
        <HugeiconsIcon
          icon={GlassWaterIcon}
          size={18}
          strokeWidth={1.5}
          className="shrink-0 text-tone-sky-fg"
        />
        <span>
          Seu corpo já recebeu <strong>{intake}ml</strong> de carinho!
        </span>
      </p>

      {/* Barra de progresso cinza — preenche com primary ao adicionar */}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary/70 transition-all duration-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={intake}
          aria-valuemin={0}
          aria-valuemax={GOAL}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {cups.map((c) => (
          <button
            key={c.label}
            onClick={() => setIntake((v) => Math.min(GOAL, v + c.ml))}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {c.label}
            <HugeiconsIcon icon={c.icon} size={14} strokeWidth={1.5} className="text-tone-sky-fg" />
          </button>
        ))}
      </div>
    </section>
  );
}
