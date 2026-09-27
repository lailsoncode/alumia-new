import type { ModuleKey } from "@/lib/module-themes";

/**
 * @file tasks.ts
 * @description Definições de tipos e interfaces para o módulo de tarefas do Alumia.
 */

/**
 * Nível de prioridade de uma tarefa.
 */
export type TaskPriority = "alta" | "media" | "baixa" | null;

/**
 * Tipo de lembrete configurado para a tarefa.
 */
export type TaskReminder = "na_hora" | "5min" | "15min" | "30min" | null;

export type TaskRecurrenceFrequency = "daily" | "weekly";

export interface TaskRecurrenceInput {
  frequency: TaskRecurrenceFrequency;
  weekdays?: number[];
  startsOn: string;
  timezone: string;
}

export interface TaskRecurrence extends TaskRecurrenceInput {
  id: string;
  active: boolean;
}

export type TaskRecurrenceDraft = Pick<TaskRecurrenceInput, "frequency" | "weekdays">;

/**
 * Interface principal representando uma Tarefa no sistema.
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  hasBell?: boolean;
  hasFlag?: boolean;
  priority?: TaskPriority;
  reminder?: TaskReminder;
  moduleKey?: ModuleKey;
  module_key?: ModuleKey;
  /** Deixa o item com fundo destacado (lavanda) */
  highlighted?: boolean;
  done?: boolean;
  completed_at?: string | null;
  postponed_count?: number;
  last_postponed_from?: string | null;
  postponed_at?: string | null;
  recurrence?: TaskRecurrence | null;
  alumia_action_id?: string | null;
}

/**
 * Estrutura de dados recebida ao criar uma nova tarefa.
 */
export interface AddTaskData {
  title: string;
  description?: string;
  priority: TaskPriority;
  reminder: TaskReminder;
  date?: string;
  time?: string;
  moduleKey?: ModuleKey;
  recurrence?: TaskRecurrenceInput;
  idempotencyKey?: string;
}
