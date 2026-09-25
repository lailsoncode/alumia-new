import { useEffect, useState } from "react";
import {
  ArrowReloadHorizontalIcon,
  Calendar01Icon,
  Cancel01Icon,
  CupSodaIcon,
  DrinkIcon,
  GlassWaterIcon,
  Settings01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { AppShell } from "@/components/layout";
import { Greeting } from "@/components/shared/Greeting";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { InlineFeedback, SectionHeader, Surface } from "@/components/ui/surface";
import { getLocalDateString } from "@/lib/utils";
import {
  getPastWeekHydration,
  getTodayHydration,
  logWaterIntake,
  undoLastWaterLog,
} from "@/services/hydrationService";
import hydrationImage from "@/assets/hidratacao.webp";

const DEFAULT_GOAL = 2000;

interface HydrationHistoryItem {
  dayName: string;
  total: number;
}

function buildHydrationHistory(pastWeek: { date: string; total: number }[]) {
  const totals: HydrationHistoryItem[] = [];
  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const match = pastWeek.find((item) => item.date === dateString);

    totals.push({
      dayName: offset === 0 ? "Hoje" : offset === 1 ? "Ontem" : dayNames[date.getDay()],
      total: match?.total ?? 0,
    });
  }

  return totals;
}

export function HydrationPage() {
  const [intake, setIntake] = useState(0);
  const [goal, setGoal] = useState(DEFAULT_GOAL);
  const [history, setHistory] = useState<HydrationHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalInput, setGoalInput] = useState(String(DEFAULT_GOAL));

  useEffect(() => {
    const savedGoal = window.localStorage.getItem("alumia_hydration_goal");
    if (savedGoal && Number(savedGoal) > 0) {
      setGoal(Number(savedGoal));
      setGoalInput(savedGoal);
    }
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const [todayTotal, pastWeek] = await Promise.all([
        getTodayHydration(getLocalDateString()),
        getPastWeekHydration(),
      ]);
      setIntake(todayTotal);
      setHistory(buildHydrationHistory(pastWeek));
    } catch {
      setError("Não conseguimos preparar seu ritmo de hidratação agora.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addWater = async (amount: number) => {
    if (!Number.isFinite(amount) || amount <= 0 || amount > 5000) return;

    setIntake((value) => value + amount);
    try {
      await logWaterIntake(amount, getLocalDateString());
      await load();
    } catch {
      setError("Esse gesto ainda não foi salvo. Vamos tentar mais uma vez?");
      await load();
    }
  };

  const undo = async () => {
    try {
      await undoLastWaterLog(getLocalDateString());
      await load();
    } catch {
      setError("Não conseguimos desfazer o último registro agora.");
    }
  };

  const saveGoal = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(goalInput);
    if (!Number.isFinite(amount) || amount < 250 || amount > 10000) return;

    setGoal(amount);
    window.localStorage.setItem("alumia_hydration_goal", String(amount));
    setGoalOpen(false);
  };

  const saveCustomAmount = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(customAmount);
    if (!Number.isFinite(amount) || amount <= 0 || amount > 5000) return;

    addWater(amount);
    setCustomAmount("");
    setCustomOpen(false);
  };

  const progress = Math.min(100, (intake / goal) * 100);
  const maxHistory = Math.max(goal, ...history.map((item) => item.total), 1);

  return (
    <AppShell>
      <div className="space-y-4">
        <Greeting role="Cada gole é um gesto de carinho com você." />

        {error && (
          <InlineFeedback tone="danger">
            {error}{" "}
            <button type="button" onClick={load} className="font-semibold underline">
              Tentar novamente
            </button>
          </InlineFeedback>
        )}

        <Surface className="grid grid-cols-[5.75rem_minmax(0,1fr)] gap-3 border-tone-sky-fg/25 bg-tone-sky p-3.5 shadow-none min-[380px]:grid-cols-[7rem_minmax(0,1fr)] sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-4 sm:p-4">
          <img
            src={hydrationImage}
            alt="Personagem da Alumia bebendo água"
            className="h-24 w-full self-stretch rounded-2xl object-cover min-[380px]:h-28 sm:h-32"
          />
          <div className="min-w-0 self-center">
            <div className="flex items-start gap-2">
              <AlumiaIcon icon={GlassWaterIcon} size="sm" className="mt-0.5 shrink-0 text-tone-sky-fg" />
              <h2 className="text-base font-semibold leading-snug sm:text-lg">Descubra seu ritmo de hidratação</h2>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/80">
              Beber água pode ser um gesto de carinho, sem pressão ou cobrança.
            </p>
            <p className="mt-1.5 hidden text-sm leading-relaxed text-foreground/80 min-[430px]:block">
              A Alumia acompanha o ritmo que fizer sentido para o seu corpo e para o seu dia.
            </p>
          </div>
        </Surface>

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)]">
          <Surface className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <AlumiaIcon icon={Settings01Icon} size="md" className="mt-0.5 shrink-0 text-tone-sky-fg" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-muted-foreground">Sua referência diária</p>
                <h2 className="mt-0.5 text-2xl font-bold">
                  {goal} ml <span className="text-sm font-medium text-muted-foreground">por dia</span>
                </h2>
              </div>
              <Button variant="outline" size="sm" className="shrink-0 px-3" onClick={() => setGoalOpen(true)}>
                Ajustar
              </Button>
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-2xl bg-tone-sky px-3.5 py-3 text-sm leading-relaxed text-tone-sky-fg">
              <AlumiaIcon icon={SparklesIcon} size="xs" className="mt-0.5 shrink-0" />
              <p>O número é uma referência configurável. O cuidado vem primeiro.</p>
            </div>
          </Surface>

          <Surface className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <AlumiaIcon icon={GlassWaterIcon} size="md" className="mt-0.5 shrink-0 text-tone-sky-fg" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-muted-foreground">Seu ritmo hoje</p>
                <h2 className="mt-0.5 text-xl font-semibold sm:text-2xl">
                  Seu corpo já recebeu <strong className="font-bold">{loading ? "…" : `${intake} ml`}</strong> de carinho.
                </h2>
              </div>
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width]"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-label="Progresso de hidratação"
                aria-valuemin={0}
                aria-valuemax={goal}
                aria-valuenow={intake}
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {Math.round(progress)}% da referência que você escolheu.
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Button aria-label="Registrar copo de 200 ml" variant="outline" size="sm" className="min-w-0 px-2" onClick={() => addWater(200)} disabled={loading}>
                <AlumiaIcon icon={CupSodaIcon} size="xs" />
                <span>200 ml</span>
              </Button>
              <Button aria-label="Registrar garrafa de 500 ml" variant="outline" size="sm" className="min-w-0 px-2" onClick={() => addWater(500)} disabled={loading}>
                <AlumiaIcon icon={GlassWaterIcon} size="xs" />
                <span>500 ml</span>
              </Button>
              <Button aria-label="Registrar outra quantidade" variant="outline" size="sm" className="min-w-0 px-2" onClick={() => setCustomOpen((value) => !value)} disabled={loading}>
                <AlumiaIcon icon={DrinkIcon} size="xs" />
                <span>Outro</span>
              </Button>
            </div>

            {customOpen && (
              <form className="mt-3 flex flex-col gap-3 rounded-2xl bg-surface-subtle p-3.5 sm:flex-row sm:items-end" onSubmit={saveCustomAmount}>
                <label htmlFor="custom-water" className="flex-1 text-sm font-semibold">
                  Quantidade em ml
                  <input
                    id="custom-water"
                    type="number"
                    min="1"
                    max="5000"
                    value={customAmount}
                    onChange={(event) => setCustomAmount(event.target.value)}
                    className="mt-2 min-h-11 w-full rounded-xl border border-input bg-background px-4 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                  />
                </label>
                <Button type="submit" disabled={!customAmount}>Registrar</Button>
              </form>
            )}

            <div className="mt-3 flex min-h-10 items-center justify-between gap-3">
              <p className="text-sm font-semibold text-muted-foreground">Um gesto simples, um grande cuidado.</p>
              {intake > 0 && (
                <Button variant="ghost" size="sm" className="shrink-0 px-2.5" onClick={undo}>
                  <AlumiaIcon icon={ArrowReloadHorizontalIcon} size="xs" />
                  Desfazer
                </Button>
              )}
            </div>
          </Surface>

          <Surface className="p-4 sm:p-5 lg:col-span-2">
            <SectionHeader
              icon={Calendar01Icon}
              iconClassName="text-tone-sky-fg"
              title="Seu consumo nos últimos 7 dias"
              description="Um panorama simples do seu ritmo, sem cobrança."
            />
            <div className="mt-4 space-y-2.5">
              {loading
                ? [0, 1, 2, 3].map((item) => <div key={item} className="h-5 animate-pulse rounded-full bg-muted" />)
                : history.map((item) => (
                    <div key={item.dayName} className="grid grid-cols-[3rem_4rem_minmax(0,1fr)] items-center gap-2 text-sm sm:grid-cols-[3.75rem_4.5rem_minmax(0,1fr)] sm:gap-3">
                      <span className="font-semibold">{item.dayName}</span>
                      <span className="text-right text-xs text-muted-foreground">{item.total} ml</span>
                      <div className="h-3 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/70"
                          style={{ width: `${Math.min(100, (item.total / maxHistory) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
            </div>
          </Surface>
        </div>
      </div>

      {goalOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-foreground/25 backdrop-blur-sm"
            onClick={() => setGoalOpen(false)}
            aria-label="Fechar ajuste da referência"
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="goal-title"
            className="alumia-elevated fixed left-1/2 top-1/2 z-50 w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="goal-title" className="text-xl font-bold">Sua referência diária</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Escolha um valor pessoal entre 250 e 10.000 ml.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setGoalOpen(false)} aria-label="Fechar">
                <AlumiaIcon icon={Cancel01Icon} size="sm" />
              </Button>
            </div>
            <form onSubmit={saveGoal} className="mt-4">
              <label htmlFor="goal-value" className="text-sm font-semibold">
                Quantidade em ml
                <input
                  id="goal-value"
                  type="number"
                  min="250"
                  max="10000"
                  step="50"
                  value={goalInput}
                  onChange={(event) => setGoalInput(event.target.value)}
                  className="mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-4 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
              </label>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Use uma orientação profissional quando ela existir para você.
              </p>
              <div className="mt-4 flex justify-end gap-2.5">
                <Button type="button" variant="ghost" onClick={() => setGoalOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar referência</Button>
              </div>
            </form>
          </section>
        </>
      )}
    </AppShell>
  );
}
