import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GlassWaterIcon,
  CupSodaIcon,
  DrinkIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { RotateCcw, Sparkles } from "lucide-react";
import { BottomNav } from "@/components/layout";
import { Greeting } from "@/components/shared/Greeting";
import { getTodayHydration, logWaterIntake, undoLastWaterLog, getPastWeekHydration } from "@/services/hydrationService";
import { getLocalDateString } from "@/lib/utils";

import welcomeImg from "@/assets/welcome.webp";
import hidratacaoImg from "@/assets/hidratacao.webp";

export function HydrationPage() {
  const [intake, setIntake] = useState(0);
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState<number>(() => {
    const saved = localStorage.getItem("alumia_hydration_goal");
    return saved ? parseInt(saved, 10) : 2000;
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [history, setHistory] = useState<{ dayName: string; total: number }[]>([]);

  const pct = Math.min(100, (intake / goal) * 100);

  const loadData = async () => {
    try {
      setLoading(true);
      const todayStr = getLocalDateString();
      const todayTotal = await getTodayHydration(todayStr);
      setIntake(todayTotal);

      // Carrega os dados históricos dos últimos 7 dias
      const pastWeekData = await getPastWeekHydration();
      
      const daysList = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;
        
        const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        const dayName = i === 0 ? "Hoje" : i === 1 ? "Ontem" : dayNames[d.getDay()];
        
        const match = pastWeekData.find(item => item.date === dateStr);
        daysList.push({
          dayName,
          total: match ? match.total : 0
        });
      }
      setHistory(daysList);
    } catch (err) {
      console.error("Erro ao carregar dados de hidratação:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddWater = async (ml: number) => {
    const today = getLocalDateString();
    try {
      setIntake((v) => Math.min(goal, v + ml));
      await logWaterIntake(ml, today);
      loadData(); // Recarrega para sincronizar histórico e valor real
    } catch (err) {
      console.error("Erro ao registrar água:", err);
      loadData();
    }
  };

  const handleUndo = async () => {
    const today = getLocalDateString();
    try {
      await undoLastWaterLog(today);
      loadData();
    } catch (err) {
      console.error("Erro ao desfazer registro de água:", err);
      loadData();
    }
  };

  const handleRecalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight);
    if (!isNaN(w) && w > 0) {
      // Estima 35ml por kg e arredonda para múltiplos de 50ml
      const suggested = Math.round((w * 35) / 50) * 50;
      setGoal(suggested);
      localStorage.setItem("alumia_hydration_goal", suggested.toString());
      setIsModalOpen(false);
      setWeight("");
    }
  };

  // Valor de referência para 100% de largura no gráfico (maior valor ou a própria meta)
  const maxHistoryAmount = Math.max(goal, ...history.map((h) => h.total), 1);

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8">
        <div className="space-y-4 sm:space-y-5">
          {/* Cabeçalho */}
          <Greeting role="Cada gole é um gesto de carinho com você." />

          {/* Card 1: Conceito / Ritmo de Hidratação */}
          <section className="flex flex-col gap-4 rounded-2xl border border-border bg-tone-sky/20 p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-card self-center">
              <img src={welcomeImg} alt="Ilustração bebendo água" className="h-full w-full object-cover" />
            </div>
            <div className="space-y-1.5 text-left">
              <h2 className="text-base font-bold text-foreground sm:text-lg flex items-center gap-1.5">
                <span>💧 Descubra seu ritmo de hidratação</span>
              </h2>
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Na Alumía, beber água é um gesto de carinho — não uma obrigação. 
                Vamos te ajudar a encontrar o seu próprio ritmo, respeitando seu corpo, seu dia e sua escolha.
              </p>
            </div>
          </section>

          {/* Card 2: Sugestão de Consumo & Recalcular */}
          <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:p-5">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted self-center">
              <img src={hidratacaoImg} alt="Ilustração segurando garrafa de água" className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 space-y-3 text-left">
              <p className="text-sm font-medium leading-relaxed text-foreground sm:text-base">
                🌊 Seu corpo sugere algo como <strong className="text-tone-sky-fg font-extrabold">{goal}ml</strong> por dia! 
                <br />
                <span className="text-xs text-muted-foreground font-normal">
                  ✨ Mas lembre: mais importante que o número, é o cuidado.
                </span>
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-muted cursor-pointer"
              >
                <span>Recalcular</span>
                <HugeiconsIcon icon={Search01Icon} size={13} strokeWidth={2} />
              </button>
            </div>
          </section>

          {/* Card 3: Tracker Diário */}
          <section className="alumia-card p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold sm:text-base">
                <span>🌊 Seu corpo já recebeu {loading ? "..." : <strong>{intake}ml</strong>} de carinho!</span>
              </h2>

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

            {/* Barra de progresso */}
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary/70 transition-all duration-500"
                style={{ width: `${pct}%` }}
                role="progressbar"
                aria-valuenow={intake}
                aria-valuemin={0}
                aria-valuemax={goal}
                aria-label="Progresso de hidratação"
              />
            </div>

            {/* Copos de água */}
            <div className="flex gap-2 justify-center">
              <button
                disabled={loading}
                onClick={() => handleAddWater(200)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50 cursor-pointer"
              >
                <span>Copo 200ml</span>
                <HugeiconsIcon icon={CupSodaIcon} size={15} strokeWidth={1.5} className="text-tone-sky-fg" />
              </button>
              <button
                disabled={loading}
                onClick={() => handleAddWater(500)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50 cursor-pointer"
              >
                <span>Jarra 500ml</span>
                <HugeiconsIcon icon={GlassWaterIcon} size={15} strokeWidth={1.5} className="text-tone-sky-fg" />
              </button>
              <button
                disabled={loading}
                onClick={() => {
                  const val = prompt("Digite a quantidade de água em ml:");
                  if (val) {
                    const parsed = parseInt(val, 10);
                    if (!isNaN(parsed) && parsed > 0) {
                      handleAddWater(parsed);
                    }
                  }
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-50 cursor-pointer"
              >
                <span>Out...</span>
                <HugeiconsIcon icon={DrinkIcon} size={15} strokeWidth={1.5} className="text-tone-sky-fg" />
              </button>
            </div>

            <p className="text-center text-xs text-muted-foreground font-medium pt-1">
              Um gesto simples, um grande cuidado. ✨
            </p>
          </section>

          {/* Card 4: Histórico de Consumo (7 dias) */}
          <section className="alumia-card p-4 sm:p-5 space-y-4">
            <h2 className="text-sm font-bold text-foreground sm:text-base">
              🌊 Seu consumo nos últimos 7 dias
            </h2>

            <div className="space-y-3.5">
              {loading ? (
                <p className="text-xs text-muted-foreground">Buscando histórico...</p>
              ) : (
                history.map((h, idx) => {
                  const widthPct = Math.min(100, (h.total / maxHistoryAmount) * 100);
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="w-14 shrink-0 text-left text-xs font-semibold text-foreground">
                        {h.dayName}
                      </span>
                      <span className="w-16 shrink-0 text-right text-xs text-muted-foreground font-medium">
                        {h.total} ml
                      </span>
                      <div className="h-3.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/70 transition-all duration-500"
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Recalculate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-lg space-y-4">
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-5 w-5 text-tone-sun-fg shrink-0" />
                <span>Calcular sugestão ideal</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Insira o seu peso corporal para estimarmos a recomendação diária de água recomendada pela OMS (35ml por kg).
              </p>
            </div>

            <form onSubmit={handleRecalculate} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="weight" className="text-xs font-semibold text-foreground">
                  Seu peso (kg):
                </label>
                <input
                  id="weight"
                  type="number"
                  required
                  min="1"
                  max="300"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Ex: 73"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setWeight("");
                  }}
                  className="flex-1 rounded-lg border border-border bg-card py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
