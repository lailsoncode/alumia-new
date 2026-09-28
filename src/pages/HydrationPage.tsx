import { useEffect, useState } from "react";
import {
  ArrowReloadHorizontalIcon,
  BellIcon,
  CalculatorIcon,
  Calendar01Icon,
  Cancel01Icon,
  CupSodaIcon,
  DrinkIcon,
  GlassWaterIcon,
  Settings01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { InlineFeedback, SectionHeader, Surface } from "@/components/ui/surface";
import { getLocalDateString } from "@/lib/utils";
import { calculateHydrationEstimate, type HydrationClimate, type HydrationProfile } from "@/lib/hydration";
import {
  getPastWeekHydration,
  getTodayHydration,
  logWaterIntake,
  undoLastWaterLog,
} from "@/services/hydrationService";
import hydrationImage from "@/assets/hidratacao.webp";
import {
  DEFAULT_HYDRATION_REMINDERS,
  getHydrationReminderTimes,
  getStoredHydrationReminders,
  isHydrationReminderSupported,
  saveHydrationReminders,
  type HydrationReminderPreferences,
} from "@/services/hydrationReminderService";

const DEFAULT_GOAL = 2000;
const PROFILE_STORAGE_KEY = "alumia_hydration_profile";
const DEFAULT_PROFILE: HydrationProfile = { age: 30, heightCm: 170, weightKg: 70, climate: "mild", activityMinutes: 0 };

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
  const [profile, setProfile] = useState<HydrationProfile>(DEFAULT_PROFILE);
  const [estimateDetail, setEstimateDetail] = useState<ReturnType<typeof calculateHydrationEstimate> | null>(null);
  const [reminders, setReminders] = useState<HydrationReminderPreferences>(DEFAULT_HYDRATION_REMINDERS);
  const [reminderSaving, setReminderSaving] = useState(false);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedGoal = window.localStorage.getItem("alumia_hydration_goal");
    if (savedGoal && Number(savedGoal) > 0) {
      setGoal(Number(savedGoal));
      setGoalInput(savedGoal);
    }
    try {
      const storedProfile = JSON.parse(window.localStorage.getItem(PROFILE_STORAGE_KEY) ?? "null") as HydrationProfile | null;
      if (storedProfile) setProfile(storedProfile);
    } catch {
      // Keep safe defaults when an older local value cannot be read.
    }
    setReminders(getStoredHydrationReminders());
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

  const calculateGoal = (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const estimate = calculateHydrationEstimate(profile);
      setEstimateDetail(estimate);
      setGoal(estimate.totalMl);
      setGoalInput(String(estimate.totalMl));
      window.localStorage.setItem("alumia_hydration_goal", String(estimate.totalMl));
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      setEstimateDetail(null);
    }
  };

  const updateProfileNumber = (key: "age" | "heightCm" | "weightKg" | "activityMinutes", value: string) => {
    setProfile((current) => ({ ...current, [key]: Number(value) }));
  };

  const saveReminders = async (next: HydrationReminderPreferences) => {
    setReminderSaving(true);
    setReminderMessage(null);
    try {
      const saved = await saveHydrationReminders(next);
      if (!saved) {
        setReminderMessage(isHydrationReminderSupported() ? "Permissão de notificação não concedida." : "Os lembretes automáticos estão disponíveis no app para Android e iOS.");
        return;
      }
      setReminders(next);
      setReminderMessage(next.enabled ? "Lembretes programados neste dispositivo." : "Lembretes desativados neste dispositivo.");
    } catch {
      setReminderMessage("Não conseguimos atualizar os lembretes agora.");
    } finally {
      setReminderSaving(false);
    }
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
    <>
      <div className="space-y-3">
        {error && (
          <InlineFeedback tone="danger">
            {error}{" "}
            <button type="button" onClick={load} className="font-semibold underline">
              Tentar novamente
            </button>
          </InlineFeedback>
        )}

        <Surface className="module-surface grid grid-cols-[4.25rem_minmax(0,1fr)] items-center gap-2.5 p-2 shadow-none min-[380px]:grid-cols-[4.75rem_minmax(0,1fr)] sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:p-2.5">
          <img
            src={hydrationImage}
            alt="Personagem da Alumia bebendo água"
            className="h-20 w-full rounded-lg object-cover sm:h-24"
          />
          <div className="min-w-0">
            <div className="flex items-start gap-1.5">
              <AlumiaIcon icon={GlassWaterIcon} size="sm" className="module-text mt-0.5 shrink-0" />
              <h2 className="text-sm font-semibold leading-snug sm:text-base">Descubra seu ritmo de hidratação</h2>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-foreground/80 sm:text-sm">
              Cada gole pode ser um gesto de cuidado, no ritmo que fizer sentido para você.
            </p>
          </div>
        </Surface>

        <div className="grid items-start gap-3 lg:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)]">
          <Surface className="p-3 sm:p-4">
            <div className="flex items-start gap-3">
              <AlumiaIcon icon={Settings01Icon} size="md" className="module-text mt-0.5 shrink-0" />
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
            <div className="module-surface mt-2.5 flex items-start gap-2 rounded-xl border px-3 py-2 text-sm leading-snug text-[var(--module-strong)]">
              <AlumiaIcon icon={SparklesIcon} size="xs" className="mt-0.5 shrink-0" />
              <p>O número é uma referência configurável. O cuidado vem primeiro.</p>
            </div>
          </Surface>

          <Surface className="p-3 sm:p-4">
            <div className="flex items-start gap-3">
              <AlumiaIcon icon={GlassWaterIcon} size="md" className="module-text mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-muted-foreground">Seu ritmo hoje</p>
                <h2 className="mt-0.5 text-xl font-semibold sm:text-2xl">
                  Seu corpo já recebeu <strong className="font-bold">{loading ? "…" : `${intake} ml`}</strong> de carinho.
                </h2>
              </div>
            </div>

            <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-muted">
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

            <div className="mt-2.5 grid grid-cols-3 gap-2">
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
              <form className="mt-2.5 flex flex-col gap-2.5 rounded-xl bg-surface-subtle p-3 sm:flex-row sm:items-end" onSubmit={saveCustomAmount}>
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

            <div className="mt-2 flex min-h-10 items-center justify-between gap-3">
              <p className="text-sm font-semibold text-muted-foreground">Um gesto simples, um grande cuidado.</p>
              {intake > 0 && (
                <Button variant="ghost" size="sm" className="shrink-0 px-2.5" onClick={undo}>
                  <AlumiaIcon icon={ArrowReloadHorizontalIcon} size="xs" />
                  Desfazer
                </Button>
              )}
            </div>
          </Surface>

          <Surface className="p-3 sm:p-4 lg:col-span-2">
            <SectionHeader
              icon={BellIcon}
              iconClassName="module-text"
              title="Lembretes para beber água"
              description="Escolha uma janela do dia. Os avisos ficam agendados somente neste dispositivo."
            />
            <div className="mt-3 grid gap-3 sm:grid-cols-[auto_1fr_1fr_1fr_auto] sm:items-end">
              <label className="flex min-h-11 items-center gap-2 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={reminders.enabled}
                  onChange={(event) => setReminders((current) => ({ ...current, enabled: event.target.checked }))}
                  className="h-5 w-5 accent-primary"
                />
                Ativar
              </label>
              <label className="text-xs font-semibold text-muted-foreground">
                Começar às
                <select
                  value={reminders.startHour}
                  onChange={(event) => setReminders((current) => ({ ...current, startHour: Number(event.target.value) }))}
                  className="mt-1 min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground"
                >
                  {[6, 7, 8, 9, 10, 11, 12].map((hour) => <option key={hour} value={hour}>{String(hour).padStart(2, "0")}:00</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-muted-foreground">
                Encerrar às
                <select
                  value={reminders.endHour}
                  onChange={(event) => setReminders((current) => ({ ...current, endHour: Number(event.target.value) }))}
                  className="mt-1 min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground"
                >
                  {[17, 18, 19, 20, 21, 22, 23].map((hour) => <option key={hour} value={hour}>{String(hour).padStart(2, "0")}:00</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-muted-foreground">
                A cada
                <select
                  value={reminders.intervalHours}
                  onChange={(event) => setReminders((current) => ({ ...current, intervalHours: Number(event.target.value) }))}
                  className="mt-1 min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground"
                >
                  <option value={2}>2 horas</option>
                  <option value={3}>3 horas</option>
                  <option value={4}>4 horas</option>
                </select>
              </label>
              <Button onClick={() => saveReminders(reminders)} disabled={reminderSaving || reminders.startHour > reminders.endHour}>
                {reminderSaving ? "Salvando…" : "Salvar lembretes"}
              </Button>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {reminderMessage ?? (reminders.enabled
                ? `Avisos às ${getHydrationReminderTimes(reminders).map((hour) => `${String(hour).padStart(2, "0")}:00`).join(", ")}.`
                : "Ative quando quiser receber lembretes gentis ao longo do dia.")}
            </p>
          </Surface>

          <Surface className="p-3 sm:p-4 lg:col-span-2">
            <SectionHeader
              icon={Calendar01Icon}
              iconClassName="module-text"
              title="Seu consumo nos últimos 7 dias"
              description="Um panorama simples do seu ritmo, sem cobrança."
            />
            <div className="mt-2.5 space-y-2">
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
            className="alumia-elevated fixed left-1/2 top-1/2 z-50 max-h-[calc(100vh_-_2rem)] w-[calc(100%_-_2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 id="goal-title" className="text-xl font-bold">Sua referência diária</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Faça uma estimativa pelo seu contexto ou informe uma orientação que já recebeu.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setGoalOpen(false)} aria-label="Fechar">
                <AlumiaIcon icon={Cancel01Icon} size="sm" />
              </Button>
            </div>
            <form onSubmit={calculateGoal} className="mt-4 rounded-2xl border border-border p-4">
              <div className="flex items-start gap-2">
                <AlumiaIcon icon={CalculatorIcon} size="sm" className="module-text mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold">Calcular uma estimativa</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">Para pessoas a partir de 14 anos. O resultado é arredondado em passos de 50 ml.</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                <label className="text-xs font-semibold">Idade
                  <input type="number" required min="14" max="100" value={profile.age} onChange={(event) => updateProfileNumber("age", event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
                </label>
                <label className="text-xs font-semibold">Altura (cm)
                  <input type="number" required min="120" max="230" value={profile.heightCm} onChange={(event) => updateProfileNumber("heightCm", event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
                </label>
                <label className="text-xs font-semibold">Peso (kg)
                  <input type="number" required min="35" max="300" step="0.1" value={profile.weightKg} onChange={(event) => updateProfileNumber("weightKg", event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
                </label>
                <label className="text-xs font-semibold">Clima habitual
                  <select value={profile.climate} onChange={(event) => setProfile((current) => ({ ...current, climate: event.target.value as HydrationClimate }))} className="mt-1 min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm">
                    <option value="cold">Frio</option>
                    <option value="mild">Ameno</option>
                    <option value="hot">Quente</option>
                  </select>
                </label>
                <label className="col-span-2 text-xs font-semibold sm:col-span-2">Atividade física por dia (minutos)
                  <input type="number" required min="0" max="240" step="10" value={profile.activityMinutes} onChange={(event) => updateProfileNumber("activityMinutes", event.target.value)} className="mt-1 min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
                </label>
              </div>
              <Button type="submit" className="mt-3 w-full">Calcular referência</Button>
              {estimateDetail && (
                <div className="module-surface mt-3 rounded-xl border p-3 text-sm">
                  <p className="font-semibold">Estimativa: {estimateDetail.totalMl} ml por dia</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Base corporal {estimateDetail.baseMl} ml + clima {estimateDetail.climateMl} ml + atividade {estimateDetail.activityMl} ml.
                    {estimateDetail.weightWasAdjusted ? ` A altura limitou o peso usado na conta a ${estimateDetail.calculationWeightKg} kg para evitar extrapolação.` : ""}
                  </p>
                  <Button type="button" size="sm" className="mt-2" onClick={() => setGoalOpen(false)}>Usar esta referência</Button>
                </div>
              )}
            </form>

            <form onSubmit={saveGoal} className="mt-3 rounded-2xl bg-surface-subtle p-4">
              <label htmlFor="goal-value" className="text-sm font-semibold">Definir manualmente (ml)
                <input id="goal-value" type="number" min="250" max="10000" step="50" value={goalInput} onChange={(event) => setGoalInput(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-input bg-background px-4 text-base" />
              </label>
              <Button type="submit" variant="outline" size="sm" className="mt-2">Salvar valor manual</Button>
            </form>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Esta é uma referência de bem-estar, não uma prescrição. Líquidos e alimentos também contribuem para a hidratação. Se você está grávida, amamenta, tem doença renal ou cardíaca, usa diuréticos ou recebeu limite de líquidos, siga a orientação profissional em vez desta estimativa.
            </p>
          </section>
        </>
      )}
    </>
  );
}
