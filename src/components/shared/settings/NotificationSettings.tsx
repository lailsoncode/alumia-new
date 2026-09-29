import { useEffect, useRef, useState } from "react";
import { BellIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { SectionHeader, Surface } from "@/components/ui/surface";
import { enablePushNotifications, getPushNotificationState, isOneSignalConfigured } from "@/services/oneSignalService";
import { getTasks } from "@/services/tasksService";
import { synchronizeTaskReminders } from "@/services/taskReminderService";
import { synchronizeHydrationReminders } from "@/services/hydrationReminderService";
import {
  getNotificationSoundFile,
  getStoredNotificationPreferences,
  NOTIFICATION_SOUND_OPTIONS,
  saveNotificationPreferences,
  type NotificationPreferences,
  type NotificationSound,
} from "@/services/notificationPreferencesService";
import { PreferenceSwitch } from "./PreferenceSwitch";
import { SettingsRow } from "./SettingsRow";

type NotificationStatus = "loading" | "ready" | "saving" | "denied" | "unsupported" | "unconfigured" | "error";
type SoundPreferenceStatus = "idle" | "saving" | "saved" | "error";

function SoundPreference({ label, description, value, onChange }: {
  label: string;
  description: string;
  value: NotificationSound;
  onChange: (sound: NotificationSound) => void;
}) {
  const selectedOption = NOTIFICATION_SOUND_OPTIONS.find((option) => option.value === value);
  const previewSound = () => {
    const soundFile = getNotificationSoundFile(value);
    if (!soundFile) return;
    const audio = new Audio(`/sounds/${soundFile}`);
    audio.volume = 0.75;
    void audio.play().catch(() => undefined);
  };

  return (
    <div className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:px-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
        {selectedOption && <p className="mt-1 text-xs text-muted-foreground/80">{selectedOption.description}</p>}
      </div>
      <div className="flex items-center gap-2">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as NotificationSound)}
          aria-label={label}
          className="min-h-11 min-w-0 flex-1 rounded-xl border border-input bg-background px-3 text-sm font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 sm:w-52"
        >
          {NOTIFICATION_SOUND_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <Button type="button" variant="outline" size="sm" onClick={previewSound} disabled={value === "device"} aria-label={`Ouvir ${label.toLowerCase()}`}>
          Ouvir
        </Button>
      </div>
    </div>
  );
}

export function NotificationSettings() {
  const [enabled, setEnabled] = useState(false);
  const [status, setStatus] = useState<NotificationStatus>(isOneSignalConfigured() ? "loading" : "unconfigured");
  const [preferences, setPreferences] = useState<NotificationPreferences>(getStoredNotificationPreferences);
  const [soundStatus, setSoundStatus] = useState<SoundPreferenceStatus>("idle");
  const rescheduleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkNotificationState = () => {
    if (!isOneSignalConfigured()) {
      setStatus("unconfigured");
      return Promise.resolve();
    }
    setStatus("loading");
    return getPushNotificationState()
      .then((state) => {
        setEnabled(state.enabled);
        setStatus(state.supported ? "ready" : "unsupported");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(() => {
    let active = true;
    if (!isOneSignalConfigured()) {
      setStatus("unconfigured");
      return () => { active = false; };
    }
    getPushNotificationState()
      .then((state) => {
        if (!active) return;
        setEnabled(state.enabled);
        setStatus(state.supported ? "ready" : "unsupported");
      })
      .catch(() => { if (active) setStatus("error"); });
    return () => {
      active = false;
      if (rescheduleTimer.current) clearTimeout(rescheduleTimer.current);
    };
  }, []);

  const enableNotifications = async () => {
    if (status === "saving" || status === "loading") return;
    setStatus("saving");
    try {
      const state = await enablePushNotifications();
      setEnabled(state.enabled);
      if (!state.supported) setStatus("unsupported");
      else if (!state.permission) setStatus("denied");
      else {
        setStatus("ready");
        await Promise.allSettled([getTasks().then(synchronizeTaskReminders), synchronizeHydrationReminders()]);
      }
    } catch {
      setStatus("error");
    }
  };

  const updateSoundPreferences = (updates: Partial<NotificationPreferences>) => {
    setPreferences((current) => {
      const next = { ...current, ...updates };
      saveNotificationPreferences(next);
      return next;
    });
    setSoundStatus("saving");
    if (rescheduleTimer.current) clearTimeout(rescheduleTimer.current);
    rescheduleTimer.current = setTimeout(() => {
      void Promise.all([getTasks().then(synchronizeTaskReminders), synchronizeHydrationReminders()])
        .then(() => setSoundStatus("saved"))
        .catch(() => setSoundStatus("error"));
    }, 450);
  };

  const statusDescription = {
    loading: "Verificando a permissão deste dispositivo…",
    saving: "Solicitando permissão ao sistema…",
    ready: enabled ? "Avisos de tarefas, cuidados e lembretes estão disponíveis." : "Ative para receber avisos neste dispositivo.",
    denied: "A permissão foi bloqueada. Libere as notificações nas configurações do dispositivo.",
    unsupported: "Este dispositivo ou navegador não oferece suporte a notificações.",
    unconfigured: "As notificações ainda não estão configuradas neste ambiente.",
    error: "Não foi possível verificar a permissão agora.",
  }[status];

  return (
    <section>
      <SectionHeader icon={BellIcon} iconClassName="text-primary" title="Notificações e lembretes" description="Preferências deste dispositivo para avisos, sons e lembretes." />
      <Surface className="mt-2.5 divide-y divide-border overflow-hidden">
        <SettingsRow title="Permissão de notificações" description={statusDescription} icon={BellIcon}>
          {enabled && status === "ready" ? (
            <span className="inline-flex min-h-8 items-center rounded-full bg-success/15 px-3 text-xs font-semibold text-success-foreground">Ativadas</span>
          ) : status === "error" ? (
            <Button type="button" size="sm" variant="outline" onClick={() => void checkNotificationState()}>Tentar novamente</Button>
          ) : (
            <Button type="button" size="sm" onClick={() => void enableNotifications()} disabled={["loading", "saving", "unsupported", "unconfigured", "denied"].includes(status)}>
              {status === "saving" ? "Ativando…" : "Ativar"}
            </Button>
          )}
        </SettingsRow>
        <div className="bg-surface-subtle/50 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground sm:px-4">
          Avisos de tarefas chegam no horário marcado. Lembretes antecipados, de hidratação e de pausas podem usar outro som.
        </div>
        <SoundPreference label="Som das notificações" description="Usado no horário da tarefa e em outros avisos locais." value={preferences.notificationSound} onChange={(notificationSound) => updateSoundPreferences({ notificationSound })} />
        <SettingsRow title="Mesmo som nos lembretes" description="Use um único toque para avisos e lembretes.">
          <PreferenceSwitch checked={preferences.useSameSoundForReminders} onCheckedChange={(useSameSoundForReminders) => updateSoundPreferences({ useSameSoundForReminders })} label="Usar o mesmo som nos lembretes" />
        </SettingsRow>
        {!preferences.useSameSoundForReminders && (
          <SoundPreference label="Som dos lembretes" description="Usado antes da tarefa e nos lembretes recorrentes." value={preferences.reminderSound} onChange={(reminderSound) => updateSoundPreferences({ reminderSound })} />
        )}
        <p className="px-3 py-2 text-xs text-muted-foreground sm:px-4" role="status" aria-live="polite">
          {soundStatus === "saving" && "Atualizando os próximos avisos…"}
          {soundStatus === "saved" && "Preferências salvas neste dispositivo."}
          {soundStatus === "error" && "A preferência foi salva, mas alguns avisos não puderam ser reagendados agora."}
          {soundStatus === "idle" && "O padrão do dispositivo respeita volume, modo silencioso e regras do sistema."}
        </p>
      </Surface>
    </section>
  );
}

