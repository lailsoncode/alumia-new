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
    <Surface className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-tone-sky text-tone-sky-fg"><AlumiaIcon icon={GlassWaterIcon} size="md" /></span>
          <div>
            <h2 className="text-lg font-semibold">Hidratação</h2>
            <p className="text-sm text-muted-foreground">{loading ? "Carregando…" : `${intake} ml de ${GOAL} ml`}</p>
          </div>
        </div>
        {intake > 0 && <Button variant="ghost" size="icon" aria-label="Desfazer último registro" onClick={undo}><AlumiaIcon icon={ArrowReloadHorizontalIcon} size="sm" /></Button>}
      </div>
      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${progress}%` }} role="progressbar" aria-label="Progresso de hidratação" aria-valuemin={0} aria-valuemax={GOAL} aria-valuenow={intake} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="outline" size="sm" onClick={() => add(200)} disabled={loading}><AlumiaIcon icon={CupSodaIcon} size="xs" />200 ml</Button>
        <Button variant="outline" size="sm" onClick={() => add(500)} disabled={loading}><AlumiaIcon icon={GlassWaterIcon} size="xs" />500 ml</Button>
      </div>
      <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => navigate({ to: "/hidratacao" })}>Ver detalhes</Button>
    </Surface>
  );
}
