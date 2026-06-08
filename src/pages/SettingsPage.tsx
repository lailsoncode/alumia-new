import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  BellIcon,
  Moon01Icon,
  Sun01Icon,
  GlobeIcon,
  UserIcon,
  Logout01Icon,
  Calendar01Icon,
  CheckListIcon,
  SmileIcon,
  ChevronRightIcon,
  Leaf01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";

import { useAuth } from "../hooks/use-auth";
import { getUserProfile, signOut } from "../services/authService";
import { getTasks } from "../services/tasksService";
import type { ProfileData } from "../types";
import { BottomNav } from "../components/layout";
import { Greeting } from "@/components/shared/Greeting";

import welcomeImg from "../assets/welcome.webp";
import meditacaoImg from "../assets/meditacao.webp";
import tasksImg from "../assets/tasks.webp";
import hidratacaoImg from "../assets/hidratacao.webp";

/**
 * SettingsPage — Tela de Configurações / Ajustes do Usuário.
 * Apresenta informações de perfil, insígnias, estatísticas do usuário,
 * preferências do app (notificações, tema, idioma) e opções de conta (editar, sair).
 * Desenvolvido usando o design system do Alumia para total consistência visual e suporte a dark mode.
 */
export function SettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [completedTasksCount, setCompletedTasksCount] = useState<number>(0);
  const [daysCount, setDaysCount] = useState<number>(1);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [language, setLanguage] = useState<string>("pt");

  // Insígnias usando os assets webp existentes
  const badges = [
    { id: 1, title: "Alumia tá é", subtitle: "de boa e tu", img: welcomeImg },
    { id: 2, title: "Foco total", subtitle: "no seu tempo", img: meditacaoImg },
    { id: 3, title: "Hidratado(a)", subtitle: "dia a dia", img: hidratacaoImg },
    { id: 4, title: "Leveza diária", subtitle: "sem pressa", img: tasksImg },
  ];

  // Carregar dados iniciais (Perfil, Tarefas concluídas e tempo de conta)
  useEffect(() => {
    if (user) {
      // 1. Carrega dados do perfil
      getUserProfile(user.id)
        .then((p) => {
          if (p) setProfile(p);
        })
        .catch((err) => console.error("Erro ao obter perfil:", err));

      // 2. Calcula quantidade de dias com a Alumia
      if (user.created_at) {
        const createdDate = new Date(user.created_at);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - createdDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        setDaysCount(Math.max(1, diffDays));
      }

      // 3. Carrega tarefas para contar as concluídas
      getTasks()
        .then((tasks) => {
          const completedCount = tasks.filter((t) => t.done).length;
          setCompletedTasksCount(completedCount);
        })
        .catch((err) => console.error("Erro ao obter tarefas:", err));
    }
  }, [user]);

  // Sincroniza e inicializa o tema (light/dark)
  useEffect(() => {
    const isDark =
      document.documentElement.classList.contains("dark") ||
      localStorage.getItem("theme") === "dark";
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate({ to: "/login" });
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-28">
      <main className="mx-auto max-w-2xl px-4 pt-6 space-y-4 sm:px-6 sm:pt-8">
        {/* Header de Saudação e Avatar */}
        <Greeting role="Confira todo seu desempenho:" />

        {/* Informações do Perfil */}
        <section className="alumia-card p-4 sm:p-5 space-y-3.5">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Nome
            </span>
            <button
              onClick={() => navigate({ to: "/completar-perfil" })}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              Alterar
            </button>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {profile?.firstName ? `${profile.firstName} ${profile.lastName}` : "Não preenchido"}
            </p>
          </div>
          <div className="border-t border-border/60 pt-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Mini bio
            </span>
            <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap leading-relaxed">
              {profile?.bio || "Não preenchido"}
            </p>
          </div>
          <div className="border-t border-border/60 pt-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Meta principal
            </span>
            <p className="text-sm text-foreground mt-0.5 leading-relaxed">
              {profile?.goals || "Não preenchido"}
            </p>
          </div>
        </section>

        {/* Insígnias da Jornada */}
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-foreground flex items-center gap-2 px-1">
            <span>🏆</span> Insígnias da Jornada
          </h2>
          <div className="alumia-card p-4 sm:p-5 flex flex-col items-center">
            <div className="grid grid-cols-4 gap-2 w-full">
              {badges.map((badge) => (
                <div key={badge.id} className="flex flex-col items-center text-center">
                  <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-border bg-muted shadow-inner">
                    <img
                      src={badge.img}
                      alt={badge.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="mt-2 block text-[10px] font-bold text-foreground leading-tight">
                    {badge.title}
                  </span>
                  <span className="text-[9px] font-medium text-muted-foreground leading-none mt-0.5">
                    {badge.subtitle}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-4 rounded-full border border-border bg-card px-5 py-1.5 text-xs font-semibold text-primary shadow-sm hover:bg-muted transition-all active:scale-[0.98]"
            >
              Ver todas as Insígnias
            </button>
          </div>
        </section>

        {/* Você com a Alumia */}
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-foreground flex items-center gap-2 px-1">
            <HugeiconsIcon icon={Leaf01Icon} size={16} strokeWidth={1.5} className="text-tone-mint-fg shrink-0" />
            Você com a Alumia
          </h2>
          <div className="alumia-card p-4 sm:p-5">
            <ul className="space-y-1.5">
              <li className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
                <HugeiconsIcon icon={Calendar01Icon} size={16} strokeWidth={1.5} className="text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">
                  {daysCount === 1 ? "1 dia junto 💛" : `${daysCount} dias juntos 💛`}
                </span>
              </li>
              <li className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
                <HugeiconsIcon icon={CheckListIcon} size={16} strokeWidth={1.5} className="text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">
                  {completedTasksCount === 1
                    ? "1 tarefa concluída"
                    : `${completedTasksCount} tarefas concluídas`}
                </span>
              </li>
              <li className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
                <HugeiconsIcon icon={SmileIcon} size={16} strokeWidth={1.5} className="text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground">
                  5 check-ins emocionais feitos
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Preferências do App */}
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-foreground flex items-center gap-2 px-1">
            <HugeiconsIcon icon={Settings01Icon} size={16} strokeWidth={1.5} className="text-primary shrink-0" />
            Preferências do App
          </h2>
          <div className="alumia-card p-4 sm:p-5">
            <ul className="space-y-1.5">
              {/* Notificações */}
              <li className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <HugeiconsIcon icon={BellIcon} size={16} strokeWidth={1.5} className="text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">Notificações</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notificationsEnabled
                      ? "bg-primary/60 dark:bg-primary"
                      : "bg-[#e2e8f0] dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`${
                      notificationsEnabled ? "translate-x-5" : "translate-x-0"
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </li>

              {/* Tema do App */}
              <li className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <HugeiconsIcon
                    icon={isDarkMode ? Moon01Icon : Sun01Icon}
                    size={16}
                    strokeWidth={1.5}
                    className={isDarkMode ? "text-primary shrink-0" : "text-yellow-500 shrink-0"}
                  />
                  <span className="text-sm font-medium text-foreground">Tema do app</span>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-[#e2e8f0] dark:bg-slate-700 transition-colors duration-200 ease-in-out focus:outline-none"
                >
                  <span className="sr-only">Alternar tema</span>
                  <span
                    className={`${
                      isDarkMode ? "translate-x-5" : "translate-x-0"
                    } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  >
                    <span
                      className={`${
                        isDarkMode ? "opacity-0" : "opacity-100"
                      } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                    >
                      <HugeiconsIcon icon={Sun01Icon} size={10} className="text-yellow-500 fill-yellow-500" />
                    </span>
                    <span
                      className={`${
                        isDarkMode ? "opacity-100" : "opacity-0"
                      } absolute inset-0 flex h-full w-full items-center justify-center transition-opacity`}
                    >
                      <HugeiconsIcon icon={Moon01Icon} size={10} className="text-[#2a405a] fill-[#2a405a]" />
                    </span>
                  </span>
                </button>
              </li>

              {/* Idioma */}
              <li className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <HugeiconsIcon icon={GlobeIcon} size={16} strokeWidth={1.5} className="text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">Idioma</span>
                </div>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-card text-foreground text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-border focus:ring-1 focus:ring-primary/45 cursor-pointer focus:outline-none"
                >
                  <option value="pt">Português</option>
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </li>
            </ul>
          </div>
        </section>

        {/* Conta */}
        <section className="space-y-2">
          <h2 className="text-sm font-medium text-foreground flex items-center gap-2 px-1">
            <HugeiconsIcon icon={UserIcon} size={16} strokeWidth={1.5} className="text-primary shrink-0" />
            Conta
          </h2>
          <div className="alumia-card p-4 sm:p-5">
            <ul className="space-y-1.5">
              {/* Editar Perfil */}
              <li>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/completar-perfil" })}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 hover:bg-muted active:scale-[0.99] transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <HugeiconsIcon icon={UserIcon} size={16} strokeWidth={1.5} className="text-primary shrink-0" />
                    <span className="text-sm font-medium text-foreground">Editar Perfil</span>
                  </div>
                  <HugeiconsIcon icon={ChevronRightIcon} size={16} strokeWidth={1.5} className="text-muted-foreground" />
                </button>
              </li>

              {/* Logout */}
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5 hover:bg-destructive/5 hover:border-destructive/15 active:scale-[0.99] transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <HugeiconsIcon
                      icon={Logout01Icon}
                      size={16}
                      strokeWidth={1.5}
                      className="text-primary group-hover:text-destructive shrink-0"
                    />
                    <span className="text-sm font-medium text-foreground group-hover:text-destructive">
                      Logout
                    </span>
                  </div>
                  <HugeiconsIcon
                    icon={ChevronRightIcon}
                    size={16}
                    strokeWidth={1.5}
                    className="text-muted-foreground group-hover:text-destructive"
                  />
                </button>
              </li>
            </ul>
          </div>
        </section>
      </main>

      {/* Navegação Inferior Fixa */}
      <BottomNav />
    </div>
  );
}
