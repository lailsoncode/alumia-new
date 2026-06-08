import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabaseClient";

/**
 * @file use-auth.tsx
 * @description Hook para gerenciar o estado de autenticação do usuário.
 * Escuta mudanças de sessão em tempo real via Supabase Auth.
 */

interface UseAuthReturn {
  /** Usuário autenticado, ou null se não logado. */
  user: User | null;
  /** true enquanto o estado de auth está sendo carregado. */
  loading: boolean;
}

/**
 * useAuth — Hook de autenticação global.
 * Escuta `onAuthStateChange` do Supabase e atualiza o estado em tempo real.
 *
 * @returns {{ user: User | null, loading: boolean }}
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Recupera a sessão inicial ao montar o componente
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Escuta mudanças de sessão em tempo real (login, logout, refresh de token)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, loading };
}
