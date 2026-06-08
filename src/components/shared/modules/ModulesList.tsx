import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { StarIcon, AddCircleIcon, Grid2X2PlusIcon } from "@hugeicons/core-free-icons";
import { activeModulesMock, initialAvailableModulesMock } from "../../../lib/mockData";

/**
 * Toggle — Componente interno auxiliar para alternar ativação de módulos.
 */
function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        on ? "bg-primary" : "bg-muted"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all ${
          on ? "left-[1.375rem]" : "left-0.5"
        }`}
      />
    </button>
  );
}

/**
 * ModulesList — Grade de módulos ativos e lista de módulos disponíveis.
 * Permite ao usuário gerenciar quais recursos quer no seu painel.
 */
export function ModulesList() {
  const [available, setAvailable] = useState(initialAvailableModulesMock);

  const toggleModule = (id: string) => {
    setAvailable((prev) => prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
  };

  return (
    <section className="space-y-5">
      {/* Módulos Ativos */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground sm:text-base">
          <HugeiconsIcon
            icon={Grid2X2PlusIcon}
            size={16}
            strokeWidth={1.5}
            className="text-tone-sky-fg"
            aria-hidden
          />
          Módulos ativos
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {activeModulesMock.map((m) => (
            <article
              key={m.id}
              className={`${m.tone} flex flex-col items-center rounded-xl p-3 text-center sm:p-4`}
            >
              <header className="flex w-full items-center justify-center gap-1.5">
                <HugeiconsIcon icon={m.icon} size={20} strokeWidth={1.5} aria-hidden />
                <h3 className="truncate text-sm font-bold sm:text-base">{m.name}</h3>
                {m.pro && (
                  <span className="inline-flex items-center gap-0.5 rounded-md bg-card/80 px-1.5 py-0.5 text-[10px] font-bold text-tone-sun-fg">
                    <HugeiconsIcon icon={StarIcon} size={10} strokeWidth={2} />
                    PRO
                  </span>
                )}
              </header>
              <p className="mt-2 line-clamp-3 text-xs leading-snug opacity-80 sm:text-sm">
                {m.description}
              </p>
              <div className="mt-3 w-full border-t border-current/15 pt-3">
                {m.id === "tasks" ? (
                  <Link
                    to="/tarefas"
                    className="block w-full rounded-lg bg-card/80 px-3 py-1.5 text-center text-xs font-medium text-foreground transition-colors hover:bg-card sm:text-sm cursor-pointer"
                  >
                    Acessar
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="w-full rounded-lg bg-card/80 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-card sm:text-sm"
                  >
                    Acessar
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Módulos Disponíveis */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground sm:text-base">
          <HugeiconsIcon
            icon={AddCircleIcon}
            size={16}
            strokeWidth={1.5}
            className="text-muted-foreground"
            aria-hidden
          />
          Módulos disponíveis
        </h2>
        <ul className="space-y-2">
          {available.map((m) => (
            <li
              key={m.id}
              className={`flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 ${m.enabled ? `border-current/20 ${m.tone}` : ""}`}
              style={m.enabled ? { backgroundColor: "var(--card)" } : undefined}
            >
              <HugeiconsIcon
                icon={m.icon}
                size={20}
                strokeWidth={1.5}
                className={m.enabled ? "" : "text-muted-foreground"}
                aria-hidden
              />
              <span className="flex-1 truncate text-sm font-medium text-foreground sm:text-base">
                {m.name}
              </span>
              {m.pro && (
                <span className="inline-flex items-center gap-0.5 rounded-md bg-tone-sun px-1.5 py-0.5 text-[10px] font-bold text-tone-sun-fg">
                  <HugeiconsIcon icon={StarIcon} size={10} strokeWidth={2} />
                  PRO
                </span>
              )}
              <Toggle
                on={m.enabled}
                onClick={() => toggleModule(m.id)}
                label={`Ativar ${m.name}`}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
