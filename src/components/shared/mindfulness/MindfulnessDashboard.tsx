import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowRight01Icon,
  Clock01Icon,
  HeadphonesIcon,
  Moon02Icon,
  Target01Icon,
  TextIcon,
  WindPowerIcon,
  Yoga01Icon,
} from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { AlumiaModuleIntro } from "@/components/shared/AlumiaModuleIntro";
import { Button } from "@/components/ui/button";
import { InlineFeedback, SectionHeader, Surface } from "@/components/ui/surface";
import { findClosestPractice, mindfulnessCategoryLabels } from "@/lib/mindfulness";
import { ALUMIA_AVATAR_IMAGES } from "@/lib/alumia-avatar";
import { completeMindfulnessSession, getMindfulnessPractices, scheduleMindfulnessReminder } from "@/services/mindfulnessService";
import type { MindfulnessCategory, MindfulnessFormat, MindfulnessPractice, MindfulnessReflection as Reflection, MindfulnessReminderChoice } from "@/types";
import { MindfulnessPlayer } from "./MindfulnessPlayer";
import { MindfulnessReflection } from "./MindfulnessReflection";
import { PracticeLibrary } from "./PracticeLibrary";

interface PlayerState {
  practice: MindfulnessPractice;
  format: MindfulnessFormat;
}

interface ReflectionState extends PlayerState {
  elapsedSeconds: number;
  startedAt: string;
  endedEarly: boolean;
}

const categoryIcons = {
  breathing: WindPowerIcon,
  grounding: Yoga01Icon,
  focus: Target01Icon,
  calm: Yoga01Icon,
  sleep: Moon02Icon,
} as const;

export function MindfulnessDashboard() {
  const [practices, setPractices] = useState<MindfulnessPractice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [view, setView] = useState<"home" | "library">("home");
  const [libraryCategory, setLibraryCategory] = useState<MindfulnessCategory>();
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [reflectionState, setReflectionState] = useState<ReflectionState | null>(null);
  const [reflection, setReflection] = useState<Reflection>();
  const [reminder, setReminder] = useState<MindfulnessReminderChoice>();
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setPractices(await getMindfulnessPractices()); }
    catch { setError("Não conseguimos preparar as práticas agora."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const recommended = useMemo(() => practices.find((practice) => practice.code === "ground_present") ?? practices[0], [practices]);
  const fiveSenses = useMemo(() => practices.find((practice) => practice.code === "five_senses"), [practices]);
  const categories: MindfulnessCategory[] = ["breathing", "grounding", "focus", "sleep"];

  const startPractice = (practice: MindfulnessPractice, format: MindfulnessFormat) => {
    setFeedback(null);
    setPlayer({ practice, format });
  };

  const saveReflection = async () => {
    if (!reflectionState) return;
    setSaving(true);
    setError(null);
    try {
      await completeMindfulnessSession({
        practiceId: reflectionState.practice.id,
        format: reflectionState.format,
        startedAt: reflectionState.startedAt,
        elapsedSeconds: reflectionState.elapsedSeconds,
        reflection,
        endedEarly: reflectionState.endedEarly,
      });
      if (reminder) {
        await scheduleMindfulnessReminder(reflectionState.practice, reminder);
        setFeedback("Sua pausa foi registrada e o lembrete foi adicionado.");
      } else setFeedback("Sua pausa foi registrada sem cobrança.");
      const wantsAnother = reflection === "another";
      setReflectionState(null);
      setReflection(undefined);
      setReminder(undefined);
      setView(wantsAnother ? "library" : "home");
    } catch {
      setError("Não conseguimos salvar esta pausa agora. Suas escolhas continuam na tela.");
    } finally { setSaving(false); }
  };

  if (view === "library" && !player && !reflectionState) {
    return <PracticeLibrary practices={practices} initialCategory={libraryCategory} onBack={() => { setLibraryCategory(undefined); setView("home"); }} onStart={startPractice} />;
  }

  return (
    <section className="mx-auto max-w-6xl space-y-3">
      <div className="flex items-center gap-2.5">
        <AlumiaIcon icon={Yoga01Icon} size="md" className="module-text" />
        <div><h2 className="font-display text-xl font-semibold sm:text-2xl">Mindfulness</h2><p className="text-sm text-muted-foreground">Pequenas pausas para um presente mais gentil.</p></div>
      </div>

      <AlumiaModuleIntro
        image={ALUMIA_AVATAR_IMAGES.mindfulness}
        imageAlt="Alumia meditando com serenidade entre plantas"
        icon={Yoga01Icon}
        title="A Alumia faz esta pausa com você"
        description="Respire, perceba o presente e pare quando quiser. Aqui, poucos minutos já são cuidado."
      />

      {error && <InlineFeedback tone="danger">{error} <button type="button" onClick={load} className="font-semibold underline">Tentar novamente</button></InlineFeedback>}
      {feedback && <InlineFeedback tone="success">{feedback}</InlineFeedback>}

      {loading ? (
        <div className="space-y-3" aria-label="Carregando práticas"><div className="h-56 animate-pulse rounded-2xl bg-muted" /><div className="h-32 animate-pulse rounded-2xl bg-muted" /></div>
      ) : recommended ? (
        <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
          <div className="space-y-3">
            <Surface className="module-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-sm font-semibold module-text">Uma pausa possível agora</p><h3 className="mt-1 font-display text-2xl font-semibold">{recommended.title}</h3><p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><AlumiaIcon icon={Clock01Icon} size="xs" />{recommended.durationMinutes} min</p></div>
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"><AlumiaIcon icon={Yoga01Icon} size="lg" /></span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/80">{recommended.description}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button disabled={!recommended.formats.includes("audio")} onClick={() => startPractice(recommended, "audio")}><AlumiaIcon icon={HeadphonesIcon} size="sm" />Ouvir</Button>
                <Button variant="outline" disabled={!recommended.formats.includes("text")} onClick={() => startPractice(recommended, "text")}><AlumiaIcon icon={TextIcon} size="sm" />Ler</Button>
              </div>
            </Surface>

            <Surface className="p-4">
              <SectionHeader title="Quanto tempo faz sentido?" description="Escolher um tempo só ajuda a encontrar uma prática; você pode parar antes." />
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[2, 5, 10].map((minutes) => (
                  <Button key={minutes} variant="outline" className="px-2" onClick={() => {
                    const practice = findClosestPractice(practices, minutes);
                    if (practice) startPractice(practice, practice.formats.includes("audio") ? "audio" : "text");
                  }}><AlumiaIcon icon={Clock01Icon} size="xs" />{minutes} min</Button>
                ))}
              </div>
            </Surface>

            <Surface className="p-4">
              <SectionHeader title="O que você precisa neste momento?" description="Use estas opções apenas como caminhos para explorar." />
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {categories.map((category) => (
                  <button key={category} type="button" onClick={() => { setLibraryCategory(category); setView("library"); }} className="module-whisper flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border p-2 text-center text-sm font-semibold transition-transform hover:-translate-y-0.5">
                    <AlumiaIcon icon={categoryIcons[category]} size="md" className="module-text" />{mindfulnessCategoryLabels[category]}
                  </button>
                ))}
              </div>
            </Surface>
          </div>

          <aside className="space-y-3">
            <Surface className="p-4">
              <SectionHeader title="Explore outras práticas" description="Escolha por duração, formato ou pelo que parece possível agora." />
              <Button variant="outline" className="mt-3 w-full" onClick={() => { setLibraryCategory(undefined); setView("library"); }}>Abrir biblioteca<AlumiaIcon icon={ArrowRight01Icon} size="sm" /></Button>
            </Surface>
            <Surface variant="subtle" className="p-4 shadow-none">
              <p className="font-display text-base font-semibold">Você pode parar quando quiser.</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Uma prática não precisa mudar como você se sente para que o tempo reservado tenha valor.</p>
            </Surface>
          </aside>
        </div>
      ) : (
        <Surface variant="subtle" className="p-5 text-center"><p className="font-semibold">As práticas estão sendo preparadas.</p><p className="mt-1 text-sm text-muted-foreground">Volte em outro momento ou tente carregar novamente.</p></Surface>
      )}

      {player && (
        <MindfulnessPlayer
          key={player.practice.id}
          practice={player.practice}
          initialFormat={player.format}
          onAlternative={() => {
            if (fiveSenses) setPlayer({ practice: fiveSenses, format: "text" });
          }}
          onFinish={(result) => {
            setReflectionState({ ...player, ...result });
            setPlayer(null);
          }}
        />
      )}
      {reflectionState && (
        <MindfulnessReflection
          practice={reflectionState.practice}
          elapsedSeconds={reflectionState.elapsedSeconds}
          reflection={reflection}
          reminder={reminder}
          saving={saving}
          onReflectionChange={setReflection}
          onReminderChange={setReminder}
          onSave={saveReflection}
        />
      )}
    </section>
  );
}
