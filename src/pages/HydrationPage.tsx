import { useEffect, useState } from "react";
import { ArrowReloadHorizontalIcon, Calendar01Icon, Cancel01Icon, CupSodaIcon, DrinkIcon, GlassWaterIcon, Settings01Icon } from "@hugeicons/core-free-icons";
import { AppShell } from "@/components/layout";
import { Greeting } from "@/components/shared/Greeting";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { InlineFeedback, SectionHeader, Surface } from "@/components/ui/surface";
import { getLocalDateString } from "@/lib/utils";
import { getPastWeekHydration, getTodayHydration, logWaterIntake, undoLastWaterLog } from "@/services/hydrationService";
import hydrationImage from "@/assets/hidratacao.webp";

const DEFAULT_GOAL = 2000;

export function HydrationPage() {
  const [intake, setIntake] = useState(0);
  const [goal, setGoal] = useState(DEFAULT_GOAL);
  const [history, setHistory] = useState<{ dayName: string; total: number }[]>([]);
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
      const [todayTotal, pastWeek] = await Promise.all([getTodayHydration(getLocalDateString()), getPastWeekHydration()]);
      setIntake(todayTotal);
      const totals = [];
      for (let offset = 6; offset >= 0; offset -= 1) {
        const date = new Date();
        date.setDate(date.getDate() - offset);
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        const match = pastWeek.find((item) => item.date === dateString);
        const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        totals.push({ dayName: offset === 0 ? "Hoje" : offset === 1 ? "Ontem" : dayNames[date.getDay()], total: match?.total ?? 0 });
      }
      setHistory(totals);
    } catch {
      setError("Não conseguimos preparar seu ritmo de hidratação agora.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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
    try { await undoLastWaterLog(getLocalDateString()); await load(); }
    catch { setError("Não conseguimos desfazer o último registro agora."); }
  };

  const saveGoal = (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(goalInput);
    if (!Number.isFinite(amount) || amount < 250 || amount > 10000) return;
    setGoal(amount);
    window.localStorage.setItem("alumia_hydration_goal", String(amount));
    setGoalOpen(false);
  };

  const progress = Math.min(100, (intake / goal) * 100);
  const maxHistory = Math.max(goal, ...history.map((item) => item.total), 1);

  return (
    <AppShell>
      <div className="space-y-6">
        <Greeting role="Cada pausa pode ser um gesto de carinho com você." />
        {error && <InlineFeedback tone="danger">{error} <button type="button" onClick={load} className="font-semibold underline">Tentar novamente</button></InlineFeedback>}

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(19rem,0.75fr)]">
          <div className="space-y-5">
            <Surface className="p-4 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlumiaIcon icon={GlassWaterIcon} size="lg" className="mt-0.5 shrink-0 text-tone-sky-fg" />
                  <div><p className="text-sm font-semibold text-muted-foreground">Seu ritmo hoje</p><h2 className="text-2xl font-bold">{loading ? "…" : `${intake} ml de cuidado`}</h2></div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setGoalOpen(true)}><AlumiaIcon icon={Settings01Icon} size="xs" />Referência: {goal} ml</Button>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} role="progressbar" aria-label="Progresso de hidratação" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={intake} /></div>
              <p className="mt-2 text-sm text-muted-foreground">Seu corpo recebeu {Math.round(progress)}% da referência que você configurou.</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <Button variant="outline" onClick={() => addWater(200)} disabled={loading}><AlumiaIcon icon={CupSodaIcon} size="sm" />Copo 200 ml</Button>
                <Button variant="outline" onClick={() => addWater(500)} disabled={loading}><AlumiaIcon icon={GlassWaterIcon} size="sm" />Garrafa 500 ml</Button>
                <Button variant="outline" onClick={() => setCustomOpen((value) => !value)} disabled={loading}><AlumiaIcon icon={DrinkIcon} size="sm" />Outro valor</Button>
              </div>

              {customOpen && <form className="mt-4 flex flex-col gap-3 rounded-2xl bg-surface-subtle p-4 sm:flex-row sm:items-end" onSubmit={(event) => { event.preventDefault(); const value = Number(customAmount); if (value > 0 && value <= 5000) { addWater(value); setCustomAmount(""); setCustomOpen(false); } }}><label htmlFor="custom-water" className="flex-1 text-sm font-semibold">Quantidade em ml<input id="custom-water" type="number" min="1" max="5000" value={customAmount} onChange={(event) => setCustomAmount(event.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-input bg-background px-4 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30" /></label><Button type="submit" disabled={!customAmount}>Registrar</Button></form>}

              {intake > 0 && <Button variant="ghost" size="sm" className="mt-4" onClick={undo}><AlumiaIcon icon={ArrowReloadHorizontalIcon} size="xs" />Desfazer último registro</Button>}
            </Surface>

            <Surface className="p-4 sm:p-6">
              <SectionHeader icon={Calendar01Icon} iconClassName="text-tone-mint-fg" title="Últimos 7 dias" description="Um panorama simples do seu ritmo, sem cobrança." />
              <div className="mt-5 space-y-3">
                {loading ? [0, 1, 2, 3].map((item) => <div key={item} className="h-5 animate-pulse rounded-full bg-muted" />) : history.map((item) => (
                  <div key={item.dayName} className="grid grid-cols-[3.75rem_4rem_1fr] items-center gap-3 text-sm"><span className="font-semibold">{item.dayName}</span><span className="text-right text-xs text-muted-foreground">{item.total} ml</span><div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary/75" style={{ width: `${Math.min(100, item.total / maxHistory * 100)}%` }} /></div></div>
                ))}
              </div>
            </Surface>
          </div>

          <Surface variant="subtle" className="overflow-hidden">
            <img src={hydrationImage} alt="Personagem da Alumia segurando uma garrafa de água" className="aspect-[4/3] w-full object-cover" />
            <div className="p-5"><h2 className="text-lg font-semibold">No seu ritmo.</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">A referência diária é configurável e serve para acompanhar seus próprios hábitos. Ajuste o valor ao que foi orientado para você.</p></div>
          </Surface>
        </div>
      </div>

      {goalOpen && <><button type="button" className="fixed inset-0 z-40 cursor-default bg-foreground/25 backdrop-blur-sm" onClick={() => setGoalOpen(false)} aria-label="Fechar ajuste da referência" /><section role="dialog" aria-modal="true" aria-labelledby="goal-title" className="alumia-elevated fixed left-1/2 top-1/2 z-50 w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl p-6"><div className="flex items-start justify-between gap-4"><div><h2 id="goal-title" className="text-xl font-bold">Referência diária</h2><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Defina um valor pessoal entre 250 e 10.000 ml.</p></div><Button variant="ghost" size="icon" onClick={() => setGoalOpen(false)} aria-label="Fechar"><AlumiaIcon icon={Cancel01Icon} size="sm" /></Button></div><form onSubmit={saveGoal} className="mt-6"><label htmlFor="goal-value" className="text-sm font-semibold">Quantidade em ml<input id="goal-value" type="number" min="250" max="10000" step="50" value={goalInput} onChange={(event) => setGoalInput(event.target.value)} className="mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-4 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30" /></label><div className="mt-6 flex justify-end gap-3"><Button type="button" variant="ghost" onClick={() => setGoalOpen(false)}>Cancelar</Button><Button type="submit">Salvar referência</Button></div></form></section></>}
    </AppShell>
  );
}
