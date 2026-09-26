import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { HistoryIcon, SentIcon, SmileIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import {
  CareSuggestionCard,
  CheckinDetailDialog,
  CheckinHistoryList,
  EmotionPicker,
  MoodCalendar,
  MoodSummaryCard,
  NeedPicker,
} from "@/components/shared/checkin";
import { AddTaskSheet } from "@/components/shared/tasks/AddTaskSheet";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { InlineFeedback, Surface } from "@/components/ui/surface";
import { createCareCheckin, getCareCheckinHistory, getCheckinCatalogs } from "@/services/checkinService";
import { createTask } from "@/services/tasksService";
import { isSameLocalDay } from "@/lib/utils";
import type { CareCheckinHistoryItem, CheckinEmotion, CheckinNeed, CreateCareCheckinResult } from "@/types";

function newIdempotencyKey() {
  return globalThis.crypto.randomUUID();
}

export function CheckinPage() {
  const [emotions, setEmotions] = useState<CheckinEmotion[]>([]);
  const [needs, setNeeds] = useState<CheckinNeed[]>([]);
  const [history, setHistory] = useState<CareCheckinHistoryItem[]>([]);
  const [emotionCodes, setEmotionCodes] = useState<string[]>([]);
  const [needCode, setNeedCode] = useState("");
  const [idempotencyKey, setIdempotencyKey] = useState(newIdempotencyKey);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emotionError, setEmotionError] = useState<string | undefined>();
  const [needError, setNeedError] = useState<string | undefined>();
  const [result, setResult] = useState<CreateCareCheckinResult | null>(null);
  const [taskSheetOpen, setTaskSheetOpen] = useState(false);
  const [taskFeedback, setTaskFeedback] = useState<{ message: string; tone: "success" | "danger" } | null>(null);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<CareCheckinHistoryItem | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [catalogs, recentHistory] = await Promise.all([
        getCheckinCatalogs(),
        getCareCheckinHistory(0, 20),
      ]);
      setEmotions(catalogs.emotions);
      setNeeds(catalogs.needs);
      setHistory(recentHistory);
      const todayCheckin = recentHistory.find((item) => isSameLocalDay(item.occurredAt));
      if (todayCheckin?.suggestion) {
        setResult({
          checkinId: todayCheckin.id,
          occurredAt: todayCheckin.occurredAt,
          moodCategory: todayCheckin.moodCategory,
          suggestion: todayCheckin.suggestion,
        });
      }
    } catch {
      setLoadError("Não conseguimos preparar o check-in agora.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const restart = () => {
    setEmotionCodes([]);
    setNeedCode("");
    setEmotionError(undefined);
    setNeedError(undefined);
    setSubmitError(null);
    setResult(null);
    setIdempotencyKey(newIdempotencyKey());
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextEmotionError = emotionCodes.length ? undefined : "Escolha ao menos uma emoção que está presente.";
    const nextNeedError = needCode ? undefined : "Escolha o que você precisa ou apenas registre o momento.";
    setEmotionError(nextEmotionError);
    setNeedError(nextNeedError);
    setSubmitError(null);
    if (nextEmotionError || nextNeedError) return;

    setSubmitting(true);
    try {
      const checkin = await createCareCheckin({ emotionCodes, needCode, idempotencyKey });
      setResult(checkin);
      setHistory(await getCareCheckinHistory(0, 20));
    } catch {
      setSubmitError("Seu registro ainda não foi salvo. Você pode tentar novamente sem perder suas escolhas.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-3">
      <Surface className="module-surface flex items-start gap-2.5 p-3 shadow-none">
        <AlumiaIcon icon={SmileIcon} size="md" className="module-text mt-0.5" />
        <div>
          <h2 className="text-base font-semibold sm:text-lg">Check-in emocional da Alumia</h2>
          <p className="mt-0.5 text-sm leading-snug text-foreground/80">
            Um espaço breve para reconhecer o que você sente e escolher o cuidado que faz sentido agora.
          </p>
        </div>
      </Surface>

      {loadError && (
        <InlineFeedback tone="danger">
          {loadError}{" "}
          <button type="button" onClick={load} className="font-semibold underline">Tentar novamente</button>
        </InlineFeedback>
      )}

      {result ? (
        <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
          <div className="space-y-3">
            <MoodSummaryCard result={result} />
            <CareSuggestionCard
              suggestion={result.suggestion}
              onRestart={restart}
              onAddTask={() => setTaskSheetOpen(true)}
            />
            {taskFeedback && <InlineFeedback tone={taskFeedback.tone}>{taskFeedback.message}</InlineFeedback>}
          </div>
          <div className="lg:rounded-[1.125rem] lg:border lg:border-border/80 lg:bg-surface lg:p-3 lg:shadow-[var(--shadow-card)]">
            <MoodCalendar items={history} onSelect={setSelectedHistoryItem} />
          </div>
          <CheckinDetailDialog
            item={selectedHistoryItem}
            onOpenChange={(open) => {
              if (!open) setSelectedHistoryItem(null);
            }}
          />
          <AddTaskSheet
            key={result.checkinId}
            open={taskSheetOpen}
            onClose={() => setTaskSheetOpen(false)}
            initialTitle={result.suggestion.actionText}
            initialDescription="Sugestão do check-in emocional da Alumia."
            moduleKey="checkin"
            onSave={async (task) => {
              try {
                await createTask(task);
                setTaskFeedback({ message: "A sugestão foi adicionada às suas tarefas.", tone: "success" });
              } catch {
                setTaskFeedback({ message: "Não conseguimos adicionar a tarefa agora.", tone: "danger" });
              }
            }}
          />
        </div>
      ) : (
        <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(18rem,0.65fr)]">
          <Surface className="p-3 sm:p-4">
            {loading ? (
              <div role="status" className="flex min-h-56 items-center justify-center gap-2 text-sm text-muted-foreground">
                <AlumiaIcon icon={SparklesIcon} size="sm" className="module-text" />
                Preparando este espaço com calma…
              </div>
            ) : emotions.length === 0 || needs.length === 0 ? (
              <InlineFeedback>O conteúdo deste check-in está sendo preparado. Volte em breve.</InlineFeedback>
            ) : (
              <form onSubmit={submit} noValidate>
                <EmotionPicker
                  emotions={emotions}
                  value={emotionCodes}
                  onChange={(codes) => {
                    setEmotionCodes(codes);
                    setEmotionError(undefined);
                  }}
                  error={emotionError}
                />
                <div className="module-divider my-3.5 h-px" />
                <NeedPicker
                  needs={needs}
                  value={needCode}
                  onChange={(code) => {
                    setNeedCode(code);
                    setNeedError(undefined);
                  }}
                  error={needError}
                />
                {submitError && <div className="mt-3"><InlineFeedback tone="danger">{submitError}</InlineFeedback></div>}
                <div className="mt-3.5 flex justify-center">
                  <Button type="submit" size="lg" disabled={submitting} className="w-full max-w-sm">
                    <AlumiaIcon icon={SentIcon} size="sm" />
                    {submitting ? "Acolhendo seu registro…" : "Realizar check-in"}
                  </Button>
                </div>
              </form>
            )}
          </Surface>

          <aside aria-labelledby="recent-checkins-title">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlumiaIcon icon={HistoryIcon} size="sm" className="module-text" />
                <h2 id="recent-checkins-title" className="text-base font-semibold">Registros recentes</h2>
              </div>
              <Link to="/check-in/historico" className="text-sm font-semibold text-primary hover:underline">
                Ver histórico
              </Link>
            </div>
            <CheckinHistoryList items={history} compact />
          </aside>
        </div>
      )}
    </div>
  );
}
