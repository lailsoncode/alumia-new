import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
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
    <Surface className="space-y-3 p-3 sm:p-4">
      <h2 className="text-sm font-semibold">Continuidade da conversa</h2>
      <p className="text-sm text-muted-foreground">{settings ? "Permita que a Alum.IA acompanhe o que vocês estão conversando." : "Posso acompanhar o que já conversamos para entender melhor suas próximas mensagens?"}</p>
      <details className="text-xs text-muted-foreground">
        <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-primary">Saiba mais</summary>
        <div className="space-y-2 pb-2 leading-relaxed">
          <p>Com sua permissão, a Alum.IA considera até oito mensagens anteriores desta conversa. Sem ela, cada mensagem é respondida separadamente.</p>
          <p>A conversa não é salva pela Alumia e desaparece ao limpar ou sair. Esta escolha ainda não cria uma memória sobre você para outras conversas nem permite acessar dados dos módulos.</p>
          <p>Você pode mudar sua escolha em Ajustes. Ao desativar, as próximas solicitações deixam de incluir mensagens anteriores; um processamento já iniciado não pode ser desfeito.</p>
          <p>Para gerar as respostas, o texto é processado pelo provedor de inteligência artificial Google Cloud.</p>
        </div>
      </details>
      {loading ? <p role="status">Verificando sua preferência…</p> : settings ? (
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm">Permitir contexto da conversa</span>
          <button type="button" role="switch" aria-checked={enabled === true} aria-label="Permitir contexto da conversa" disabled={saving} onClick={() => void save(enabled !== true)} className={`relative flex h-11 w-14 shrink-0 items-center rounded-full p-1 transition-colors disabled:opacity-50 ${enabled ? "bg-primary" : "bg-muted"}`}>
            <span className={`h-6 w-6 rounded-full bg-surface shadow-sm transition-transform ${enabled ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button disabled={saving} onClick={() => void save(true)}>Permitir contexto</Button>
          <Button variant="outline" disabled={saving} onClick={() => void save(false)}>Continuar sem contexto</Button>
        </div>
      )}
      {saving && <p role="status" className="text-xs">Salvando sua escolha…</p>}
      {error && <p role="alert" className="text-xs text-destructive">Não foi possível carregar ou salvar a preferência. O contexto só será usado após uma autorização salva. Tente novamente.</p>}
    </Surface>
  );
}
