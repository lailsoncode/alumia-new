import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AddCircleIcon,
  AiBookIcon,
  ArrowRight01Icon,
  BulbIcon,
  Calendar01Icon,
  Clock01Icon,
  PlayIcon,
} from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { AlumiaModuleIntro } from "@/components/shared/AlumiaModuleIntro";
import { Button } from "@/components/ui/button";
import { InlineFeedback, SectionHeader, Surface } from "@/components/ui/surface";
import { DatePickerSheet } from "@/components/shared/tasks/DatePickerSheet";
import { formatCommitmentDate, getReviewDate, getUpcomingCommitments } from "@/lib/student";
import { getLocalDateString } from "@/lib/utils";
import { ALUMIA_AVATAR_IMAGES } from "@/lib/alumia-avatar";
import { createStudentCommitment, createStudyReview, completeStudySession, getStudentDashboardData } from "@/services/studentService";
import { updateTask } from "@/services/tasksService";
import type { CreateStudentCommitmentInput, StudentCommitment, StudentDashboardData, StudyOutcome } from "@/types";
import { FocusSession } from "./FocusSession";
import { StudentCommitmentDialog } from "./StudentCommitmentDialog";
import { StudyReflection } from "./StudyReflection";

interface ActiveSession {
  commitment?: StudentCommitment;
  minutes: number;
}

interface ReflectionState extends ActiveSession {
  elapsedSeconds: number;
  startedAt: string;
}

export function StudentDashboard() {
  const [data, setData] = useState<StudentDashboardData>({ subjects: [], commitments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rescheduling, setRescheduling] = useState<StudentCommitment | null>(null);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [reflection, setReflection] = useState<ReflectionState | null>(null);
  const [outcome, setOutcome] = useState<StudyOutcome>();
  const [reviewDays, setReviewDays] = useState<number>();
  const [savingReflection, setSavingReflection] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setData(await getStudentDashboardData()); }
    catch { setError("Não conseguimos carregar sua área de estudos agora."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const upcoming = useMemo(() => getUpcomingCommitments(data.commitments, 3), [data.commitments]);
  const nextCommitment = upcoming[0];

  const saveCommitment = async (input: CreateStudentCommitmentInput) => {
    await createStudentCommitment(input);
    await load();
    setFeedback("Seu compromisso foi adicionado à semana.");
  };

  const saveReflection = async () => {
    if (!reflection) return;
    setSavingReflection(true);
    setError(null);
    try {
      await completeStudySession({
        taskId: reflection.commitment?.id,
        subjectId: reflection.commitment?.studentDetails.subjectId || undefined,
        plannedMinutes: reflection.minutes,
        elapsedSeconds: reflection.elapsedSeconds,
        outcome,
        startedAt: reflection.startedAt,
      });
      if (reviewDays && reflection.commitment) {
        await createStudyReview(reflection.commitment, getReviewDate(reviewDays));
        setFeedback("Sessão registrada e revisão adicionada à sua agenda.");
      } else setFeedback("Sua sessão foi registrada com carinho.");
      setReflection(null);
      setOutcome(undefined);
      setReviewDays(undefined);
      await load();
    } catch {
      setError("Não conseguimos registrar essa sessão. Suas escolhas continuam na tela.");
    } finally { setSavingReflection(false); }
  };

  return (
    <section className="mx-auto max-w-6xl space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <AlumiaIcon icon={AiBookIcon} size="md" className="module-text" />
          <div>
            <h2 className="font-display text-xl font-semibold sm:text-2xl">Estudante</h2>
            <p className="text-sm text-muted-foreground">Planeje, comece pequeno e revise no seu tempo.</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}><AlumiaIcon icon={AddCircleIcon} size="sm" /><span className="hidden min-[420px]:inline">Novo compromisso</span><span className="min-[420px]:hidden">Adicionar</span></Button>
      </div>

      <AlumiaModuleIntro
        image={ALUMIA_AVATAR_IMAGES.student}
        imageAlt="Alumia estudando com uma lista e um calendário"
        icon={BulbIcon}
        title="A Alumia estuda com você"
        description="Escolha uma etapa pequena, foque pelo tempo possível e deixe a revisão para o momento certo."
      />

      {error && <InlineFeedback tone="danger">{error} <button type="button" onClick={load} className="font-semibold underline">Tentar novamente</button></InlineFeedback>}
      {feedback && <InlineFeedback tone="success">{feedback}</InlineFeedback>}

      {loading ? (
        <div className="space-y-3" aria-label="Carregando área do estudante"><div className="h-56 animate-pulse rounded-2xl bg-muted" /><div className="h-32 animate-pulse rounded-2xl bg-muted" /></div>
      ) : (
        <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
          <div className="space-y-3">
            <Surface className="module-surface overflow-hidden p-4">
              {nextCommitment ? (
                <>
                  <div className="flex items-center gap-2 text-sm font-semibold module-text"><AlumiaIcon icon={Calendar01Icon} size="sm" />Próximo compromisso</div>
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl font-semibold sm:text-2xl">{nextCommitment.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{nextCommitment.studentDetails.subject?.name || "Sem matéria"}</p>
                      <p className="mt-2 flex items-center gap-1.5 text-sm font-medium"><AlumiaIcon icon={Clock01Icon} size="xs" />{formatCommitmentDate(nextCommitment.date)}{nextCommitment.time ? `, ${nextCommitment.time}` : ""}</p>
                    </div>
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary"><AlumiaIcon icon={AiBookIcon} size="lg" /></span>
                  </div>
                  <div className="mt-4 flex flex-col gap-2 min-[420px]:flex-row">
                    <Button className="flex-1" onClick={() => setActiveSession({ commitment: nextCommitment, minutes: nextCommitment.studentDetails.estimatedMinutes })}><AlumiaIcon icon={PlayIcon} size="sm" />Começar agora</Button>
                    <Button variant="outline" className="flex-1" onClick={() => setRescheduling(nextCommitment)}>Reagendar</Button>
                  </div>
                </>
              ) : (
                <div className="py-3 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12 text-primary"><AlumiaIcon icon={AiBookIcon} size="lg" /></span>
                  <h3 className="mt-3 font-display text-xl font-semibold">Sua próxima etapa pode começar pequena.</h3>
                  <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">Adicione uma leitura, prova, trabalho ou revisão quando fizer sentido.</p>
                  <Button className="mt-4" onClick={() => setDialogOpen(true)}>Criar primeiro compromisso</Button>
                </div>
              )}
            </Surface>

            <Surface className="p-4">
              <SectionHeader icon={PlayIcon} iconClassName="module-text" title="Estudar agora" description={nextCommitment ? `Comece por ${nextCommitment.title} com um tempo confortável.` : "Você também pode iniciar uma sessão livre."} />
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[10, 15, 25].map((minutes) => (
                  <Button key={minutes} variant="outline" className="px-2" onClick={() => setActiveSession({ commitment: nextCommitment, minutes })}><AlumiaIcon icon={Clock01Icon} size="xs" />{minutes} min</Button>
                ))}
              </div>
            </Surface>

            <Surface className="p-4">
              <SectionHeader icon={Calendar01Icon} iconClassName="module-text" title="Minha semana" description="Os próximos compromissos, sem transformar atraso em fracasso." />
              {upcoming.length ? (
                <ul className="mt-3 divide-y divide-border">
                  {upcoming.map((commitment) => (
                    <li key={commitment.id} className="flex items-center gap-3 py-3 first:pt-1 last:pb-0">
                      <div className="w-16 shrink-0 text-xs text-muted-foreground"><span className="block font-semibold text-foreground">{formatCommitmentDate(commitment.date)}</span>{commitment.time}</div>
                      <span className="h-10 w-1 shrink-0 rounded-full bg-primary" />
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{commitment.title}</p><p className="truncate text-xs text-muted-foreground">{commitment.studentDetails.subject?.name}</p></div>
                      <Button variant="ghost" size="icon" onClick={() => setActiveSession({ commitment, minutes: commitment.studentDetails.estimatedMinutes })} aria-label={`Estudar ${commitment.title}`}><AlumiaIcon icon={ArrowRight01Icon} size="sm" /></Button>
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-3 text-sm text-muted-foreground">Nenhum compromisso marcado. Esse espaço também pode ser descanso.</p>}
            </Surface>
          </div>

          <aside className="space-y-3">
            <Surface className="module-whisper p-4">
              <SectionHeader icon={BulbIcon} iconClassName="module-text" title="Uma sugestão para você" />
              <h3 className="mt-3 font-display text-lg font-semibold">Experimente lembrar antes de reler</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Feche o material e tente recuperar três ideias. Depois, confira com calma o que faltou.</p>
            </Surface>
            <Surface variant="subtle" className="p-4 shadow-none">
              <h3 className="font-display text-lg font-semibold">Aprender a estudar</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Métodos e trilhas curtas entrarão aqui depois que o ciclo de agenda, foco e revisão estiver validado.</p>
            </Surface>
          </aside>
        </div>
      )}

      <StudentCommitmentDialog open={dialogOpen} subjects={data.subjects} onClose={() => setDialogOpen(false)} onSave={saveCommitment} />
      <DatePickerSheet
        open={Boolean(rescheduling)}
        initialDate={rescheduling?.date ? new Date(`${rescheduling.date}T00:00:00`) : null}
        initialTime={rescheduling?.time ?? null}
        onClose={() => setRescheduling(null)}
        onSave={(date, time) => {
          if (!rescheduling || !date) return;
          void updateTask(rescheduling.id, { date: getLocalDateString(date), time: time || null })
            .then(async () => {
              setFeedback("O compromisso ganhou um novo momento.");
              await load();
            })
            .catch(() => setError("Não conseguimos reagendar esse compromisso agora."));
        }}
      />
      {activeSession && (
        <FocusSession
          commitment={activeSession.commitment}
          minutes={activeSession.minutes}
          onFinish={({ elapsedSeconds, startedAt }) => {
            setReflection({ ...activeSession, elapsedSeconds, startedAt });
            setActiveSession(null);
          }}
        />
      )}
      {reflection && (
        <StudyReflection
          commitment={reflection.commitment}
          elapsedSeconds={reflection.elapsedSeconds}
          saving={savingReflection}
          outcome={outcome}
          reviewDays={reviewDays}
          onOutcomeChange={setOutcome}
          onReviewDaysChange={setReviewDays}
          onSave={saveReflection}
        />
      )}
    </section>
  );
}
