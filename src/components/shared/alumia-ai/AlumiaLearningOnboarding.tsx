import { useEffect, useMemo, useState } from "react";
import { AiBrain01Icon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { completeLearningOnboarding, getLearningPreference, setMemoryEnabled } from "@/services/alumiaMemoryService";

const questions = [
  { prompt: "O que mais importa para você neste momento?", memory: "Prioridade atual" },
  { prompt: "Existe algo que você está tentando aprender ou conquistar?", memory: "Objetivo atual" },
  { prompt: "Como você prefere que eu ajude quando algo estiver difícil?", memory: "Forma de apoio preferida" },
  { prompt: "Tem alguma sugestão ou abordagem que você prefere evitar?", memory: "Prefere evitar" },
] as const;

type Stage = "consent" | "questions" | "review" | "done";

export function AlumiaLearningOnboarding() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<Stage>("consent");
  const [question, setQuestion] = useState(0);
  const [draft, setDraft] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getLearningPreference().then((preference) => {
      if (!active) return;
      if (!preference.decided) {
        setStage("consent");
        setOpen(true);
      } else if (preference.enabled && !preference.onboardingCompleted) {
        setStage("questions");
        setOpen(true);
      }
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const memories = useMemo(() => questions.flatMap((item, index) => {
    const answer = answers[index]?.trim();
    return answer ? [`${item.memory}: ${answer}`] : [];
  }), [answers]);

  async function allowLearning() {
    setBusy(true); setError("");
    try {
      await setMemoryEnabled(true);
      setStage("questions");
    } catch { setError("Não consegui registrar sua escolha agora. Tente novamente."); }
    finally { setBusy(false); }
  }

  async function declineLearning() {
    setBusy(true); setError("");
    try {
      await setMemoryEnabled(false);
      setOpen(false);
    } catch { setError("Não consegui registrar sua escolha agora. Tente novamente."); }
    finally { setBusy(false); }
  }

  function nextQuestion() {
    const nextAnswers = [...answers];
    nextAnswers[question] = draft.trim();
    setAnswers(nextAnswers);
    if (question === questions.length - 1) {
      setDraft("");
      setStage("review");
    } else {
      const nextQuestionIndex = question + 1;
      setQuestion(nextQuestionIndex);
      setDraft(nextAnswers[nextQuestionIndex] ?? "");
    }
  }

  async function finish() {
    setBusy(true); setError("");
    try {
      await completeLearningOnboarding(memories);
      setStage("done");
    } catch { setError("Não consegui salvar seu perfil agora. Suas respostas continuam nesta tela para você tentar novamente."); }
    finally { setBusy(false); }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90svh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl p-4 sm:rounded-2xl sm:p-6">
        <div className="flex items-center gap-3 pr-7">
          <span className="module-whisper flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border module-text"><AlumiaIcon icon={AiBrain01Icon} size="md" /></span>
          <div><DialogTitle>{stage === "consent" ? "Posso aprender com você?" : stage === "done" ? "Obrigada por me contar" : "Quero conhecer você aos poucos"}</DialogTitle><DialogDescription className="mt-1">Você continua no controle do que fica na sua memória pessoal.</DialogDescription></div>
        </div>

        {stage === "consent" && <div className="space-y-4">
          <p className="text-sm leading-relaxed">Com sua autorização, a Alum.IA poderá usar o que você contar e suas atividades na Alumia para aprender preferências, objetivos e rotinas e personalizar sua experiência.</p>
          <div className="rounded-xl border border-border bg-surface-subtle p-3 text-xs leading-relaxed text-muted-foreground">
            A autorização é opcional. Você poderá ver, corrigir, baixar ou apagar o que foi aprendido e desligar essa função em Ajustes. Conversas completas não serão guardadas como lembranças e dados sensíveis não farão parte deste primeiro aprendizado.
          </div>
          <details className="text-xs leading-relaxed text-muted-foreground"><summary className="min-h-11 cursor-pointer py-3 font-semibold text-primary">Saiba como funciona</summary><div className="space-y-2"><p>A finalidade é criar um perfil pessoal para adaptar conversas e sugestões. A Alum.IA considera somente informações úteis a essa finalidade, mantendo a origem e a data de atualização.</p><p>Tarefas, Estudante, Hidratação e Mindfulness podem gerar preferências resumidas depois de um padrão se repetir três vezes. Títulos, descrições, totais, reflexões e check-ins não são copiados. Financeiro e dados emocionais permanecem fora deste aprendizado.</p><p>O processamento de respostas usa um provedor contratado de inteligência artificial. Qualquer ampliação para dados sensíveis exigirá uma autorização própria e destacada.</p><p>Revogar a autorização interrompe novos aprendizados e o uso das lembranças. A exclusão do que já foi guardado é uma ação separada disponível em Ajustes.</p></div></details>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button type="button" variant="ghost" disabled={busy} onClick={() => void declineLearning()}>Agora não</Button><Button type="button" disabled={busy} onClick={() => void allowLearning()}>Permitir e começar</Button></div>
        </div>}

        {stage === "questions" && <div className="space-y-4">
          <div><div className="mb-2 flex justify-between text-xs text-muted-foreground"><span>Uma pergunta por vez</span><span>{question + 1} de {questions.length}</span></div><Progress value={((question + 1) / questions.length) * 100} /></div>
          <div className="module-whisper rounded-2xl border p-4"><p className="text-sm leading-relaxed">{questions[question].prompt}</p></div>
          <label htmlFor="learning-answer" className="sr-only">Sua resposta</label>
          <Textarea id="learning-answer" autoFocus value={draft} maxLength={200} rows={3} onChange={(event) => setDraft(event.target.value)} placeholder="Responda do seu jeito…" disabled={busy} className="resize-none rounded-xl" />
          <div className="flex items-center justify-between gap-2"><Button type="button" variant="ghost" onClick={nextQuestion}>Pular</Button><Button type="button" onClick={nextQuestion}>{question === questions.length - 1 ? "Revisar" : "Continuar"}</Button></div>
        </div>}

        {stage === "review" && <div className="space-y-4">
          <div><h3 className="text-sm font-semibold">Foi isso que entendi sobre você</h3><p className="mt-1 text-xs text-muted-foreground">Confira antes de formar seu perfil inicial.</p></div>
          {memories.length ? <ul className="divide-y divide-border rounded-xl border px-3">{memories.map((memory) => <li key={memory} className="py-3 text-sm">{memory}</li>)}</ul> : <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">Tudo bem não responder agora. Você poderá construir esse perfil naturalmente com o tempo.</p>}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between"><Button type="button" variant="ghost" disabled={busy} onClick={() => { setQuestion(0); setDraft(answers[0] ?? ""); setStage("questions"); }}>Rever respostas</Button><Button type="button" disabled={busy} onClick={() => void finish()}>{memories.length ? "Salvar meu perfil" : "Concluir por agora"}</Button></div>
        </div>}

        {stage === "done" && <div className="space-y-4"><p className="text-sm leading-relaxed">Seu perfil inicial está pronto. Você poderá acompanhar, corrigir ou apagar cada lembrança em Ajustes.</p><Button type="button" className="w-full" onClick={() => setOpen(false)}>Continuar conversando</Button></div>}
        {busy && <p role="status" className="text-xs text-muted-foreground">Salvando sua escolha…</p>}
        {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}
