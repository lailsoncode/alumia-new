import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowReloadHorizontalIcon, CupSodaIcon, GlassWaterIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { getLocalDateString } from "@/lib/utils";
import { getTodayHydration, logWaterIntake, undoLastWaterLog } from "@/services/hydrationService";

const GOAL = 2000;

export function HydrationCard() {
  const navigate = useNavigate();
  const [intake, setIntake] = useState(0);
  const [loading, setLoading] = useState(true);
  const progress = Math.min(100, (intake / GOAL) * 100);

  const load = async () => {
    try { setIntake(await getTodayHydration(getLocalDateString())); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const add = async (amount: number) => {
    setIntake((value) => Math.min(GOAL, value + amount));
    await logWaterIntake(amount, getLocalDateString());
    await load();
  };

  const undo = async () => {
    await undoLastWaterLog(getLocalDateString());
    await load();
  };

  return (
    <Surface className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlumiaIcon icon={GlassWaterIcon} size="md" className="mt-0.5 shrink-0 text-tone-sky-fg" />
          <div>
            <h2 className="text-lg font-semibold">Um gesto de hidratação</h2>
            <p className="text-sm text-muted-foreground">{loading ? "Preparando seu registro…" : intake === 0 ? "Seu primeiro copo pode chegar quando quiser." : `${intake} ml de cuidado registrados hoje.`}</p>
          </div>
        </div>
        {intake > 0 && <Button variant="ghost" size="icon" aria-label="Desfazer último registro" onClick={undo}><AlumiaIcon icon={ArrowReloadHorizontalIcon} size="sm" /></Button>}
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} role="progressbar" aria-label="Progresso de hidratação" aria-valuemin={0} aria-valuemax={GOAL} aria-valuenow={intake} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <Button variant="outline" size="sm" onClick={() => add(200)} disabled={loading}><AlumiaIcon icon={CupSodaIcon} size="xs" />Copo 200 ml</Button>
        <Button variant="outline" size="sm" onClick={() => add(500)} disabled={loading}><AlumiaIcon icon={GlassWaterIcon} size="xs" />Garrafa 500 ml</Button>
      </div>
      <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => navigate({ to: "/hidratacao" })}>Ver meu ritmo</Button>
    </Surface>
  );
}
