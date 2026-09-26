import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft01Icon, HistoryIcon } from "@hugeicons/core-free-icons";
import { CheckinHistoryList } from "@/components/shared/checkin";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { InlineFeedback } from "@/components/ui/surface";
import { deleteCareCheckin, getCareCheckinHistory } from "@/services/checkinService";
import type { CareCheckinHistoryItem } from "@/types";

const PAGE_SIZE = 20;

export function CheckinHistoryPage() {
  const [items, setItems] = useState<CareCheckinHistoryItem[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const load = async (nextPage = 0, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const nextItems = await getCareCheckinHistory(nextPage, PAGE_SIZE);
      setItems((current) => append ? [...current, ...nextItems] : nextItems);
      setPage(nextPage);
      setHasMore(nextItems.length === PAGE_SIZE);
    } catch {
      setError("Não conseguimos carregar seu histórico agora.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const remove = async (id: string) => {
    setDeletingId(id);
    setError(null);
    try {
      await deleteCareCheckin(id);
      setItems((current) => current.filter((item) => item.id !== id));
      setPendingDeleteId(null);
    } catch {
      setError("Não conseguimos excluir esse registro agora.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      <div className="flex items-start gap-3">
        <Button asChild variant="ghost" size="icon" className="shrink-0">
          <Link to="/check-in" aria-label="Voltar ao check-in">
            <AlumiaIcon icon={ArrowLeft01Icon} size="sm" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <AlumiaIcon icon={HistoryIcon} size="md" className="module-text" />
            <h2 className="text-xl font-semibold sm:text-2xl">Seu histórico emocional</h2>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Estes registros são privados e pertencem somente a você.
          </p>
        </div>
      </div>

      {error && <InlineFeedback tone="danger">{error}</InlineFeedback>}
      {loading && items.length === 0 ? (
        <p role="status" className="py-12 text-center text-sm text-muted-foreground">Preparando seus registros…</p>
      ) : (
        <CheckinHistoryList items={items} onDelete={setPendingDeleteId} deletingId={deletingId} />
      )}
      {hasMore && (
        <div className="flex justify-center">
          <Button type="button" variant="outline" disabled={loading} onClick={() => void load(page + 1, true)}>
            {loading ? "Carregando…" : "Ver registros anteriores"}
          </Button>
        </div>
      )}
      <AlertDialog open={Boolean(pendingDeleteId)} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
        <AlertDialogContent className="mx-4 max-w-sm rounded-2xl p-5">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir este registro?</AlertDialogTitle>
            <AlertDialogDescription>
              Ele será removido do seu histórico emocional. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter registro</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!pendingDeleteId || Boolean(deletingId)}
              onClick={(event) => {
                event.preventDefault();
                if (pendingDeleteId) void remove(pendingDeleteId);
              }}
            >
              {deletingId ? "Excluindo…" : "Excluir registro"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
