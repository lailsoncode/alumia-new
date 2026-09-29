import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LockIcon } from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { PreferenceSwitch } from "@/components/shared/settings/PreferenceSwitch";
import { getAlumiaContextPreference, setAlumiaContextPreference } from "@/services/alumiaPreferencesService";

export function AlumiaContextPreference({ settings = false }: { settings?: boolean }) {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    getAlumiaContextPreference().then((value) => { if (active) setEnabled(value); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function save(value: boolean) {
    setSaving(true);
    setError(false);
    try {
      await setAlumiaContextPreference(value);
      setEnabled(value);
    } catch { setError(true); }
    finally { setSaving(false); }
  }

  if (!settings && !loading && enabled !== null && !error) return null;
  return (
    <div className={settings ? "px-3 py-2" : "border-b border-border/70 bg-surface-subtle/50 px-3 py-3 sm:px-4"}>
      <div className="flex items-center gap-3">
        <AlumiaIcon icon={LockIcon} size="md" className="shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold">Continuidade da conversa</h2>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{settings ? "Usar mensagens recentes para acompanhar a conversa." : "Posso usar as mensagens recentes desta conversa?"}</p>
        </div>
        {settings && (
          <PreferenceSwitch checked={enabled === true} onCheckedChange={(value) => void save(value)} label="Permitir contexto da conversa" disabled={saving || loading} />
        )}
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pl-8">
      <Dialog>
        <DialogTrigger asChild><button type="button" className="min-h-11 shrink-0 rounded-md text-xs font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Saiba mais</button></DialogTrigger>
        <DialogContent className="max-h-[85svh] w-[calc(100%-2rem)] overflow-y-auto rounded-2xl p-5 sm:rounded-2xl">
          <DialogTitle className="pr-6">Continuidade da conversa</DialogTitle>
          <DialogDescription>Você escolhe como a Alum.IA acompanha suas mensagens.</DialogDescription>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>Com sua permissão, a Alum.IA considera até oito mensagens anteriores desta conversa. Sem ela, cada mensagem é respondida separadamente.</p>
          <p>A conversa não é salva pela Alumia e desaparece ao limpar ou sair. Esta escolha ainda não cria uma memória sobre você para outras conversas nem permite acessar dados dos módulos.</p>
          <p>Você pode mudar sua escolha em Ajustes. Ao desativar, as próximas solicitações deixam de incluir mensagens anteriores; um processamento já iniciado não pode ser desfeito.</p>
          <p>Para gerar as respostas, o texto é processado pelo provedor de inteligência artificial Google Cloud.</p>
        </div>
        </DialogContent>
      </Dialog>
      {!settings && !loading && (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" className="min-h-11 px-3 text-xs" aria-label="Continuar sem contexto" disabled={saving} onClick={() => void save(false)}>Agora não</Button>
          <Button size="sm" className="min-h-11 px-3 text-xs shadow-none" aria-label="Permitir contexto" disabled={saving} onClick={() => void save(true)}>Permitir</Button>
        </div>
      )}
      {loading && <p role="status" className="text-xs text-muted-foreground">Verificando…</p>}
      {saving && <p role="status" className="text-xs text-muted-foreground">Salvando…</p>}
      </div>
      {error && <p role="alert" className="mt-1 pl-8 text-xs leading-relaxed text-destructive">Não foi possível verificar sua escolha. Tente novamente.</p>}
    </div>
  );
}
