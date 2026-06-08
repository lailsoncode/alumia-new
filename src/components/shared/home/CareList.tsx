import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Sun01Icon,
  Calendar01Icon,
  Clock01Icon,
  BellIcon,
  Flag01Icon,
  Leaf01Icon,
  AddCircleIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import type { Task, AddTaskData } from "../../../types";
import { AddTaskSheet } from "../tasks/AddTaskSheet";
import { updateTask, createTask } from "../../../services/tasksService";

interface CareListProps {
  tasks: Task[];
  loading: boolean;
  onRefresh: () => void;
}

function formatTaskDate(dateStr: string | undefined) {
  if (!dateStr) return "";
  try {
    if (
      dateStr.includes("jan") ||
      dateStr.includes("fev") ||
      dateStr.includes("mar") ||
      dateStr.includes("abr") ||
      dateStr.includes("mai") ||
      dateStr.includes("jun") ||
      dateStr.includes("jul") ||
      dateStr.includes("ago") ||
      dateStr.includes("set") ||
      dateStr.includes("out") ||
      dateStr.includes("nov") ||
      dateStr.includes("dez")
    ) {
      return dateStr;
    }

    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    if (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    ) {
      return "Hoje";
    }

    if (
      d.getDate() === tomorrow.getDate() &&
      d.getMonth() === tomorrow.getMonth() &&
      d.getFullYear() === tomorrow.getFullYear()
    ) {
      return "Amanhã";
    }

    return d.toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
  } catch (e) {
    return dateStr;
  }
}

/**
 * CareList — lista de cuidados importantes do dia carregados do Supabase.
 */
export function CareList({ tasks, loading, onRefresh }: CareListProps) {
  const navigate = useNavigate();
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  const toggleDone = async (id: string) => {
    try {
      await updateTask(id, { done: true });
      onRefresh();
    } catch (err) {
      console.error("Erro ao completar tarefa:", err);
    }
  };

  const handleCreateTask = async (data: AddTaskData) => {
    try {
      await createTask(data);
      onRefresh();
    } catch (err) {
      console.error("Erro ao criar tarefa:", err);
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];
  const pendingToday = tasks.filter((t) => !t.done && (t.date ? t.date <= todayStr : true));

  // Ordena para exibir tarefas importantes (alta prioridade) no topo
  const displayTasks = [...pendingToday]
    .sort((a, b) => {
      if (a.priority === "alta" && b.priority !== "alta") return -1;
      if (a.priority !== "alta" && b.priority === "alta") return 1;
      return 0;
    })
    .slice(0, 3);

  return (
    <section className="alumia-card p-4 sm:p-5">
      <h2 className="flex items-center gap-2 text-sm font-medium text-foreground sm:text-base">
        <HugeiconsIcon
          icon={Sun01Icon}
          size={16}
          strokeWidth={1.5}
          className="text-tone-sun-fg shrink-0"
        />
        Isso aqui parece importante pra você:
      </h2>

      {loading ? (
        <p className="mt-3 text-xs text-muted-foreground">Carregando seus cuidados...</p>
      ) : displayTasks.length === 0 ? (
        <p className="mt-3 text-xs text-muted-foreground bg-muted/30 px-3 py-4 rounded-xl border border-dashed border-border text-center">
          Nenhum cuidado pendente para hoje. Curta o seu momento! 🌸
        </p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {displayTasks.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5"
            >
              {/* Círculo de seleção (radio) */}
              <button
                type="button"
                onClick={() => toggleDone(item.id)}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-muted-foreground/40 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer focus:outline-none"
                aria-label="Concluir tarefa"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                  {item.title}
                </p>
                {(item.date || item.time || item.reminder || item.priority) && (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                    {item.date && (
                      <>
                        <HugeiconsIcon icon={Calendar01Icon} size={11} strokeWidth={1.5} />
                        <span>{formatTaskDate(item.date)}</span>
                      </>
                    )}
                    {item.time && (
                      <>
                        {item.date && <span className="mx-0.5">·</span>}
                        <HugeiconsIcon icon={Clock01Icon} size={11} strokeWidth={1.5} />
                        <span>{item.time}</span>
                      </>
                    )}
                    {item.reminder && (
                      <>
                        {(item.date || item.time) && <span className="mx-0.5">·</span>}
                        <HugeiconsIcon icon={BellIcon} size={11} strokeWidth={1.5} />
                      </>
                    )}
                    {item.priority && (
                      <>
                        {(item.date || item.time || item.reminder) && <span className="mx-0.5">·</span>}
                        <HugeiconsIcon
                          icon={Flag01Icon}
                          size={11}
                          strokeWidth={1.5}
                          className={
                            item.priority === "alta"
                              ? "text-red-500 fill-red-500/10 shrink-0"
                              : item.priority === "media"
                                ? "text-yellow-500 fill-yellow-500/10 shrink-0"
                                : "text-blue-500 fill-blue-500/10 shrink-0"
                          }
                        />
                      </>
                    )}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <HugeiconsIcon
            icon={Leaf01Icon}
            size={13}
            strokeWidth={1.5}
            className="text-tone-mint-fg"
          />
          {pendingToday.length === 1
            ? "Hoje você tem 1 cuidado aguardando por você."
            : `Hoje você tem ${pendingToday.length} cuidados aguardando por você.`}
        </p>
      )}

      <div className="mt-2 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-lg text-xs"
          onClick={() => navigate({ to: "/tarefas" })}
        >
          Ver todas
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-lg text-xs"
          onClick={() => setAddSheetOpen(true)}
        >
          <HugeiconsIcon icon={AddCircleIcon} size={13} strokeWidth={1.5} />
          Adicionar nova
        </Button>
      </div>

      <AddTaskSheet
        open={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        onSave={handleCreateTask}
      />
    </section>
  );
}
