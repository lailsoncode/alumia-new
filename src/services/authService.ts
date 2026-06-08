import { supabase } from "../lib/supabaseClient";
import type { LoginData, RegisterData, ProfileData } from "../types";

/**
 * @file authService.ts
 * @description Serviço de autenticação usando o Supabase Auth.
 * Todas as chamadas de login, registro, logout e recuperação de senha estão aqui.
 */

/**
 * Realiza login com email e senha.
 *
 * @param {LoginData} data - Email e senha do usuário.
 * @returns A sessão autenticada ou lança um erro.
 */
export async function signInWithEmail({ email, password }: LoginData) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

/**
 * Registra um novo usuário com email e senha.
 *
 * @param {Pick<RegisterData, 'email' | 'password'>} data - Email e senha.
 * @returns O usuário criado ou lança um erro.
 */
export async function signUpWithEmail({
  email,
  password,
}: Pick<RegisterData, "email" | "password">) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

/**
 * Inicia o fluxo de autenticação OAuth com o Google.
 * Redireciona o usuário para a página de consentimento do Google.
 */
export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });
  if (error) throw error;
}

/**
 * Encerra a sessão atual do usuário.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Envia um email de recuperação de senha para o endereço informado.
 *
 * @param {string} email - Email do usuário que esqueceu a senha.
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/nova-senha`,
  });
  if (error) throw error;
}

/**
 * Retorna a sessão ativa atual do usuário, se existir.
 */
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * Atualiza os dados de perfil do usuário na tabela `profiles`.
 *
 * @param {string} userId - O ID do usuário (correspondente a auth.users.id).
 * @param {Partial<ProfileData>} data - Os campos do perfil a serem atualizados.
 */
export async function updateUserProfile(userId: string, data: Partial<ProfileData>) {
  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    first_name: data.firstName,
    last_name: data.lastName,
    bio: data.bio,
    goals: data.goals,
    avatar_url: data.avatarUrl,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

/**
 * Recupera os dados do perfil de um usuário pelo ID.
 *
 * @param {string} userId - O ID do usuário.
 * @returns {Promise<ProfileData | null>} Os dados do perfil ou null se não encontrado.
 */
export async function getUserProfile(userId: string): Promise<ProfileData | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();

  if (error) {
    if (error.code === "PGRST116") return null; // Registro não encontrado
    throw error;
  }

  return {
    firstName: data.first_name || "",
    lastName: data.last_name || "",
    bio: data.bio || "",
    goals: data.goals || "",
    avatarUrl: data.avatar_url || "",
  };
}

/**
 * Atualiza a senha do usuário autenticado atual.
 *
 * @param {string} newPassword - A nova senha.
 */
export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data;
}
