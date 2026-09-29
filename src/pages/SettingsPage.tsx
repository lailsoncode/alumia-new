import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  AccessibilityIcon,
  ChevronRightIcon,
  GlobeIcon,
  LockIcon,
  Logout01Icon,
  Moon01Icon,
  Settings01Icon,
  SparklesIcon,
  Sun01Icon,
} from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { SectionHeader, Surface } from "@/components/ui/surface";
import { AlumiaContextPreference } from "@/components/shared/alumia-ai/AlumiaContextPreference";
import { AlumiaMemory } from "@/components/shared/alumia-ai/AlumiaMemory";
import { NotificationSettings, PreferenceSwitch, SettingsRow } from "@/components/shared/settings";
import { applyTheme, getStoredTheme, subscribeToThemeChanges } from "@/lib/theme";
import { getAlumiaPresenceEnabled, setAlumiaPresenceEnabled } from "@/lib/alumia-presence";
import { signOut } from "@/services/authService";

export function SettingsPage() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState("pt-BR");
  const [alumiaPresence, setAlumiaPresence] = useState(true);

  useEffect(() => {
    const nextDark = getStoredTheme() === "dark";
    setDarkMode(nextDark);
    applyTheme(nextDark ? "dark" : "light");
    setLanguage(window.localStorage.getItem("language") || "pt-BR");
    setAlumiaPresence(getAlumiaPresenceEnabled());
    return subscribeToThemeChanges((theme) => setDarkMode(theme === "dark"));
  }, []);

  const toggleTheme = (enabled: boolean) => {
    setDarkMode(enabled);
    applyTheme(enabled ? "dark" : "light");
  };

  const logout = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="space-y-5">
      <section>
        <SectionHeader
          icon={darkMode ? Moon01Icon : Sun01Icon}
          iconClassName="text-tone-sky-fg"
          title="Aparência e experiência"
          description="Preferências salvas somente neste dispositivo."
        />
        <Surface className="mt-2.5 divide-y divide-border overflow-hidden">
          <SettingsRow title="Tema escuro" description="Use uma aparência mais confortável em ambientes escuros." icon={darkMode ? Moon01Icon : Sun01Icon} iconClassName="text-tone-sky-fg">
            <PreferenceSwitch checked={darkMode} onCheckedChange={toggleTheme} label="Ativar tema escuro" />
          </SettingsRow>
          <SettingsRow title="Idioma" description="Idioma usado na interface." icon={GlobeIcon} iconClassName="text-tone-peach-fg">
            <select
              value={language}
              onChange={(event) => {
                setLanguage(event.target.value);
                window.localStorage.setItem("language", event.target.value);
              }}
              aria-label="Idioma da interface"
              className="min-h-11 w-40 rounded-xl border border-input bg-background px-3 text-sm font-semibold focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              <option value="pt-BR">Português</option>
              <option value="en" disabled>English — em breve</option>
              <option value="es" disabled>Español — em breve</option>
            </select>
          </SettingsRow>
          <SettingsRow title="Alumia flutuante" description="Mostra a personagem e seus atalhos contextuais no celular." icon={SparklesIcon} iconClassName="text-tone-sun-fg">
            <PreferenceSwitch
              checked={alumiaPresence}
              onCheckedChange={(enabled) => {
                setAlumiaPresence(enabled);
                setAlumiaPresenceEnabled(enabled);
              }}
              label="Mostrar Alumia flutuante"
            />
          </SettingsRow>
          <SettingsRow
            title="Acessibilidade do dispositivo"
            description="A Alumia respeita redução de movimento, zoom, tamanho do texto e contraste configurados no sistema."
            icon={AccessibilityIcon}
            iconClassName="text-primary"
            className="bg-surface-subtle/50"
          />
        </Surface>
      </section>

      <NotificationSettings />

      <section>
        <SectionHeader
          icon={LockIcon}
          iconClassName="text-primary"
          title="Alum.IA e privacidade"
          description="Escolhas de contexto e aprendizado que acompanham sua conta."
        />
        <Surface className="mt-2.5 divide-y divide-border overflow-hidden">
          <AlumiaContextPreference settings />
          <AlumiaMemory settings />
          <SettingsRow
            title="Seus cuidados continuam privados"
            description="Tarefas, hidratação e informações pessoais pertencem à sua conta. Você controla o que a Alum.IA pode usar."
            icon={LockIcon}
            iconClassName="text-primary"
            className="bg-surface-subtle/50"
          />
        </Surface>
      </section>

      <section>
        <SectionHeader icon={Settings01Icon} iconClassName="text-tone-peach-fg" title="Conta" description="Dados do perfil e acesso à sua conta." />
        <Surface className="mt-2.5 divide-y divide-border overflow-hidden">
          <button type="button" onClick={() => navigate({ to: "/completar-perfil" })} className="flex min-h-14 w-full items-center gap-3 px-3 text-left transition-colors hover:bg-muted sm:px-4">
            <AlumiaIcon icon={Settings01Icon} size="sm" className="text-primary" />
            <span className="flex-1 text-sm font-semibold">Editar dados do perfil</span>
            <AlumiaIcon icon={ChevronRightIcon} size="sm" className="text-muted-foreground" />
          </button>
          <button type="button" onClick={logout} className="flex min-h-14 w-full items-center gap-3 px-3 text-left text-destructive transition-colors hover:bg-destructive/10 sm:px-4">
            <AlumiaIcon icon={Logout01Icon} size="sm" />
            <span className="flex-1 text-sm font-semibold">Sair da conta</span>
            <AlumiaIcon icon={ChevronRightIcon} size="sm" />
          </button>
        </Surface>
      </section>
    </div>
  );
}
