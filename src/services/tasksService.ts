import { supabase } from "../lib/supabaseClient";
import type { Task, AddTaskData } from "../types";

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

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
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

  const { data, error } = await supabase
    .from("tasks")
    .insert([
      {
        user_id: user.id,
        title: taskData.title,
        description: taskData.description || null,
        date: taskData.date || null,
        time: taskData.time || null,
        priority: taskData.priority || null,
        reminder: taskData.reminder || null,
        done: false,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Atualiza os campos de uma tarefa existente no banco.
 *
 * @param {string} taskId O identificador único da tarefa.
 * @param {Partial<Task>} updates Campos a serem modificados na tarefa.
 * @returns {Promise<Task>} A tarefa atualizada.
 */
export async function updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
  const { data, error } = await supabase
    .from("tasks")
    .update({
      title: updates.title,
      description: updates.description,
      date: updates.date,
      time: updates.time,
      priority: updates.priority,
      reminder: updates.reminder,
      done: updates.done,
    })
    .eq("id", taskId)
    .select()
    .single();

  if (error) throw error;
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
}
