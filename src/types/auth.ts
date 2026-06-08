/**
 * @file auth.ts
 * @description Definições de tipos para autenticação e perfil de usuário.
 */

/**
 * Representa o usuário autenticado retornado pelo Supabase Auth.
 */
export interface AuthUser {
  id: string;
  email: string | undefined;
  displayName?: string;
  avatarUrl?: string;
}

/**
 * Dados necessários para realizar login por email e senha.
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Dados necessários para criar uma nova conta por email e senha.
 */
export interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
}

/**
 * Dados de perfil do usuário coletados na etapa de onboarding pós-cadastro.
 */
export interface ProfileData {
  firstName: string;
  lastName: string;
  bio: string;
  goals: string;
  avatarUrl?: string;
}

/**
 * Estado de autenticação retornado pelo hook useAuth.
 */
export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
}
