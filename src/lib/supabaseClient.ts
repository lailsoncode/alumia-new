import { createClient } from "@supabase/supabase-js";

/**
 * URL do projeto Supabase obtida das variáveis de ambiente.
 */
const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL || "";

/**
 * Chave anônima (anon key) do Supabase obtida das variáveis de ambiente.
 */
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

/**
 * Cliente Supabase inicializado e pronto para uso em todo o aplicativo.
 * Responsável pelas chamadas de autenticação, base de dados (PostgreSQL) e tempo real.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
