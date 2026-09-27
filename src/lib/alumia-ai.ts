import type { AlumiaIntent } from "@/types";

const crisisSignals = [
  "quero morrer",
  "queria morrer",
  "nao quero viver",
  "tirar minha vida",
  "acabar com minha vida",
  "me matar",
  "me machucar",
  "suicidio",
  "suicida",
];

const taskSignals = ["tarefa", "tarefas", "prioridade", "prioridades", "organizar meu dia", "o que fazer hoje"];
const mindfulnessSignals = [
  "quero uma pausa",
  "preciso de uma pausa",
  "pausa breve",
  "quero respirar",
  "me ajude a respirar",
  "exercicio de respiracao",
  "pratica de respiracao",
  "pratica de mindfulness",
  "quero meditar",
  "preciso me acalmar",
];

export function normalizeAlumiaText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasPossibleCrisisSignal(value: string) {
  const normalized = normalizeAlumiaText(value);
  return crisisSignals.some((signal) => normalized.includes(signal));
}

export function extractTaskTitle(value: string): string | null {
  const trimmed = value.trim();
  const match = trimmed.match(
    /^(?:por favor[,\s]*)?(?:crie|criar|adicione|adicionar|anote|anotar)\s+(?:uma\s+)?tarefa(?:\s+para)?\s*[:-]?\s+(.+)$/i,
  );
  const title = match?.[1]?.trim().replace(/[.!?]+$/, "").trim();
  return title && title.length <= 120 ? title : null;
}

export function classifyAlumiaIntent(value: string): AlumiaIntent {
  if (hasPossibleCrisisSignal(value)) return "crisis";
  if (extractTaskTitle(value)) return "create_task";

  const normalized = normalizeAlumiaText(value);
  if (taskSignals.some((signal) => normalized.includes(signal))) return "tasks";
  if (mindfulnessSignals.some((signal) => normalized.includes(signal))) return "mindfulness";
  return "capabilities";
}
