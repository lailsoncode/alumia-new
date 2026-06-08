import {
  Robot01Icon,
  ClipboardListIcon,
  SmileIcon,
  AiBrain01Icon,
  GlassWaterIcon,
  BookOpenIcon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import type { Task, ModuleCardData, AvailableModule } from "../types";

/**
 * @file mockData.ts
 * @description Dados estáticos (mock) para tarefas e módulos, utilizados no ambiente de desenvolvimento local.
 */

// ──────────────────────────────────────────────
// MOCK DATA: TAREFAS
// ──────────────────────────────────────────────

export const importantTasksMock: Task[] = [
  {
    id: "i1",
    title: "Medicação TDAH",
    date: "10 jan.",
    time: "09:00",
    hasBell: true,
    hasFlag: true,
  },
  {
    id: "i2",
    title: "Terminar edição de tarefas",
    date: "10 jan.",
    time: "10:07",
    hasBell: true,
    hasFlag: true,
  },
  {
    id: "i3",
    title: "Lista BDII",
    date: "10 jan.",
    time: "11:00",
    hasBell: true,
    hasFlag: true,
    highlighted: true,
  },
  {
    id: "i4",
    title: "Atualizar Linkedin",
    date: "10 jan.",
    time: "22:00",
    hasBell: true,
    hasFlag: true,
  },
];

export const scheduledTasksMock: Task[] = [
  { id: "s1", title: "Medicação TAG", date: "Diária", time: "13:00", hasBell: true },
  { id: "s2", title: "Corrigir alterar tarefas", date: "10 jan.", time: "21:00", hasBell: true },
];

export const backlogTasksMock: Task[] = [
  { id: "b1", title: "Liberar computador de essinho" },
  {
    id: "b2",
    title:
      "Ouça uma música calma, da sua preferência, e deixe que ela te envolva por alguns instantes.",
    highlighted: true,
  },
];

export const upcomingTasksMock: Task[] = [
  { id: "u1", title: "Reunião de retrospectiva", date: "15 jan.", time: "14:00", hasFlag: true },
  {
    id: "u2",
    title: "Entrega do projeto final",
    date: "20 jan.",
    time: "23:59",
    hasBell: true,
    hasFlag: true,
  },
  { id: "u3", title: "Consulta médica", date: "22 jan.", time: "10:30", hasBell: true },
  { id: "u4", title: "Renovar assinatura do Notion", date: "25 jan." },
];

// ──────────────────────────────────────────────
// MOCK DATA: MÓDULOS DE BEM-ESTAR
// ──────────────────────────────────────────────

export const activeModulesMock: ModuleCardData[] = [
  {
    id: "alumia",
    name: "ALUM.iA",
    description: "Organize sua rotina com a IA da Alumia",
    icon: Robot01Icon,
    tone: "tone-mint",
    pro: true,
  },
  {
    id: "tasks",
    name: "Tarefas",
    description: "Organize as tarefas do seu dia",
    icon: ClipboardListIcon,
    tone: "tone-sky",
  },
  {
    id: "checkin",
    name: "Check-in",
    description: "Como está se sentindo hoje?",
    icon: SmileIcon,
    tone: "tone-lavender",
  },
  {
    id: "mindfulness",
    name: "Mindfulness",
    description: "Aprenda a respirar e silenciar com leveza",
    icon: AiBrain01Icon,
    tone: "tone-mint",
  },
  {
    id: "hydration",
    name: "Hidratação",
    description: "Pausas para hidratação e cuidado",
    icon: GlassWaterIcon,
    tone: "tone-sky",
  },
  {
    id: "student",
    name: "Estudante",
    description: "Organize sua vida estudantil",
    icon: BookOpenIcon,
    tone: "tone-lavender",
  },
];

export const initialAvailableModulesMock: AvailableModule[] = [
  { id: "alumia", name: "ALUM.iA", icon: Robot01Icon, tone: "tone-mint", enabled: true, pro: true },
  { id: "tasks", name: "Tarefas", icon: ClipboardListIcon, tone: "tone-sky", enabled: true },
  {
    id: "checkin",
    name: "Check-in Emocional",
    icon: SmileIcon,
    tone: "tone-lavender",
    enabled: true,
  },
  { id: "mindfulness", name: "Mindfulness", icon: AiBrain01Icon, tone: "tone-mint", enabled: true },
  { id: "hydration", name: "Hidratação", icon: GlassWaterIcon, tone: "tone-sky", enabled: true },
  {
    id: "student",
    name: "Estudante - WIP",
    icon: BookOpenIcon,
    tone: "tone-lavender",
    enabled: true,
  },
  { id: "pro", name: "PRO", icon: StarIcon, tone: "tone-sun", enabled: false },
];
