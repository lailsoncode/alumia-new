import { supabase } from "../lib/supabaseClient";

/**
 * @file hydrationService.ts
 * @description Serviço responsável pelas chamadas de API e Supabase relacionadas ao módulo de hidratação.
 */

/**
 * Busca o total de água consumida (em mL) pelo usuário autenticado na data informada.
 *
 * @param {string} dateStr A data de interesse no formato YYYY-MM-DD.
 * @returns {Promise<number>} O total de mL ingerido ou 0 caso não autenticado/sem registros.
 */
export async function getTodayHydration(dateStr: string): Promise<number> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const user = sessionData.session?.user;
  if (!user) return 0;

  const { data, error } = await supabase
    .from("hydration_logs")
    .select("amount_ml")
    .eq("user_id", user.id)
    .eq("date", dateStr);

  if (error) throw error;

  const total = data?.reduce((acc, curr) => acc + curr.amount_ml, 0) ?? 0;
  return total;
}

/**
 * Registra uma nova ingestão de água no banco de dados.
 *
 * @param {number} amountMl Quantidade de água ingerida em mL.
 * @param {string} dateStr A data do registro no formato YYYY-MM-DD.
 * @returns {Promise<void>} Promessa resolvida após inserção com sucesso.
 */
export async function logWaterIntake(amountMl: number, dateStr: string): Promise<void> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const user = sessionData.session?.user;
  if (!user) throw new Error("Usuário não autenticado.");

  const { error } = await supabase
    .from("hydration_logs")
    .insert([
      {
        user_id: user.id,
        amount_ml: amountMl,
        date: dateStr,
      },
    ]);

  if (error) throw error;
}

/**
 * Remove a última entrada de água realizada pelo usuário autenticado na data informada.
 * Funciona como mecanismo de desfazer (Undo).
 *
 * @param {string} dateStr A data de interesse no formato YYYY-MM-DD.
 * @returns {Promise<void>} Promessa resolvida após exclusão bem-sucedida.
 */
export async function undoLastWaterLog(dateStr: string): Promise<void> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  const user = sessionData.session?.user;
  if (!user) throw new Error("Usuário não autenticado.");

  // Busca o último log do usuário no dia correspondente
  const { data, error: fetchError } = await supabase
    .from("hydration_logs")
    .select("id")
    .eq("user_id", user.id)
    .eq("date", dateStr)
    .order("created_at", { ascending: false })
    .limit(1);

  if (fetchError) throw fetchError;

  if (data && data.length > 0) {
    const { error: deleteError } = await supabase
      .from("hydration_logs")
      .delete()
      .eq("id", data[0].id);

    if (deleteError) throw deleteError;
  }
}
