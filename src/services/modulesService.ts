import { supabase } from "../lib/supabaseClient";
import { ClipboardListIcon } from "@hugeicons/core-free-icons";
import type { AvailableModule } from "../types";

/**
 * @file modulesService.ts
 * @description Serviço responsável pela gestão de ativação e consulta de módulos de bem-estar.
 */

/**
 * Busca todos os módulos e seus estados de ativação (habilitado/desabilitado) para o usuário autenticado.
 *
 * @returns {Promise<AvailableModule[]>} Uma promessa contendo a lista de módulos configurados.
 */
export async function getUserModules(): Promise<AvailableModule[]> {
  // TODO: Implementar consulta ao Supabase de preferência do usuário ou junção com catálogo:
  // const { data, error } = await supabase.from("user_modules").select("*");
  // if (error) throw error;
  // return data;
  return [];
}

/**
 * Altera o estado (ativo/inativo) de um determinado módulo para o usuário logado.
 *
 * @param {string} moduleId ID do módulo (ex: 'hydration', 'mindfulness').
 * @param {boolean} enabled Define se o módulo deve ser ativado (true) ou desativado (false).
 * @returns {Promise<AvailableModule>} O registro atualizado do módulo.
 */
export async function toggleUserModule(
  moduleId: string,
  enabled: boolean,
): Promise<AvailableModule> {
  // TODO: Implementar atualização na tabela user_modules do Supabase
  // const { data, error } = await supabase.from("user_modules").update({ enabled }).eq("module_id", moduleId).select().single();
  // if (error) throw error;
  // return data;
  return {
    id: moduleId,
    name: "",
    icon: ClipboardListIcon,
    tone: "",
    enabled,
  };
}
