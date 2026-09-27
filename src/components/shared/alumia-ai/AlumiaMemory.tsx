import { useEffect, useState } from "react";
import { AiBrain01Icon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { forgetMemory, getMemories, getMemoryEnabled, saveMemory, setMemoryEnabled, type AlumiaMemory } from "@/services/alumiaMemoryService";

export function AlumiaMemory({ settings = false }: { settings?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {settings ? (
          <button className="flex min-h-14 w-full items-center gap-3 px-3 py-2 text-left hover:bg-muted" type="button">
            <AlumiaIcon icon={AiBrain01Icon} size="md" className="shrink-0 text-primary" />
            <span className="flex-1"><span className="block text-sm font-semibold">Minhas lembranças</span><span className="block text-xs text-muted-foreground">Escolha o que a Alum.IA lembra sobre você.</span></span>
            <span className="text-xs font-semibold text-primary">Gerenciar</span>
          </button>
        ) : (
          <Button type="button" variant="ghost" size="sm" aria-label="Minhas lembranças"><AlumiaIcon icon={AiBrain01Icon} size="sm" /><span className="hidden sm:inline">Lembranças</span></Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85svh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl p-4 sm:rounded-2xl sm:p-5">
        <DialogTitle className="pr-6">Minhas lembranças</DialogTitle>
        <DialogDescription>Você escolhe o que a Alum.IA pode lembrar nas próximas conversas.</DialogDescription>
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

  return <div className="space-y-3">
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
      <div><p className="text-sm font-semibold">Memória pessoal</p><p className="mt-0.5 text-xs text-muted-foreground">Guardar o que você confirmar e usar em novas conversas.</p></div>
      <button type="button" role="switch" aria-label="Permitir memória pessoal" aria-checked={enabled} disabled={loading || busy} onClick={() => void run(async () => { await setMemoryEnabled(!enabled); setEnabled(!enabled); })} className={`relative flex h-11 w-14 shrink-0 items-center rounded-full p-1 transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${enabled ? "bg-primary" : "bg-muted"}`}>
        <span className={`h-6 w-6 rounded-full bg-surface shadow-sm transition-transform ${enabled ? "translate-x-5" : "translate-x-0"}`} />
      </button>
    </div>
    <details className="text-xs text-muted-foreground"><summary className="min-h-11 cursor-pointer py-3 font-semibold text-primary">Saiba mais</summary>
      <div className="space-y-2 leading-relaxed">
        <p>Ao ativar, você autoriza guardar as informações que confirmar e processá-las nas conversas com o provedor de IA Google Cloud. Somente as 50 lembranças atualizadas mais recentemente são consideradas. Elas são dados pessoais de referência, não instruções para a assistente.</p>
        <p>As lembranças ficam na sua conta até você excluí-las. Desativar interrompe o uso e novas gravações, mas preserva a lista. Esquecer remove a informação da memória ativa; não desfaz respostas ou processamentos anteriores. Nenhuma conversa inteira é salva por esta opção.</p>
        <p>Prefira hobbies, preferências e objetivos. Não registre senhas, documentos ou informações sensíveis. Você pode corrigir uma lembrança quando ela deixar de representar você.</p>
      </div>
    </details>
    {loading ? <p role="status" className="text-sm">Carregando…</p> : <>
      {!enabled && <p className="text-xs text-muted-foreground">A memória está desativada. As lembranças abaixo não serão usadas nas próximas solicitações.</p>}
      {enabled && <form className="space-y-2" onSubmit={(event) => { event.preventDefault(); void run(async () => { await saveMemory(draft, editing); setMemories(await getMemories()); setDraft(""); setEditing(undefined); }); }}>
        <label htmlFor="memory-content" className="text-sm font-semibold">{editing ? "Corrigir lembrança" : "Nova lembrança"}</label>
        <input id="memory-content" maxLength={240} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ex.: Estou aprendendo inglês" className="min-h-11 w-full rounded-xl border border-input bg-background px-3 text-sm focus-visible:ring-2 focus-visible:ring-ring" disabled={busy} />
        <div className="flex justify-end gap-2">{editing && <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => { setEditing(undefined); setDraft(""); }}>Cancelar</Button>}<Button size="sm" disabled={busy || !draft.trim()}>{editing ? "Salvar correção" : "Guardar lembrança"}</Button></div>
      </form>}
      {!memories.length && <p className="py-3 text-sm text-muted-foreground">Ainda não há lembranças guardadas.</p>}
      <ul className="divide-y divide-border">
        {memories.map((memory) => <li key={memory.id} className="py-3">
          <p className="break-words text-sm">{memory.content}</p>
          <p className="mt-1 text-xs text-muted-foreground">Confirmada por você · {new Date(memory.updated_at).toLocaleDateString("pt-BR")}</p>
          <div className="mt-1 flex flex-wrap justify-end gap-1">
            {forgetting === memory.id ? <><span className="self-center text-xs">Esquecer esta lembrança?</span><Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => setForgetting(undefined)}>Cancelar</Button><Button type="button" size="sm" variant="destructive" disabled={busy} onClick={() => void run(async () => { await forgetMemory(memory.id); setMemories((rows) => rows.filter((row) => row.id !== memory.id)); setForgetting(undefined); if (editing === memory.id) { setEditing(undefined); setDraft(""); } })}>Confirmar exclusão</Button></> : <>
              <Button type="button" size="sm" variant="ghost" disabled={!enabled || busy} onClick={() => { setEditing(memory.id); setDraft(memory.content); }}>Corrigir</Button>
              <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => setForgetting(memory.id)}>Esquecer</Button>
            </>}
          </div>
        </li>)}
      </ul>
    </>}
    {busy && <p role="status" className="text-xs text-muted-foreground">Atualizando…</p>}
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
  </div>;
}

export function MemorySuggestion({ content }: { content: string }) {
  const [state, setState] = useState<"pending" | "saving" | "saved" | "dismissed" | "error">("pending");
  async function confirm() {
    setState("saving");
    try { await saveMemory(content); setState("saved"); }
    catch { setState("error"); }
  }
  return <div className="mt-3 rounded-xl border border-border bg-surface p-3 text-foreground">
    <p className="text-xs font-semibold text-muted-foreground">Lembrança proposta</p><p className="mt-1 text-sm">{content}</p>
    {(state === "pending" || state === "error") && <div className="mt-2 flex flex-wrap gap-2"><Button size="sm" onClick={() => void confirm()}>Guardar lembrança</Button><Button size="sm" variant="ghost" onClick={() => setState("dismissed")}>Agora não</Button></div>}
    {state === "error" && <p role="alert" className="mt-2 text-xs text-destructive">Não consegui guardar. Verifique se a memória está ativada em Minhas lembranças.</p>}
    {state === "saving" && <p role="status" className="mt-2 text-xs">Guardando…</p>}
    {state === "saved" && <p role="status" className="mt-2 text-xs">Lembrança guardada. Você pode corrigi-la ou esquecê-la em Minhas lembranças.</p>}
    {state === "dismissed" && <p role="status" className="mt-2 text-xs">Tudo bem. Não guardei esta informação.</p>}
  </div>;
}
