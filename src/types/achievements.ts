export type AchievementId =
  | "inicio"
  | "beta"
  | "primeiro-passo"
  | "me-escutei"
  | "dia-interno"
  | "acolhi-alguem"
  | "silencio-frutifero"
  | "lua-cuidando"
  | "deitei-com-carinho"
  | "gole-de-vida"
  | "colheita-do-dia"
  | "pagina-virada"
  | "passinho-sertanejo"
  | "se-achegue";

export interface AchievementActivity {
  accountCreatedAt: string;
  originalAccountCreatedAt: string;
  completedTasks: Array<{ completedAt: string | null; createdAt: string; moduleKey: string | null }>;
  checkins: Array<{ occurredAt: string; needCode: string | null; moodCategory: string }>;
  hydration: Array<{ createdAt: string; date: string; amountMl: number }>;
  mindfulness: Array<{ startedAt: string; practiceCode: string; reflection: string | null; endedEarly: boolean }>;
  study: Array<{ startedAt: string; outcome: string | null }>;
}

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  invitation: string;
  imageUrl: string;
  wallpaperUrl: string;
  earned: boolean;
  earnedAt: string | null;
}
