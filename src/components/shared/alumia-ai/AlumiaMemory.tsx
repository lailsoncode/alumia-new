import { useEffect, useState } from "react";
import { AiBrain01Icon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { PreferenceSwitch } from "@/components/shared/settings/PreferenceSwitch";
import { forgetAllMemories, forgetMemory, getMemories, getMemoryEnabled, saveMemory, setMemoryEnabled, type AlumiaMemory } from "@/services/alumiaMemoryService";

export function AlumiaMemory({ settings = false }: { settings?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {settings ? (
          <button className="flex min-h-14 w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted" type="button">
            <AlumiaIcon icon={AiBrain01Icon} size="md" className="shrink-0 text-primary" />
            <span className="flex-1"><span className="block text-sm font-semibold">Aprendizado da Alum.IA</span><span className="block text-xs text-muted-foreground">Controle o que ela aprende e usa sobre você.</span></span>
            <span className="text-xs font-semibold text-primary">Gerenciar</span>
          </button>
        ) : (
          <Button type="button" variant="ghost" size="sm" aria-label="Minhas lembranças"><AlumiaIcon icon={AiBrain01Icon} size="sm" /><span className="hidden sm:inline">Lembranças</span></Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85svh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl p-4 sm:rounded-2xl sm:p-5">
        <DialogTitle className="pr-6">Aprendizado e lembranças</DialogTitle>
        <DialogDescription>Veja, corrija, baixe ou apague o que a Alum.IA sabe sobre você.</DialogDescription>
        {open && <MemoryManager />}
      </DialogContent>
    </Dialog>
  );
}

function MemoryManager() {
  const [enabled, setEnabled] = useState(false);
  const [memories, setMemories] = useState<AlumiaMemory[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState<string>();
  const [forgetting, setForgetting] = useState<string>();
  const [forgettingAll, setForgettingAll] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.all([getMemoryEnabled(), getMemories()]).then(([permission, rows]) => {
      if (active) { setEnabled(permission); setMemories(rows); }
    }).catch(() => { if (active) setError("Não consegui carregar suas lembranças. Feche e tente novamente."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function run(action: () => Promise<void>) {
    setBusy(true); setError("");
    try { await action(); }
    catch { setError("Não foi possível salvar a alteração. Tente novamente."); }
    finally { setBusy(false); }
  }

  function downloadMemories() {
    const file = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), memories }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.href = url; link.download = "alumia-minhas-lembrancas.json"; link.click();
    URL.revokeObjectURL(url);
  }

  function memoryOrigin(memory: AlumiaMemory) {
    if (memory.source === "onboarding_confirmed") return "Perfil inicial";
    if (memory.source === "assistant_learned") return "Aprendida na conversa";
    if (memory.source === "module_observed") return ({ tasks: "Tarefas", student: "Estudante", hydration: "Hidratação", mindfulness: "Mindfulness" } as const)[memory.source_module as "tasks" | "student" | "hydration" | "mindfulness"] ?? "Atividade na Alumia";
    return "Confirmada por você";
  }

  return <div className="space-y-3">
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
      <div><p className="text-sm font-semibold">Permitir que a Alum.IA aprenda comigo</p><p className="mt-0.5 text-xs text-muted-foreground">Personalizar conversas usando preferências, objetivos e rotinas.</p></div>
      <PreferenceSwitch checked={enabled} onCheckedChange={(value) => void run(async () => { await setMemoryEnabled(value); setEnabled(value); })} label="Permitir aprendizado pessoal da Alum.IA" disabled={loading || busy} />
    </div>
    <details className="text-xs text-muted-foreground"><summary className="min-h-11 cursor-pointer py-3 font-semibold text-primary">Saiba mais</summary>
      <div className="space-y-2 leading-relaxed">
        <p>Ao ativar, você autoriza a criação de um perfil pessoal para adaptar conversas e sugestões usando informações que fornecer e, gradualmente, atividades nos módulos da Alumia. Conversas completas não são transformadas em lembranças.</p>
        <p>Nos módulos conectados, um padrão só vira lembrança depois de aparecer pelo menos três vezes. Tarefas fornece apenas faixa de horário; Estudante, duração planejada; Hidratação, tamanho de registro; Mindfulness, preferência por áudio ou texto. Títulos, descrições, valores, reflexões e check-ins não são copiados.</p>
        <p>As lembranças ficam na sua conta até você apagá-las. Desativar interrompe novos aprendizados e o uso do perfil, mas preserva a lista. Apagar remove as informações da memória ativa, sem desfazer processamentos anteriores.</p>
        <p>O processamento de respostas usa um provedor contratado de inteligência artificial. Dados sensíveis não fazem parte deste primeiro aprendizado; qualquer ampliação exigirá uma autorização própria e destacada.</p>
      </div>
    </details>
    {loading ? <p role="status" className="text-sm">Carregando…</p> : <>
      {!enabled && <p className="text-xs text-muted-foreground">O aprendizado está desativado. As lembranças permanecem visíveis, mas não serão usadas.</p>}
      {editing && <form className="space-y-2" onSubmit={(event) => { event.preventDefault(); void run(async () => { await saveMemory(draft, editing); setMemories(await getMemories()); setDraft(""); setEditing(undefined); }); }}>
        <label htmlFor="memory-content" className="text-sm font-semibold">Corrigir lembrança</label>
        <input id="memory-content" maxLength={240} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ex.: Estou aprendendo inglês" className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring" disabled={busy} />
        <div className="flex justify-end gap-2"><Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => { setEditing(undefined); setDraft(""); }}>Cancelar</Button><Button size="sm" disabled={busy || !draft.trim()}>Salvar correção</Button></div>
      </form>}
      {!memories.length && <p className="py-3 text-sm text-muted-foreground">Ainda não há lembranças guardadas.</p>}
      <ul className="divide-y divide-border">
        {memories.map((memory) => <li key={memory.id} className="py-3">
          <p className="break-words text-sm">{memory.content}</p>
          <p className="mt-1 text-xs text-muted-foreground">{memoryOrigin(memory)} · {new Date(memory.updated_at).toLocaleDateString("pt-BR")}</p>
          <div className="mt-1 flex flex-wrap justify-end gap-1">
            {forgetting === memory.id ? <><span className="self-center text-xs">Esquecer esta lembrança?</span><Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => setForgetting(undefined)}>Cancelar</Button><Button type="button" size="sm" variant="destructive" disabled={busy} onClick={() => void run(async () => { await forgetMemory(memory.id); setMemories((rows) => rows.filter((row) => row.id !== memory.id)); setForgetting(undefined); if (editing === memory.id) { setEditing(undefined); setDraft(""); } })}>Confirmar exclusão</Button></> : <>
              <Button type="button" size="sm" variant="ghost" disabled={!enabled || busy} onClick={() => { setEditing(memory.id); setDraft(memory.content); }}>Corrigir</Button>
              <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => setForgetting(memory.id)}>Esquecer</Button>
            </>}
          </div>
        </li>)}
      </ul>
      {memories.length > 0 && <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:justify-between">
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={downloadMemories}>Baixar minhas lembranças</Button>
        {forgettingAll ? <div className="flex flex-wrap items-center justify-end gap-2"><span className="text-xs text-destructive">Apagar todas definitivamente?</span><Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => setForgettingAll(false)}>Cancelar</Button><Button type="button" size="sm" variant="destructive" disabled={busy} onClick={() => void run(async () => { await forgetAllMemories(); setMemories([]); setForgettingAll(false); setEditing(undefined); setDraft(""); })}>Confirmar exclusão de todas</Button></div> : <Button type="button" size="sm" variant="ghost" className="text-destructive" disabled={busy} onClick={() => setForgettingAll(true)}>Apagar todas as lembranças</Button>}
      </div>}
    </>}
    {busy && <p role="status" className="text-xs text-muted-foreground">Atualizando…</p>}
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
  </div>;
}
