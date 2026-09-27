import { useMemo, useState } from "react";
import { ArrowLeft01Icon, Clock01Icon, HeadphonesIcon, Search01Icon, TextIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { filterMindfulnessPractices } from "@/lib/mindfulness";
import type { MindfulnessCategory, MindfulnessFormat, MindfulnessPractice } from "@/types";

type Filter = "all" | "short" | "medium" | "audio" | "text";

interface PracticeLibraryProps {
  practices: MindfulnessPractice[];
  initialCategory?: MindfulnessCategory;
  onBack: () => void;
  onStart: (practice: MindfulnessPractice, format: MindfulnessFormat) => void;
}

export function PracticeLibrary({ practices, initialCategory, onBack, onStart }: PracticeLibraryProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const filtered = useMemo(() => filterMindfulnessPractices(practices, {
    search,
    category: initialCategory,
    duration: filter === "short" || filter === "medium" ? filter : undefined,
    format: filter === "audio" || filter === "text" ? filter : undefined,
  }), [filter, initialCategory, practices, search]);

  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: "Todas" },
    { value: "short", label: "2–5 min" },
    { value: "medium", label: "6–10 min" },
    { value: "audio", label: "Áudio" },
    { value: "text", label: "Texto" },
  ];

  return (
    <section>
      <div className="flex items-start gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label="Voltar ao Mindfulness"><AlumiaIcon icon={ArrowLeft01Icon} size="md" /></Button>
        <div><h2 className="font-display text-2xl font-semibold">Práticas</h2><p className="text-sm text-muted-foreground">Pequenos momentos para mais presença no seu dia.</p></div>
      </div>

      <label className="mt-4 flex min-h-12 items-center gap-2 rounded-xl border border-input bg-surface px-3">
        <AlumiaIcon icon={Search01Icon} size="sm" className="text-muted-foreground" />
        <span className="sr-only">Buscar uma prática</span>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar uma prática" className="min-h-11 flex-1 bg-transparent text-base focus:outline-none" />
      </label>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Filtros de práticas">
        {filters.map((option) => (
          <button key={option.value} type="button" aria-pressed={filter === option.value} onClick={() => setFilter(option.value)} className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-semibold ${filter === option.value ? "border-primary bg-primary/14 text-primary" : "border-input bg-surface"}`}>{option.label}</button>
        ))}
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div><h3 className="font-display text-xl font-semibold">{initialCategory ? "Para este momento" : "Todas as práticas"}</h3><p className="text-sm text-muted-foreground">Escolha o formato e interrompa quando quiser.</p></div>
        {initialCategory && <button type="button" onClick={onBack} className="shrink-0 text-sm font-semibold text-primary hover:underline">Limpar categoria</button>}
      </div>

      {filtered.length ? (
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((practice) => {
            const preferredFormat = practice.formats.includes("audio") ? "audio" : "text";
            return (
              <Surface key={practice.id} className="module-whisper flex min-h-52 flex-col p-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary"><AlumiaIcon icon={preferredFormat === "audio" ? HeadphonesIcon : TextIcon} size="md" /></span>
                <h4 className="mt-3 font-display text-lg font-semibold">{practice.title}</h4>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{practice.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><AlumiaIcon icon={Clock01Icon} size="xs" />{practice.durationMinutes} min</span>
                  {practice.formats.map((format) => <span key={format} className="rounded-full bg-primary/8 px-2 py-1">{format === "audio" ? "Áudio" : "Texto"}</span>)}
                </div>
                <Button className="mt-3 w-full" onClick={() => onStart(practice, preferredFormat)}>Começar</Button>
              </Surface>
            );
          })}
        </div>
      ) : (
        <Surface variant="subtle" className="mt-3 p-5 text-center shadow-none"><p className="font-semibold">Nenhuma prática encontrada.</p><p className="mt-1 text-sm text-muted-foreground">Tente retirar um filtro ou buscar outro termo.</p></Surface>
      )}
    </section>
  );
}
