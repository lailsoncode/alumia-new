import { useEffect, useState } from "react";
import {
  AddCircleIcon,
  AlarmClockIcon,
  ArrowRight01Icon,
  BookOpen01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { InlineFeedback } from "@/components/ui/surface";
import { Switch } from "@/components/ui/switch";
import { getLocalDateString } from "@/lib/utils";
import type { AcademicType, CreateStudentCommitmentInput, StudentSubject } from "@/types";

const academicTypes: { value: AcademicType; label: string }[] = [
  { value: "exam", label: "Prova" },
  { value: "assignment", label: "Trabalho" },
  { value: "reading", label: "Leitura" },
  { value: "review", label: "Revisão" },
];

const durations = [10, 25, 45];

interface StudentCommitmentDialogProps {
  open: boolean;
  subjects: StudentSubject[];
  onClose: () => void;
  onSave: (input: CreateStudentCommitmentInput) => Promise<void>;
}

export function StudentCommitmentDialog({ open, subjects, onClose, onSave }: StudentCommitmentDialogProps) {
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [addingSubject, setAddingSubject] = useState(false);
  const [academicType, setAcademicType] = useState<AcademicType>("assignment");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(25);
  const [customDuration, setCustomDuration] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSubjectId(subjects[0]?.id ?? "");
    setAddingSubject(subjects.length === 0);
    setError(null);
  }, [open, subjects]);

  if (!open) return null;

  const resetAndClose = () => {
    setTitle("");
    setNewSubjectName("");
    setAcademicType("assignment");
    setDate("");
    setTime("");
    setEstimatedMinutes(25);
    setCustomDuration("");
    setReminderEnabled(false);
    setDescription("");
    setError(null);
    onClose();
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const duration = customDuration ? Number(customDuration) : estimatedMinutes;
    if (!title.trim()) return setError("Conte o que você precisa fazer.");
    if (addingSubject ? !newSubjectName.trim() : !subjectId) return setError("Escolha ou crie uma matéria.");
    if (!Number.isFinite(duration) || duration < 5 || duration > 240) return setError("Escolha um tempo entre 5 e 240 minutos.");
    if (reminderEnabled && (!date || !time)) return setError("Escolha data e horário para ativar o lembrete.");

    setSaving(true);
    setError(null);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        subjectId: addingSubject ? undefined : subjectId,
        newSubjectName: addingSubject ? newSubjectName.trim() : undefined,
        academicType,
        date: date || undefined,
        time: time || undefined,
        estimatedMinutes: duration,
        reminder: reminderEnabled ? "15min" : null,
      });
      resetAndClose();
    } catch {
      setError("Não conseguimos salvar esse compromisso agora.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button type="button" className="fixed inset-0 z-40 cursor-default bg-foreground/25 backdrop-blur-sm" onClick={resetAndClose} aria-label="Fechar novo compromisso" />
      <section role="dialog" aria-modal="true" aria-labelledby="student-commitment-title" className="module-theme-student alumia-elevated fixed inset-x-0 bottom-0 z-50 max-h-[96svh] overflow-y-auto rounded-t-3xl p-4 sm:left-1/2 sm:bottom-5 sm:max-w-2xl sm:-translate-x-1/2 sm:rounded-3xl">
        <div className="mx-auto mb-2 h-1 w-12 rounded-full bg-muted-foreground/30 sm:hidden" />
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlumiaIcon icon={BookOpen01Icon} size="md" className="module-text" />
            <h2 id="student-commitment-title" className="font-display text-xl font-semibold">Novo compromisso</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={resetAndClose} aria-label="Fechar"><AlumiaIcon icon={Cancel01Icon} size="sm" /></Button>
        </div>

        <form onSubmit={submit} className="mt-3 space-y-3" noValidate>
          <div>
            <label htmlFor="student-title" className="text-sm font-semibold">O que você precisa fazer?</label>
            <input id="student-title" value={title} onChange={(event) => setTitle(event.target.value)} autoFocus className="mt-1 min-h-12 w-full rounded-xl border border-input bg-background px-3 text-base focus:outline-none focus:ring-2 focus:ring-ring/30" />
          </div>

          <fieldset>
            <div className="flex items-center justify-between gap-2">
              <legend className="text-sm font-semibold">Matéria</legend>
              {subjects.length > 0 && (
                <button type="button" className="text-xs font-semibold text-primary hover:underline" onClick={() => setAddingSubject((value) => !value)}>
                  {addingSubject ? "Escolher existente" : "+ Nova matéria"}
                </button>
              )}
            </div>
            {addingSubject ? (
              <input aria-label="Nome da nova matéria" value={newSubjectName} onChange={(event) => setNewSubjectName(event.target.value)} placeholder="Ex.: Neurociência" className="mt-1 min-h-12 w-full rounded-xl border border-input bg-background px-3 text-base focus:outline-none focus:ring-2 focus:ring-ring/30" />
            ) : (
              <select aria-label="Matéria" value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="mt-1 min-h-12 w-full rounded-xl border border-input bg-background px-3 text-base focus:outline-none focus:ring-2 focus:ring-ring/30">
                {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            )}
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold">Tipo</legend>
            <div className="mt-1 grid grid-cols-4 gap-1.5">
              {academicTypes.map((type) => (
                <button key={type.value} type="button" aria-pressed={academicType === type.value} onClick={() => setAcademicType(type.value)} className={`min-h-11 rounded-xl border px-1.5 text-xs font-semibold sm:text-sm ${academicType === type.value ? "border-primary bg-primary/12 text-primary" : "border-input bg-surface"}`}>
                  {type.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold">Quando?</legend>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <input aria-label="Data" type="date" min={getLocalDateString()} value={date} onChange={(event) => setDate(event.target.value)} className="min-h-12 min-w-0 rounded-xl border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
              <input aria-label="Horário" type="time" value={time} onChange={(event) => setTime(event.target.value)} className="min-h-12 min-w-0 rounded-xl border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold">Quanto tempo parece possível?</legend>
            <div className="mt-1 grid grid-cols-4 gap-1.5">
              {durations.map((duration) => (
                <button key={duration} type="button" aria-pressed={!customDuration && estimatedMinutes === duration} onClick={() => { setEstimatedMinutes(duration); setCustomDuration(""); }} className={`min-h-11 rounded-xl border px-1 text-sm font-semibold ${!customDuration && estimatedMinutes === duration ? "border-primary bg-primary/12 text-primary" : "border-input bg-surface"}`}>
                  {duration} min
                </button>
              ))}
              <label className="min-w-0">
                <span className="sr-only">Duração personalizada em minutos</span>
                <input type="number" min="5" max="240" value={customDuration} onChange={(event) => setCustomDuration(event.target.value)} placeholder="Outro" className="min-h-11 w-full rounded-xl border border-input bg-background px-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-ring/30" />
              </label>
            </div>
          </fieldset>

          <label className="module-whisper flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border px-3">
            <AlumiaIcon icon={AlarmClockIcon} size="sm" className="module-text" />
            <span className="flex-1 text-sm font-medium">Lembrar com gentileza, 15 min antes</span>
            <Switch checked={reminderEnabled} onCheckedChange={setReminderEnabled} aria-label="Ativar lembrete" />
          </label>

          <div>
            <label htmlFor="student-description" className="text-sm font-semibold">Observação <span className="font-normal text-muted-foreground">(opcional)</span></label>
            <textarea id="student-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={2} className="mt-1 w-full resize-none rounded-xl border border-input bg-background px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-ring/30" />
          </div>

          {error && <InlineFeedback tone="danger">{error}</InlineFeedback>}

          <div className="sticky bottom-0 -mx-1 flex gap-2 bg-surface-elevated/95 px-1 pt-2 backdrop-blur-sm">
            <Button type="button" variant="ghost" className="flex-1" onClick={resetAndClose}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Salvando…" : "Salvar compromisso"}
              {!saving && <AlumiaIcon icon={ArrowRight01Icon} size="xs" />}
            </Button>
          </div>
        </form>
      </section>
    </>
  );
}
