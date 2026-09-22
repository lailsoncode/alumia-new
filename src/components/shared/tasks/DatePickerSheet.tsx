import { useEffect, useState } from "react";
import { Cancel01Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { DatePickerCalendar } from "./DatePickerCalendar";

interface DatePickerSheetProps { open: boolean; onClose: () => void; onSave?: (date: Date | null, time: string | null) => void; initialDate?: Date | null; initialTime?: string | null; }

export function DatePickerSheet({ open, onClose, onSave, initialDate, initialTime }: DatePickerSheetProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());
  const [time, setTime] = useState(initialTime || "");
  useEffect(() => { if (open) { setSelectedDate(initialDate || new Date()); setTime(initialTime || ""); } }, [open, initialDate, initialTime]);
  if (!open) return null;
  return (
    <>
      <button type="button" className="fixed inset-0 z-[60] cursor-default bg-foreground/25 backdrop-blur-sm" onClick={onClose} aria-label="Fechar seleção de data" />
      <section role="dialog" aria-modal="true" aria-labelledby="date-title" className="alumia-elevated fixed inset-x-0 bottom-0 z-[70] max-h-[92svh] overflow-y-auto rounded-t-3xl p-5 sm:left-1/2 sm:bottom-8 sm:max-w-lg sm:-translate-x-1/2 sm:rounded-3xl sm:p-6">
        <div className="flex items-start justify-between gap-4"><div><h2 id="date-title" className="text-xl font-bold">Data e horário</h2><p className="mt-1 text-sm text-muted-foreground">Escolha quando este cuidado deve aparecer.</p></div><Button variant="ghost" size="icon" onClick={onClose} aria-label="Fechar"><AlumiaIcon icon={Cancel01Icon} size="sm" /></Button></div>
        <div className="mt-5"><DatePickerCalendar selectedDate={selectedDate} onSelectDate={setSelectedDate} /></div>
        <label htmlFor="task-time" className="mt-5 block text-sm font-semibold">Horário <span className="font-normal text-muted-foreground">(opcional)</span></label>
        <div className="mt-2 flex min-h-12 items-center gap-2 rounded-xl border border-input bg-background px-4"><AlumiaIcon icon={Clock01Icon} size="sm" className="text-muted-foreground" /><input id="task-time" type="time" value={time} onChange={(event) => setTime(event.target.value)} className="min-h-11 flex-1 bg-transparent text-base focus:outline-none" /></div>
        <div className="mt-5 flex justify-end gap-3 border-t border-border pt-4"><Button variant="ghost" onClick={() => { setTime(""); setSelectedDate(new Date()); }}>Limpar</Button><Button onClick={() => { onSave?.(selectedDate, time || null); onClose(); }}>Aplicar</Button></div>
      </section>
    </>
  );
}
