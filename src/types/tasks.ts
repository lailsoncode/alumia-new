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
  /** Deixa o item com fundo destacado (lavanda) */
  highlighted?: boolean;
  done?: boolean;
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
}
