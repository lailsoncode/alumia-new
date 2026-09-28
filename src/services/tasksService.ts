import { supabase } from "../lib/supabaseClient";
import { getLocalDateString } from "../lib/utils";
import { getIsoWeekday, getNextRecurrenceDate } from "../lib/tasks";
import type { Task, AddTaskData, TaskRecurrence } from "../types";
import { cancelTaskReminder, scheduleTaskReminder } from "./taskReminderService";
import { notifyAchievementActivity } from "./achievementService";

type TaskUpdates = Omit<Partial<Task>, "date" | "time"> & {
  date?: string | null;
  time?: string | null;
};

/**
 * @file tasksService.ts
 * @description Serviço responsável pelas chamadas de API e Supabase relacionadas ao módulo de tarefas.
 */

/**
 * Busca todas as tarefas do usuário autenticado no banco de dados.
 *
 * @returns {Promise<Task[]>} Uma promessa que resolve em um array de tarefas.
 */
export async function getTasks(): Promise<Task[]> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const user = sessionData.session?.user;
  if (!user) return [];

  const { data: rolledRows, error: rolloverError } = await supabase.rpc("rollover_overdue_tasks", { p_today: getLocalDateString() });
  if (rolloverError) throw rolloverError;

  const { data, error } = await supabase
    .from("tasks")
    .select("*, recurrence:task_recurrence_rules(id, frequency, weekdays, starts_on, timezone, active)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw error;
  const tasks = (data || []).map((row) => {
    const recurrenceRow = Array.isArray(row.recurrence) ? row.recurrence[0] : row.recurrence;
    return {
      ...row,
      recurrence: recurrenceRow ? {
        id: recurrenceRow.id,
        frequency: recurrenceRow.frequency,
        weekdays: recurrenceRow.weekdays ?? undefined,
        startsOn: recurrenceRow.starts_on,
        timezone: recurrenceRow.timezone,
        active: recurrenceRow.active,
      } as TaskRecurrence : null,
    } as Task;
  });
  const rolledTaskIds = new Set((rolledRows ?? []).map((row: { task_id: string }) => row.task_id));
  await Promise.allSettled(tasks.filter((task) => rolledTaskIds.has(task.id)).map((task) => scheduleTaskReminder(task)));
  return tasks;
}

/**
 * Cria uma nova tarefa na base de dados para o usuário autenticado.
 *
 * @param {AddTaskData} taskData Os dados da nova tarefa a ser inserida.
 * @returns {Promise<Task>} A tarefa recém-criada retornada pelo banco.
 */
export async function createTask(taskData: AddTaskData): Promise<Task> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const user = sessionData.session?.user;
  if (!user) throw new Error("Usuário não autenticado.");
  if (taskData.reminder && (!taskData.date || !taskData.time)) {
    throw new Error("Lembretes precisam de data e horário.");
  }
  if (taskData.recurrence && !taskData.date) {
    throw new Error("Recorrências precisam de uma data inicial.");
  }
  if (taskData.recurrence?.frequency === "weekly" && !taskData.recurrence.weekdays?.length) {
    throw new Error("Escolha pelo menos um dia para a recorrência semanal.");
  }
  let scheduledDate = taskData.date;
  if (scheduledDate && taskData.recurrence?.frequency === "weekly") {
    const selectedDate = new Date(`${scheduledDate}T00:00:00`);
    if (!taskData.recurrence.weekdays?.includes(getIsoWeekday(selectedDate))) {
      scheduledDate = getNextRecurrenceDate(scheduledDate, "weekly", taskData.recurrence.weekdays);
    }
  }

  const taskPayload = {
    user_id: user.id,
    title: taskData.title,
    description: taskData.description || null,
    date: scheduledDate || null,
    time: taskData.time || null,
    priority: taskData.priority || null,
    reminder: taskData.reminder || null,
    module_key: taskData.moduleKey ?? "tasks",
    done: false,
  };

  const { data, error } = taskData.idempotencyKey
    ? await supabase.rpc("create_alumia_task_once", {
        p_action_id: taskData.idempotencyKey,
        p_title: taskPayload.title,
        p_description: taskPayload.description,
        p_date: taskPayload.date,
        p_time: taskPayload.time,
        p_priority: taskPayload.priority,
        p_reminder: taskPayload.reminder,
      })
    : await supabase.from("tasks").insert([taskPayload]).select().single();

  if (error) throw error;
  if (taskData.recurrence) {
    const { error: recurrenceError } = await supabase.from("task_recurrence_rules").insert({
      task_id: data.id,
      user_id: user.id,
      frequency: taskData.recurrence.frequency,
      weekdays: taskData.recurrence.frequency === "weekly" ? taskData.recurrence.weekdays : null,
      starts_on: scheduledDate,
      timezone: taskData.recurrence.timezone,
    });
    if (recurrenceError) {
      await supabase.from("tasks").delete().eq("id", data.id);
      throw recurrenceError;
    }
    data.recurrence = { id: "pending", active: true, ...taskData.recurrence, startsOn: scheduledDate as string };
  }
  await scheduleTaskReminder(data, Boolean(taskData.reminder)).catch((scheduleError) => {
    console.error("Não foi possível agendar o lembrete local:", scheduleError);
  });
  return data;
}

/**
 * Atualiza os campos de uma tarefa existente no banco.
 *
 * @param {string} taskId O identificador único da tarefa.
 * @param {Partial<Task>} updates Campos a serem modificados na tarefa.
 * @returns {Promise<Task>} A tarefa atualizada.
 */
export async function updateTask(taskId: string, updates: TaskUpdates): Promise<Task> {
  if (updates.done === true) {
    const { data, error } = await supabase.rpc("complete_task_and_schedule_next", { p_task_id: taskId });
    if (error) throw error;
    const completed = (Array.isArray(data) ? data[0] : data) as Task | null;
    if (!completed) throw new Error("A tarefa não foi encontrada.");
    await cancelTaskReminder(taskId).catch((scheduleError) => {
      console.error("Não foi possível remover o lembrete concluído:", scheduleError);
    });
    notifyAchievementActivity();
    return completed;
  }
  const { data, error } = await supabase
    .from("tasks")
    .update({
      title: updates.title,
      description: updates.description,
      date: updates.date,
      time: updates.time,
      priority: updates.priority,
      reminder: updates.reminder,
      module_key: updates.moduleKey ?? updates.module_key,
      done: updates.done,
      completed_at: updates.done === undefined ? undefined : null,
    })
    .eq("id", taskId)
    .select()
    .single();

  if (error) throw error;
  await scheduleTaskReminder(data).catch((scheduleError) => {
    console.error("Não foi possível atualizar o lembrete local:", scheduleError);
  });
  return data;
}

/**
 * Remove permanentemente uma tarefa do banco de dados.
 *
 * @param {string} taskId O identificador único da tarefa a ser removida.
 * @returns {Promise<void>} Uma promessa vazia indicando o sucesso da deleção.
 */
export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw error;
  await cancelTaskReminder(taskId).catch((scheduleError) => {
    console.error("Não foi possível remover o lembrete local:", scheduleError);
  });
}
