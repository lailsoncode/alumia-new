import { createContext } from "react";
import type { User } from "@supabase/supabase-js";
import type { ProfileData } from "@/types";

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  profile: ProfileData | null;
  profileLoading: boolean;
  refreshProfile: () => Promise<ProfileData | null>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
