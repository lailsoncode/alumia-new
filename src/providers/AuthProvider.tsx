import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { AuthContext, type AuthContextValue } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabaseClient";
import { getUserProfile } from "@/services/authService";
import type { ProfileData } from "@/types";

interface ProfileState {
  userId: string | null;
  data: ProfileData | null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileState, setProfileState] = useState<ProfileState>({ userId: null, data: null });
  const userId = user?.id ?? null;

  useEffect(() => {
    let active = true;
    let authEventReceived = false;

    supabase.auth.getSession()
      .then(({ data }) => {
        if (!active || authEventReceived) return;
        setUser(data.session?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erro ao recuperar sessão:", error);
        if (active && !authEventReceived) setLoading(false);
      });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      authEventReceived = true;
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setLoading(false);
      if (!nextUser) setProfileState({ userId: null, data: null });
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!userId) return () => { active = false; };

    getUserProfile(userId)
      .then((profile) => {
        if (active) setProfileState({ userId, data: profile });
      })
      .catch((error) => {
        console.error("Erro ao carregar perfil:", error);
        if (active) setProfileState({ userId, data: null });
      });

    return () => { active = false; };
  }, [userId]);

  const refreshProfile = useCallback(async () => {
    if (!userId) {
      setProfileState({ userId: null, data: null });
      return null;
    }

    const profile = await getUserProfile(userId);
    setProfileState({ userId, data: profile });
    return profile;
  }, [userId]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    profile: profileState.userId === userId ? profileState.data : null,
    profileLoading: Boolean(userId && profileState.userId !== userId),
    refreshProfile,
  }), [loading, profileState, refreshProfile, user, userId]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
