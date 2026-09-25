import {
  AiBookIcon,
  AiBrain01Icon,
  CheckListIcon,
  GlassWaterIcon,
  SmileIcon,
  Yoga01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

export type ModuleKey = "alumia_ai" | "tasks" | "checkin" | "mindfulness" | "hydration" | "student";

interface ModuleTheme {
  key: ModuleKey;
  label: string;
  icon: IconSvgElement;
  themeClass: string;
}

export const MODULE_THEMES: Record<ModuleKey, ModuleTheme> = {
  alumia_ai: { key: "alumia_ai", label: "Alum.IA", icon: AiBrain01Icon, themeClass: "module-theme-alumia-ai" },
  tasks: { key: "tasks", label: "Tarefas", icon: CheckListIcon, themeClass: "module-theme-tasks" },
  checkin: { key: "checkin", label: "Check-in emocional", icon: SmileIcon, themeClass: "module-theme-checkin" },
  mindfulness: { key: "mindfulness", label: "Mindfulness", icon: Yoga01Icon, themeClass: "module-theme-mindfulness" },
  hydration: { key: "hydration", label: "Hidratação", icon: GlassWaterIcon, themeClass: "module-theme-hydration" },
  student: { key: "student", label: "Estudante", icon: AiBookIcon, themeClass: "module-theme-student" },
};

export function resolveModuleKey(value?: string | null): ModuleKey {
  return value && value in MODULE_THEMES ? value as ModuleKey : "tasks";
}
