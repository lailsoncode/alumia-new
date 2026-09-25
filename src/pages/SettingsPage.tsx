import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AccessibilityIcon, BellIcon, ChevronRightIcon, GlobeIcon, LockIcon, Logout01Icon, Moon01Icon, Settings01Icon, Sun01Icon, UserIcon } from "@hugeicons/core-free-icons";
import { AppShell } from "@/components/layout";
import { Greeting } from "@/components/shared/Greeting";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { SectionHeader, Surface } from "@/components/ui/surface";
import { useAuth } from "@/hooks/use-auth";
import { getUserProfile, signOut } from "@/services/authService";
import { applyTheme, getStoredTheme, subscribeToThemeChanges } from "@/lib/theme";
import type { ProfileData } from "@/types";

function PreferenceSwitch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={onChange} className={`relative flex h-11 w-14 shrink-0 items-center rounded-full p-1 transition-colors ${checked ? "bg-primary" : "bg-muted"}`}>
      <span className={`h-6 w-6 rounded-full bg-surface shadow-sm transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [language, setLanguage] = useState("pt-BR");

  useEffect(() => {
    if (user) getUserProfile(user.id).then(setProfile).catch((error) => console.error("Erro ao obter perfil:", error));
  }, [user]);

  useEffect(() => {
    const nextDark = getStoredTheme() === "dark";
    setDarkMode(nextDark);
    applyTheme(nextDark ? "dark" : "light");
    setNotifications(window.localStorage.getItem("notifications-enabled") === "true");
    setLanguage(window.localStorage.getItem("language") || "pt-BR");
    return subscribeToThemeChanges((theme) => setDarkMode(theme === "dark"));
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    applyTheme(next ? "dark" : "light");
  };

  const toggleNotifications = () => {
    const next = !notifications;
    setNotifications(next);
    window.localStorage.setItem("notifications-enabled", String(next));
  };

  const logout = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  const name = profile?.firstName ? `${profile.firstName} ${profile.lastName}`.trim() : user?.email?.split("@")[0] || "Seu perfil";

  return (
    <AppShell>
      <div className="space-y-7">
        <Greeting role="Sua conta, suas preferências e sua privacidade." />

        <section>
          <SectionHeader icon={UserIcon} iconClassName="text-tone-mint-fg" title="Perfil" description="As informações que ajudam a Alumia a receber você do seu jeito." />
          <Surface className="mt-4 p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-tone-mint text-xl font-bold text-tone-mint-fg">
                {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="Foto de perfil" className="h-full w-full object-cover" /> : name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1"><h2 className="truncate text-xl font-semibold">{name}</h2><p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>{profile?.goals && <p className="mt-3 text-sm leading-relaxed text-foreground">{profile.goals}</p>}</div>
              <Button variant="outline" onClick={() => navigate({ to: "/completar-perfil" })}><AlumiaIcon icon={UserIcon} size="sm" />Editar perfil</Button>
            </div>
          </Surface>
        </section>

        <section>
          <SectionHeader icon={Settings01Icon} iconClassName="text-tone-lavender-fg" title="Preferências" description="Ajuste a Alumia para ficar confortável para você." />
          <Surface className="mt-4 divide-y divide-border overflow-hidden">
            <div className="flex min-h-20 items-center gap-4 px-4 py-3 sm:px-5">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <AlumiaIcon icon={BellIcon} size="md" className="mt-0.5 shrink-0 text-tone-lavender-fg" />
                <div className="min-w-0"><p className="text-sm font-semibold">Notificações</p><p className="mt-0.5 text-xs text-muted-foreground">Ative somente se quiser receber lembretes.</p></div>
              </div>
              <PreferenceSwitch checked={notifications} onChange={toggleNotifications} label="Ativar notificações" />
            </div>
            <div className="flex min-h-20 items-center gap-4 px-4 py-3 sm:px-5">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <AlumiaIcon icon={darkMode ? Moon01Icon : Sun01Icon} size="md" className="mt-0.5 shrink-0 text-tone-sky-fg" />
                <div className="min-w-0"><p className="text-sm font-semibold">Tema escuro</p><p className="mt-0.5 text-xs text-muted-foreground">Use uma aparência mais confortável em ambientes escuros.</p></div>
              </div>
              <PreferenceSwitch checked={darkMode} onChange={toggleTheme} label="Ativar tema escuro" />
            </div>
            <label className="flex min-h-20 items-center gap-4 px-4 py-3 sm:px-5">
              <span className="flex min-w-0 flex-1 items-start gap-3">
                <AlumiaIcon icon={GlobeIcon} size="md" className="mt-0.5 shrink-0 text-tone-peach-fg" />
                <span className="min-w-0"><span className="block text-sm font-semibold">Idioma</span><span className="mt-0.5 block text-xs text-muted-foreground">Idioma usado na interface.</span></span>
              </span>
              <select value={language} onChange={(event) => { setLanguage(event.target.value); window.localStorage.setItem("language", event.target.value); }} className="min-h-11 rounded-xl border border-input bg-background px-3 text-sm font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"><option value="pt-BR">Português</option><option value="en" disabled>English — em breve</option><option value="es" disabled>Español — em breve</option></select>
            </label>
          </Surface>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div>
            <SectionHeader icon={AccessibilityIcon} iconClassName="text-tone-sky-fg" title="Acessibilidade" />
            <Surface variant="subtle" className="mt-3 flex items-start gap-3 p-4"><AlumiaIcon icon={AccessibilityIcon} size="md" className="mt-0.5 shrink-0 text-primary" /><div><h3 className="text-sm font-semibold">Preferências do dispositivo</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">A Alumia respeita redução de movimento, zoom e configurações de contraste do seu dispositivo.</p></div></Surface>
          </div>
          <div>
            <SectionHeader icon={LockIcon} iconClassName="text-tone-mint-fg" title="Privacidade e segurança" />
            <Surface variant="subtle" className="mt-3 flex items-start gap-3 p-4"><AlumiaIcon icon={LockIcon} size="md" className="mt-0.5 shrink-0 text-primary" /><div><h3 className="text-sm font-semibold">Seu cuidado é privado</h3><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Tarefas, hidratação e informações pessoais pertencem à sua conta.</p></div></Surface>
          </div>
        </section>

        <section>
          <SectionHeader icon={Settings01Icon} iconClassName="text-tone-peach-fg" title="Conta" />
          <Surface className="mt-4 divide-y divide-border overflow-hidden">
            <button type="button" onClick={() => navigate({ to: "/completar-perfil" })} className="flex min-h-16 w-full items-center gap-3 px-4 text-left transition-colors hover:bg-muted sm:px-5"><AlumiaIcon icon={Settings01Icon} size="sm" className="text-primary" /><span className="flex-1 text-sm font-semibold">Editar dados do perfil</span><AlumiaIcon icon={ChevronRightIcon} size="sm" className="text-muted-foreground" /></button>
            <button type="button" onClick={logout} className="flex min-h-16 w-full items-center gap-3 px-4 text-left text-destructive transition-colors hover:bg-destructive/10 sm:px-5"><AlumiaIcon icon={Logout01Icon} size="sm" /><span className="flex-1 text-sm font-semibold">Sair da conta</span><AlumiaIcon icon={ChevronRightIcon} size="sm" /></button>
          </Surface>
        </section>
      </div>
    </AppShell>
  );
}
