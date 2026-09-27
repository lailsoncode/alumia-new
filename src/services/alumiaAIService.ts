import { classifyAlumiaIntent, extractTaskTitle } from "@/lib/alumia-ai";
import { supabase } from "@/lib/supabaseClient";
import { getLocalDateString } from "@/lib/utils";
import type { AlumiaAssistantResult, AlumiaConversationMessage, AlumiaProposedAction, MindfulnessPractice, Task } from "@/types";
import { getMindfulnessPractices } from "./mindfulnessService";
import { createTask, getTasks } from "./tasksService";

const CRISIS_RESPONSE =
  "Sinto muito que este momento esteja tão difícil. Eu não consigo oferecer o apoio humano que uma situação assim merece. Se puder, procure agora alguém de confiança para ficar com você. No Brasil, o CVV atende gratuitamente pelo 188. Se houver perigo imediato ou uma emergência, ligue para o SAMU no 192 ou procure o serviço de emergência da sua região.";

type RemoteChatResponse = {
  mode?: "generative" | "safety" | "proposal";
  message?: string;
  proposal?: unknown;
};

function parseRemoteProposal(value: unknown): AlumiaProposedAction | undefined {
  if (!value || typeof value !== "object") return undefined;
  const proposal = value as Record<string, unknown>;
  const id = typeof proposal.id === "string" ? proposal.id : "";
  const title = typeof proposal.title === "string" ? proposal.title.trim() : "";
  const description = typeof proposal.description === "string" ? proposal.description.trim() : undefined;
  const date = typeof proposal.date === "string" ? proposal.date : undefined;
  const time = typeof proposal.time === "string" ? proposal.time : undefined;
  const priority = proposal.priority ?? null;
  const reminder = proposal.reminder ?? null;

  if (proposal.type !== "create_task" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) return undefined;
  if (!title || title.length > 120 || (description && description.length > 500)) return undefined;
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return undefined;
  if (time && (!date || !/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(time))) return undefined;
  if (priority !== null && !["alta", "media", "baixa"].includes(String(priority))) return undefined;
  if (reminder !== null && (!date || !time || !["na_hora", "5min", "15min", "30min"].includes(String(reminder)))) return undefined;

  return {
    id,
    type: "create_task",
    title,
    description: description || undefined,
    date,
    time,
    priority: priority as AlumiaProposedAction["priority"],
    reminder: reminder as AlumiaProposedAction["reminder"],
  };
}

function generativeServiceUrl() {
  if (import.meta.env.VITE_ENABLE_ALUMIA_AI_GENERATIVE !== "true") return null;
  return import.meta.env.VITE_ALUMIA_AI_URL?.trim().replace(/\/$/, "") || null;
}

export function isAlumiaGenerativeEnabled() {
  return Boolean(generativeServiceUrl());
}

async function requestGenerativeResponse(message: string, history: AlumiaConversationMessage[]): Promise<AlumiaAssistantResult> {
  const serviceUrl = generativeServiceUrl();
  if (!serviceUrl) throw new Error("ALUMIA_GENERATIVE_DISABLED");

  const { data, error } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token;
  if (error || !accessToken) throw new Error("ALUMIA_SESSION_UNAVAILABLE");

  const safeHistory = history
    .filter((item) => item.role === "user" || item.source === "generative")
    .slice(-8)
    .map(({ role, text }) => ({ role, text }));

  const response = await fetch(`${serviceUrl}/v1/chat`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      message,
      history: safeHistory,
      context: {
        localDate: getLocalDateString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      },
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) throw new Error(`ALUMIA_SERVICE_${response.status}`);
  const payload = await response.json() as RemoteChatResponse;
  if (!payload.message?.trim()) throw new Error("ALUMIA_EMPTY_RESPONSE");
  const proposedAction = payload.mode === "proposal" ? parseRemoteProposal(payload.proposal) : undefined;
  if (payload.mode === "proposal" && !proposedAction) throw new Error("ALUMIA_INVALID_PROPOSAL");

  return {
    text: payload.message.trim(),
    tone: payload.mode === "safety" ? "safety" : "default",
    source: payload.mode === "generative" || payload.mode === "proposal" ? "generative" : "editorial",
    proposedAction,
  };
}

function actionId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `alumia-action-${Date.now()}`;
}

function formatTaskSummary(tasks: Task[]) {
  const pending = tasks.filter((task) => !task.done);
  if (!pending.length) {
    return "Não encontrei tarefas pendentes agora. Se quiser, posso preparar uma nova tarefa para você confirmar.";
  }

  const today = getLocalDateString();
  const ordered = [...pending].sort((first, second) => {
    const firstToday = first.date === today ? 0 : 1;
    const secondToday = second.date === today ? 0 : 1;
    return firstToday - secondToday;
  });
  const visible = ordered.slice(0, 3);
  const lines = visible.map((task) => `• ${task.title}${task.date === today ? " — hoje" : ""}`);
  const remaining = pending.length - visible.length;

  return [
    "Encontrei estes próximos passos:",
    ...lines,
    remaining > 0 ? `Há mais ${remaining} ${remaining === 1 ? "tarefa" : "tarefas"} na sua lista.` : "",
    "Você não precisa resolver tudo agora. Escolher uma já pode ser suficiente.",
  ].filter(Boolean).join("\n");
}

function chooseBriefPractice(practices: MindfulnessPractice[]) {
  return [...practices].sort((first, second) => first.durationMinutes - second.durationMinutes || first.sortOrder - second.sortOrder)[0];
}

export async function respondToAlumia(
  message: string,
  history: AlumiaConversationMessage[] = [],
): Promise<AlumiaAssistantResult> {
  const intent = classifyAlumiaIntent(message);

  if (intent === "crisis") {
    return { text: CRISIS_RESPONSE, tone: "safety", source: "editorial" };
  }

  if (intent === "create_task") {
    const title = extractTaskTitle(message);
    if (title) {
      return {
        text: "Posso criar esta tarefa para você. Confira o texto antes de confirmar:",
        tone: "default",
        source: "editorial",
        proposedAction: {
          id: actionId(),
          type: "create_task",
          title,
          priority: null,
          reminder: null,
        },
      };
    }
  }

  if (intent === "tasks") {
    const tasks = await getTasks();
    return {
      text: formatTaskSummary(tasks),
      tone: "default",
      source: "editorial",
      navigation: { label: "Ver todas as tarefas", to: "/tarefas" },
    };
  }

  if (intent === "mindfulness") {
    const practice = chooseBriefPractice(await getMindfulnessPractices());
    if (!practice) {
      return {
        text: "Não encontrei uma prática publicada agora. Podemos tentar novamente mais tarde, sem pressa.",
        tone: "default",
        source: "editorial",
      };
    }
    return {
      text: `Uma opção possível é “${practice.title}”, com cerca de ${practice.durationMinutes} ${practice.durationMinutes === 1 ? "minuto" : "minutos"}. ${practice.description}`,
      tone: "default",
      source: "editorial",
      navigation: { label: "Abrir Mindfulness", to: "/mindfulness" },
    };
  }

  if (isAlumiaGenerativeEnabled()) {
    return requestGenerativeResponse(message, history);
  }

  return {
    text: "Nesta prévia, posso mostrar suas tarefas, sugerir uma pausa de Mindfulness ou preparar uma tarefa para você confirmar. Você pode escrever, por exemplo: “o que merece atenção hoje?”, “quero uma pausa breve” ou “crie uma tarefa comprar pão”.",
    tone: "default",
    source: "editorial",
  };
}

export async function confirmAlumiaAction(action: AlumiaProposedAction) {
  if (action.type !== "create_task") throw new Error("Ação não permitida.");
  return createTask({
    title: action.title,
    description: action.description,
    date: action.date,
    time: action.time,
    priority: action.priority,
    reminder: action.reminder,
    moduleKey: "alumia_ai",
    idempotencyKey: action.id,
  });
}
