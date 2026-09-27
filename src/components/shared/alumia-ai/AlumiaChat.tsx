import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  AiBrain01Icon,
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  Delete02Icon,
  LockIcon,
  SentIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { Textarea } from "@/components/ui/textarea";
import { AddTaskSheet } from "@/components/shared/tasks/AddTaskSheet";
import { AlumiaContextPreference } from "./AlumiaContextPreference";
import { AlumiaMemory, MemorySuggestion } from "./AlumiaMemory";
import { cn } from "@/lib/utils";
import { confirmAlumiaAction, isAlumiaGenerativeEnabled, respondToAlumia } from "@/services/alumiaAIService";
import type { AddTaskData, AlumiaConversationMessage, AlumiaProposedAction } from "@/types";

type ActionState = "pending" | "saving" | "done" | "cancelled" | "error";

const FIRST_MESSAGE: AlumiaConversationMessage = {
  id: "alumia-welcome",
  role: "assistant",
  text: isAlumiaGenerativeEnabled()
    ? "Oi, eu sou a Alum.IA. Posso conversar com você e ajudar com tarefas e pausas de Mindfulness. A conversa fica somente nesta tela e nenhuma ação acontece sem você confirmar."
    : "Oi, eu sou a Alum.IA. Nesta prévia, posso ajudar com tarefas e pausas de Mindfulness usando respostas editoriais. A conversa fica somente nesta tela e nenhuma ação acontece sem você confirmar.",
  tone: "default",
};

const quickPrompts = [
  "O que merece atenção hoje?",
  "Quero uma pausa breve",
  "Crie uma tarefa comprar pão",
];

function messageId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `alumia-message-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function AlumiaChat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<AlumiaConversationMessage[]>([FIRST_MESSAGE]);
  const [actionStates, setActionStates] = useState<Record<string, ActionState>>({});
  const [input, setInput] = useState("");
  const [responding, setResponding] = useState(false);
  const [editingAction, setEditingAction] = useState<AlumiaProposedAction | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, actionStates, responding]);

  async function sendMessage(rawMessage: string) {
    const text = rawMessage.trim();
    if (!text || responding) return;

    setMessages((current) => [...current, { id: messageId(), role: "user", text }]);
    setInput("");
    setResponding(true);

    try {
      const result = await respondToAlumia(text, messages);
      setMessages((current) => [
        ...current,
        {
          id: messageId(),
          role: "assistant",
          text: result.text,
          tone: result.tone,
          source: result.source,
          proposedAction: result.proposedAction,
          memorySuggestion: result.memorySuggestion,
          navigation: result.navigation,
        },
      ]);
      if (result.proposedAction) {
        setActionStates((current) => ({ ...current, [result.proposedAction!.id]: "pending" }));
      }
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: messageId(),
          role: "assistant",
          text: "Não consegui consultar esse módulo agora. Nada foi alterado. Você pode tentar novamente quando quiser.",
          tone: "default",
        },
      ]);
    } finally {
      setResponding(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  }

  async function confirmAction(action: AlumiaProposedAction | undefined) {
    if (!action || actionStates[action.id] === "saving" || actionStates[action.id] === "done") return false;

    setActionStates((current) => ({ ...current, [action.id]: "saving" }));
    try {
      await confirmAlumiaAction(action);
      setActionStates((current) => ({ ...current, [action.id]: "done" }));
      setMessages((current) => [
        ...current,
        {
          id: messageId(),
          role: "assistant",
          text: `Pronto, a tarefa “${action.title}” foi criada. Ela está na sua lista, e você pode ajustá-la quando quiser.`,
          tone: "default",
          source: "editorial",
          navigation: { label: "Abrir tarefas", to: "/tarefas" },
        },
      ]);
      return true;
    } catch {
      setActionStates((current) => ({ ...current, [action.id]: "error" }));
      return false;
    }
  }

  function cancelAction(actionId: string) {
    setActionStates((current) => ({ ...current, [actionId]: "cancelled" }));
  }

  function clearConversation() {
    setMessages([FIRST_MESSAGE]);
    setActionStates({});
    setInput("");
    setEditingAction(null);
  }

  async function confirmEditedAction(data: AddTaskData) {
    if (!editingAction) return;
    const confirmed = await confirmAction({
      ...editingAction,
      title: data.title,
      description: data.description,
      date: data.date,
      time: data.time,
      priority: data.priority,
      reminder: data.reminder,
    });
    if (!confirmed) throw new Error("TASK_CONFIRMATION_FAILED");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-3">
      <Surface className="module-surface p-3 sm:p-4">
        <div className="flex items-start gap-3">
          <span className="module-whisper flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border module-text">
            <AlumiaIcon icon={AiBrain01Icon} size="md" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">Alum.IA</h1>
              <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                {isAlumiaGenerativeEnabled() ? "Prévia com IA" : "Prévia segura"}
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Uma assistente para organizar o próximo passo possível — sem cobrança e sem agir por você.
            </p>
          </div>
        </div>
      </Surface>

      <Surface variant="subtle" className="flex items-start gap-2.5 p-3 text-sm leading-relaxed">
        <AlumiaIcon icon={LockIcon} size="sm" className="module-text mt-0.5" />
        <p>
          {isAlumiaGenerativeEnabled()
            ? "Você decide o que compartilhar. A conversa fica só nesta tela, e qualquer ação precisa da sua confirmação."
            : "Nesta etapa, suas mensagens não são salvas nem enviadas a um modelo de IA. A Alum.IA consulta apenas Tarefas e Mindfulness quando você pede."}
        </p>
      </Surface>

      <Surface className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-border/70 px-3 py-2.5 sm:px-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <AlumiaIcon icon={SparklesIcon} size="sm" className="module-text" />
            Conversa deste momento
          </div>
          <div className="flex items-center gap-1">
          {isAlumiaGenerativeEnabled() && <AlumiaMemory />}
          <Button type="button" variant="ghost" size="sm" onClick={clearConversation} aria-label="Limpar conversa atual">
            <AlumiaIcon icon={Delete02Icon} size="sm" />
            <span className="hidden sm:inline">Limpar</span>
          </Button>
          </div>
        </div>

        {isAlumiaGenerativeEnabled() && <AlumiaContextPreference />}
        <div
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          className="max-h-[min(56vh,34rem)] min-h-80 space-y-3 overflow-y-auto px-3 py-4 sm:px-4"
        >
          {messages.map((message) => {
            const action = message.proposedAction;
            const actionState = action ? actionStates[action.id] ?? "pending" : undefined;
            return (
              <article
                key={message.id}
                className={cn(
                  "max-w-[92%] rounded-[1.125rem] border px-3.5 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[80%]",
                  message.role === "user"
                    ? "ml-auto border-primary/25 bg-primary text-primary-foreground"
                    : message.tone === "safety"
                      ? "mr-auto border-warning/45 bg-warning text-warning-foreground"
                      : "mr-auto module-whisper",
                )}
              >
                {message.role === "assistant" && message.source && (
                  <p className="mb-1 text-[0.6875rem] font-semibold uppercase tracking-wide opacity-70">
                    {message.source === "generative" ? "Resposta com IA" : "Resposta do módulo"}
                  </p>
                )}
                <p className="whitespace-pre-line">{message.text}</p>
                {message.memorySuggestion && <MemorySuggestion content={message.memorySuggestion.content} />}

                {message.tone === "safety" && (
                  <div className="mt-3 flex flex-wrap gap-2" aria-label="Contatos de apoio">
                    <a href="tel:188" className="inline-flex min-h-11 items-center rounded-xl border border-current/25 bg-surface px-3 font-semibold text-foreground">Ligar 188 — CVV</a>
                    <a href="tel:192" className="inline-flex min-h-11 items-center rounded-xl border border-current/25 bg-surface px-3 font-semibold text-foreground">Ligar 192 — SAMU</a>
                    <a href="https://cvv.org.br/" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-xl border border-current/25 bg-surface px-3 font-semibold text-foreground">Abrir site do CVV</a>
                  </div>
                )}

                {action && (
                  <div className="mt-3 rounded-xl border border-border/80 bg-surface p-3 text-foreground">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ação proposta</p>
                    <p className="mt-1 font-semibold">Criar tarefa: {action.title}</p>
                    {(action.description || action.date || action.time || action.priority || action.reminder) && (
                      <dl className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                        {action.description && <div className="sm:col-span-2"><dt className="sr-only">Descrição</dt><dd>{action.description}</dd></div>}
                        {action.date && <div><dt className="inline font-semibold">Data: </dt><dd className="inline">{new Date(`${action.date}T12:00:00`).toLocaleDateString("pt-BR")}</dd></div>}
                        {action.time && <div><dt className="inline font-semibold">Horário: </dt><dd className="inline">{action.time}</dd></div>}
                        {action.priority && <div><dt className="inline font-semibold">Prioridade: </dt><dd className="inline">{action.priority}</dd></div>}
                        {action.reminder && <div><dt className="inline font-semibold">Lembrete: </dt><dd className="inline">{action.reminder === "na_hora" ? "na hora" : action.reminder.replace("min", " min antes")}</dd></div>}
                      </dl>
                    )}

                    {(actionState === "pending" || actionState === "error") && (
                      <div className="mt-3">
                        {actionState === "error" && (
                          <p role="status" className="mb-2 flex items-start gap-1.5 text-xs text-destructive">
                            <AlumiaIcon icon={AlertCircleIcon} size="xs" className="mt-0.5" />
                            Não consegui confirmar o resultado. Confira sua lista antes de tentar criar novamente.
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {actionState === "pending" ? (
                            <>
                              <Button type="button" size="sm" onClick={() => void confirmAction(action)}>Criar tarefa</Button>
                              <Button type="button" size="sm" variant="outline" onClick={() => setEditingAction(action)}>Revisar detalhes</Button>
                            </>
                          ) : (
                            <Button type="button" size="sm" variant="outline" onClick={() => navigate({ to: "/tarefas" })}>Ver tarefas</Button>
                          )}
                          <Button type="button" size="sm" variant="outline" onClick={() => cancelAction(action.id)}>Agora não</Button>
                        </div>
                      </div>
                    )}

                    {actionState === "saving" && <p role="status" className="mt-2 text-sm text-muted-foreground">Criando somente o que você confirmou…</p>}
                    {actionState === "done" && <p role="status" className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-success-foreground"><AlumiaIcon icon={CheckmarkCircle02Icon} size="sm" />Tarefa criada</p>}
                    {actionState === "cancelled" && <p role="status" className="mt-2 text-sm text-muted-foreground">Tudo bem. Nenhuma tarefa foi criada.</p>}
                  </div>
                )}

                {message.navigation && (
                  <Button type="button" size="sm" variant="outline" className="mt-3" onClick={() => navigate({ to: message.navigation!.to })}>
                    {message.navigation.label}
                  </Button>
                )}
              </article>
            );
          })}

          {responding && (
            <div role="status" className="mr-auto flex max-w-[80%] items-center gap-2 rounded-[1.125rem] border border-border module-whisper px-3.5 py-3 text-sm text-muted-foreground">
              <AlumiaIcon icon={SparklesIcon} size="sm" className="module-text" />
              Cuidando da resposta…
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-border/70 p-3 sm:p-4">
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1" aria-label="Sugestões de mensagem">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={responding}
                onClick={() => void sendMessage(prompt)}
                className="min-h-11 shrink-0 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-surface-subtle disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <label htmlFor="alumia-message" className="sr-only">Mensagem para a Alum.IA</label>
              <Textarea
                id="alumia-message"
                value={input}
                onChange={(event) => setInput(event.target.value.slice(0, 500))}
                onKeyDown={handleKeyDown}
                placeholder="Escreva o que faria diferença agora…"
                rows={2}
                disabled={responding}
                className="max-h-36 min-h-14 resize-none rounded-xl bg-surface"
              />
              <p className="mt-1 text-xs text-muted-foreground">Enter envia · Shift + Enter quebra a linha · {input.length}/500</p>
            </div>
            <Button type="submit" size="icon-lg" disabled={responding || !input.trim()} aria-label="Enviar mensagem">
              <AlumiaIcon icon={SentIcon} size="md" />
            </Button>
          </form>
        </div>
      </Surface>
      {editingAction && (
        <AddTaskSheet
          key={editingAction.id}
          open
          onClose={() => setEditingAction(null)}
          onSave={confirmEditedAction}
          initialTitle={editingAction.title}
          initialDescription={editingAction.description}
          initialDate={editingAction.date}
          initialTime={editingAction.time}
          initialPriority={editingAction.priority}
          initialReminder={editingAction.reminder}
          submitLabel="Confirmar e criar"
          moduleKey="alumia_ai"
        />
      )}
    </div>
  );
}
