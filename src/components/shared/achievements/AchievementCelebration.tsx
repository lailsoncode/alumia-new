import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AchievementDialog } from "./AchievementDialog";
import { ACHIEVEMENT_ACTIVITY_EVENT, getAchievements } from "@/services/achievementService";
import type { Achievement, AchievementId } from "@/types/achievements";
import { ACHIEVEMENT_CYCLE } from "@/lib/achievement-cycle";

function storageKey(userId: string) {
  return `alumia:seen-achievements:${ACHIEVEMENT_CYCLE.id}:${userId}`;
}

export function AchievementCelebration() {
  const { user } = useAuth();
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const initialized = useRef(false);

  const readSeen = useCallback(() => {
    if (!user) return new Set<AchievementId>();
    try {
      return new Set<AchievementId>(JSON.parse(window.localStorage.getItem(storageKey(user.id)) || "[]"));
    } catch {
      return new Set<AchievementId>();
    }
  }, [user]);

  const writeSeen = useCallback((seen: Set<AchievementId>) => {
    if (user) window.localStorage.setItem(storageKey(user.id), JSON.stringify([...seen]));
  }, [user]);

  const refresh = useCallback(async (celebrate: boolean) => {
    if (!user) return;
    const achievements = await getAchievements();
    const earned = achievements.filter((item) => item.earned);
    const seen = readSeen();

    if (!initialized.current || !celebrate) {
      earned.forEach((item) => seen.add(item.id));
      writeSeen(seen);
      initialized.current = true;
      return;
    }

    const newlyEarned = earned.find((item) => !seen.has(item.id));
    if (newlyEarned) {
      seen.add(newlyEarned.id);
      writeSeen(seen);
      setAchievement(newlyEarned);
    }
  }, [readSeen, user, writeSeen]);

  useEffect(() => {
    initialized.current = false;
    void refresh(false).catch(() => undefined);
  }, [refresh, user?.id]);

  useEffect(() => {
    const handleActivity = () => void refresh(true).catch(() => undefined);
    window.addEventListener(ACHIEVEMENT_ACTIVITY_EVENT, handleActivity);
    return () => window.removeEventListener(ACHIEVEMENT_ACTIVITY_EVENT, handleActivity);
  }, [refresh]);

  return <AchievementDialog achievement={achievement} open={Boolean(achievement)} onOpenChange={(open) => !open && setAchievement(null)} celebration />;
}
