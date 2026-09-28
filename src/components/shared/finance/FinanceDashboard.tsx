import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  Add01Icon, ArrowDown01Icon, ArrowRight01Icon, ArrowUp01Icon, BanknoteIcon,
  Calendar01Icon, Chart01Icon, CheckmarkCircle02Icon, CreditCardIcon, EyeIcon,
  EyeOffIcon, Home01Icon, Invoice02Icon, MoneySavingJarIcon, PiggyBankIcon,
  ShoppingBasket02Icon, Target02Icon, Wallet02Icon,
} from "@hugeicons/core-free-icons";
import { AlumiaModuleIntro } from "@/components/shared/AlumiaModuleIntro";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { InlineFeedback, SectionHeader, Surface } from "@/components/ui/surface";
import { ALUMIA_AVATAR_IMAGES } from "@/lib/alumia-avatar";
import { cn } from "@/lib/utils";
import {
  addFinanceGoalContribution, createFinanceGoal, createFinanceObligation,
  createFinanceTransaction, getFinanceDashboardData, payFinanceObligation,
} from "@/services/financeService";
import type {
  CreateFinanceGoalInput, CreateFinanceObligationInput, CreateFinanceTransactionInput,
  FinanceDashboardData, FinanceGoal, FinanceObligation, FinanceTransaction,
  FinanceTransactionKind,
} from "@/types";

type FinanceView = "overview" | "activity" | "bills" | "goals";
const emptyData: FinanceDashboardData = { transactions: [], obligations: [], goals: [] };
const tabs: Array<{ id: FinanceView; label: string; shortLabel?: string }> = [
  { id: "overview", label: "Visão geral", shortLabel: "Resumo" },
  { id: "activity", label: "Movimentos" },
  { id: "bills", label: "Contas e dívidas", shortLabel: "Contas" },
  { id: "goals", label: "Cofrinhos" },
];
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const shortDate = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
const dateTime = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

function parseMoney(value: string) {
  const parsed = Number(value.trim().replace(/\s/g, "").replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}
function Money({ value, hidden = false, className }: { value: number; hidden?: boolean; className?: string }) {
  return <span className={className}>{hidden ? "R$ ••••" : currency.format(value)}</span>;
}
function EmptyHint({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className="rounded-xl bg-surface-subtle px-3 py-3 text-sm text-muted-foreground"><p>{children}</p>{action && <div className="mt-3">{action}</div>}</div>;
}
function isCurrentMonth(iso: string) {
  const value = new Date(iso); const now = new Date();
  return value.getFullYear() === now.getFullYear() && value.getMonth() === now.getMonth();
}
function obligationDetail(item: FinanceObligation) {
  if (item.status === "paid") return item.paidAt ? `Paga em ${shortDate.format(new Date(item.paidAt))}` : "Paga";
  const due = new Date(`${item.dueDate}T12:00:00`); const today = new Date(); today.setHours(0, 0, 0, 0);
  const days = Math.round((due.getTime() - today.getTime()) / 86_400_000);
  if (days < 0) return `Venceu há ${Math.abs(days)} dia${days === -1 ? "" : "s"}`;
  if (days === 0) return "Vence hoje";
  if (days === 1) return "Vence amanhã";
  return `Vence em ${shortDate.format(due)}`;
}
function isUrgent(item: FinanceObligation) {
  return item.status === "pending" && new Date(`${item.dueDate}T23:59:59`).getTime() - Date.now() <= 3 * 86_400_000;
}

export function FinanceDashboard() {
  const [view, setView] = useState<FinanceView>("overview");
  const [data, setData] = useState<FinanceDashboardData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showValues, setShowValues] = useState(true);
  const [transactionOpen, setTransactionOpen] = useState(false);
  const [obligationOpen, setObligationOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [contributionGoal, setContributionGoal] = useState<FinanceGoal | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await getFinanceDashboardData()); }
    catch { setError("Não conseguimos carregar seus dados financeiros agora."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const refreshAfter = async (message: string) => { await load(); setFeedback(message); };
  const pay = async (id: string) => {
    setPayingId(id); setError(null);
    try { await payFinanceObligation(id); await refreshAfter("Pagamento registrado. A conta e o movimento foram atualizados juntos."); }
    catch { setError("Não conseguimos marcar essa conta como paga agora."); }
    finally { setPayingId(null); }
  };
  const currentMonth = useMemo(() => data.transactions.filter((item) => isCurrentMonth(item.occurredAt)), [data.transactions]);
  const totals = useMemo(() => currentMonth.reduce((result, item) => { result[item.kind] += item.amount; return result; }, { income: 0, expense: 0 }), [currentMonth]);

  return <section className="mx-auto max-w-6xl space-y-3">
    <div className="flex items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-2.5"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary"><AlumiaIcon icon={Wallet02Icon} size="md" /></span><div className="min-w-0"><h2 className="font-display text-xl font-semibold sm:text-2xl">Financeiro</h2><p className="truncate text-sm text-muted-foreground">Clareza para escolher, sem cobranças.</p></div></div><Button size="sm" aria-label="Novo lançamento" onClick={() => setTransactionOpen(true)}><AlumiaIcon icon={Add01Icon} size="sm" /><span className="hidden min-[430px]:inline">Novo lançamento</span><span className="min-[430px]:hidden">Adicionar</span></Button></div>
    <AlumiaModuleIntro image={ALUMIA_AVATAR_IMAGES.finance} imageAlt="Alumia cuidando da organização da casa" icon={Home01Icon} title="Cuidar das contas também é autocuidado" description="A Alumia ajuda você a olhar entradas, gastos e planos com clareza — sem culpa e sem sustos." />
    {error && <InlineFeedback tone="danger">{error} <button type="button" onClick={load} className="font-semibold underline">Tentar novamente</button></InlineFeedback>}
    {feedback && <InlineFeedback tone="success">{feedback}</InlineFeedback>}
    <div className="overflow-x-auto pb-0.5" aria-label="Áreas do módulo financeiro"><div className="grid min-w-[34rem] grid-cols-4 gap-1 rounded-2xl border bg-surface p-1 shadow-[var(--shadow-card)]" role="tablist">{tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-label={tab.label} aria-selected={view === tab.id} onClick={() => setView(tab.id)} className={cn("min-h-10 rounded-xl px-3 text-sm font-semibold transition-colors", view === tab.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground")}><span className="sm:hidden">{tab.shortLabel || tab.label}</span><span className="hidden sm:inline">{tab.label}</span></button>)}</div></div>
    {loading ? <div className="space-y-3" aria-label="Carregando dados financeiros"><div className="h-52 animate-pulse rounded-2xl bg-muted" /><div className="h-36 animate-pulse rounded-2xl bg-muted" /></div> : <>
      {view === "overview" && <Overview transactions={currentMonth} obligations={data.obligations} goals={data.goals} income={totals.income} expenses={totals.expense} showValues={showValues} onToggleValues={() => setShowValues((value) => !value)} onViewChange={setView} onAddTransaction={() => setTransactionOpen(true)} />}
      {view === "activity" && <Activity transactions={data.transactions} showValues={showValues} onAdd={() => setTransactionOpen(true)} />}
      {view === "bills" && <Bills obligations={data.obligations} payingId={payingId} onPay={pay} onAdd={() => setObligationOpen(true)} />}
      {view === "goals" && <Goals goals={data.goals} onAdd={() => setGoalOpen(true)} onContribute={setContributionGoal} />}
    </>}
    <TransactionDialog open={transactionOpen} onOpenChange={setTransactionOpen} onSave={async (input) => { await createFinanceTransaction(input); await refreshAfter("Movimento guardado na sua conta."); setView("activity"); }} />
    <ObligationDialog open={obligationOpen} onOpenChange={setObligationOpen} onSave={async (input) => { await createFinanceObligation(input); await refreshAfter("Compromisso adicionado com cuidado."); }} />
    <GoalDialog open={goalOpen} onOpenChange={setGoalOpen} onSave={async (input) => { await createFinanceGoal(input); await refreshAfter("Seu novo cofrinho está pronto."); }} />
    <ContributionDialog goal={contributionGoal} onClose={() => setContributionGoal(null)} onSave={async (amount) => { if (!contributionGoal) return; await addFinanceGoalContribution(contributionGoal.id, amount); await refreshAfter("Valor guardado no seu cofrinho."); }} />
  </section>;
}

function Overview({ transactions, obligations, goals, income, expenses, showValues, onToggleValues, onViewChange, onAddTransaction }: { transactions: FinanceTransaction[]; obligations: FinanceObligation[]; goals: FinanceGoal[]; income: number; expenses: number; showValues: boolean; onToggleValues: () => void; onViewChange: (view: FinanceView) => void; onAddTransaction: () => void }) {
  const open = obligations.filter((item) => item.status === "pending");
  const activeGoal = goals.find((item) => item.status === "active");
  const categories = Array.from(transactions.filter((item) => item.kind === "expense").reduce((map, item) => { const key = item.category || "Sem categoria"; map.set(key, (map.get(key) ?? 0) + item.amount); return map; }, new Map<string, number>()).entries()).sort((a, b) => b[1] - a[1]);
  const maxCategory = categories[0]?.[1] ?? 1;
  return <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]"><div className="space-y-3">
    <Surface className="module-surface relative overflow-hidden p-4 sm:p-5"><div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-primary/10" /><div className="relative flex items-start justify-between gap-3"><div><p className="text-sm font-semibold module-text">Seu mês, sem julgamento</p><p className="mt-3 text-sm text-muted-foreground">Saldo registrado</p><Money value={income - expenses} hidden={!showValues} className="mt-0.5 block font-display text-3xl font-bold tracking-tight sm:text-4xl" /></div><button type="button" onClick={onToggleValues} className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface/75 text-muted-foreground hover:text-foreground" aria-label={showValues ? "Ocultar valores" : "Mostrar valores"}><AlumiaIcon icon={showValues ? EyeOffIcon : EyeIcon} size="sm" /></button></div><div className="relative mt-5 grid grid-cols-2 gap-2"><div className="rounded-xl bg-surface/75 p-3"><div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><AlumiaIcon icon={ArrowDown01Icon} size="xs" className="text-success-foreground" />Entradas</div><Money value={income} hidden={!showValues} className="mt-1 block text-base font-bold" /></div><div className="rounded-xl bg-surface/75 p-3"><div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><AlumiaIcon icon={ArrowUp01Icon} size="xs" className="text-tone-rose-fg" />Saídas</div><Money value={expenses} hidden={!showValues} className="mt-1 block text-base font-bold" /></div></div>{!transactions.length && <p className="relative mt-3 text-sm text-foreground/80">Ainda não há movimentos neste mês. Comece quando fizer sentido para você.</p>}</Surface>
    <Surface className="p-4"><SectionHeader icon={Chart01Icon} iconClassName="module-text" title="Para onde o dinheiro foi" description="Uma visão simples das suas saídas neste mês." />{categories.length ? <div className="mt-4 space-y-3">{categories.map(([label, amount]) => <div key={label} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-2 text-sm"><span className="truncate font-medium">{label}</span><div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.round(amount / maxCategory * 100)}%` }} /></div><Money value={amount} className="w-20 text-right text-xs font-semibold text-muted-foreground" /></div>)}</div> : <div className="mt-4"><EmptyHint action={<Button size="sm" variant="outline" onClick={onAddTransaction}>Registrar primeiro movimento</Button>}>As categorias aparecerão aqui conforme você registrar suas saídas.</EmptyHint></div>}</Surface>
  </div><aside className="space-y-3"><Surface className="p-4"><SectionHeader icon={Calendar01Icon} iconClassName="module-text" title="Próximos compromissos" description="O que merece atenção primeiro." action={<button type="button" onClick={() => onViewChange("bills")} className="text-xs font-semibold text-primary hover:underline">Ver todos</button>} />{open.length ? <ul className="mt-3 divide-y divide-border">{open.slice(0, 3).map((item) => <li key={item.id} className="flex items-center gap-3 py-3 first:pt-1 last:pb-0"><span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", isUrgent(item) ? "bg-warning text-warning-foreground" : "bg-muted text-muted-foreground")}><AlumiaIcon icon={Invoice02Icon} size="sm" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.title}</p><p className="text-xs text-muted-foreground">{obligationDetail(item)}</p></div><Money value={item.amount} className="text-sm font-bold" /></li>)}</ul> : <div className="mt-3"><EmptyHint>Nenhuma conta pendente cadastrada.</EmptyHint></div>}</Surface>
    {activeGoal ? <button type="button" onClick={() => onViewChange("goals")} className="w-full text-left"><Surface variant="interactive" className="module-whisper p-4"><div className="flex items-center gap-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary"><AlumiaIcon icon={MoneySavingJarIcon} size="lg" /></span><div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-wide module-text">Seu cofrinho</p><h3 className="truncate font-display text-lg font-semibold">{activeGoal.title}</h3></div><AlumiaIcon icon={ArrowRight01Icon} size="sm" className="text-muted-foreground" /></div><div className="mt-3 flex justify-between text-xs"><span className="font-semibold"><Money value={activeGoal.currentAmount} /> guardados</span><span className="text-muted-foreground">{Math.min(100, Math.round(activeGoal.currentAmount / activeGoal.targetAmount * 100))}%</span></div><Progress value={Math.min(100, activeGoal.currentAmount / activeGoal.targetAmount * 100)} className="mt-2" /></Surface></button> : <Surface className="p-4"><EmptyHint>Quando você criar um cofrinho, o progresso aparecerá aqui.</EmptyHint></Surface>}
  </aside></div>;
}

function Activity({ transactions, showValues, onAdd }: { transactions: FinanceTransaction[]; showValues: boolean; onAdd: () => void }) {
  return <Surface className="p-4 sm:p-5"><SectionHeader icon={Wallet02Icon} iconClassName="module-text" title="Seus movimentos" description="Tudo o que entrou e saiu, com espaço para ajustar depois." action={<Button size="sm" variant="outline" onClick={onAdd}><AlumiaIcon icon={Add01Icon} size="xs" />Adicionar</Button>} />{transactions.length ? <ul className="mt-4 divide-y divide-border">{transactions.map((item) => <li key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"><span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", item.kind === "income" ? "bg-success text-success-foreground" : "bg-surface-subtle text-muted-foreground")}><AlumiaIcon icon={item.kind === "income" ? BanknoteIcon : ShoppingBasket02Icon} size="sm" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.title}</p><p className="text-xs text-muted-foreground">{item.category || "Sem categoria"} · {dateTime.format(new Date(item.occurredAt))}</p></div><div className="text-right"><Money value={item.amount} hidden={!showValues} className={cn("text-sm font-bold", item.kind === "income" && "text-success-foreground")} /><p className="mt-0.5 text-[0.7rem] text-muted-foreground">{item.kind === "income" ? "entrou" : "saiu"}</p></div></li>)}</ul> : <div className="mt-4"><EmptyHint action={<Button size="sm" onClick={onAdd}>Registrar primeiro movimento</Button>}>Seu histórico começa vazio e será preenchido apenas com os seus registros.</EmptyHint></div>}</Surface>;
}

function Bills({ obligations, payingId, onPay, onAdd }: { obligations: FinanceObligation[]; payingId: string | null; onPay: (id: string) => void; onAdd: () => void }) {
  const open = obligations.filter((item) => item.status === "pending"); const total = open.reduce((sum, item) => sum + item.amount, 0); const debts = open.filter((item) => item.kind === "debt");
  return <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]"><Surface className="p-4 sm:p-5"><SectionHeader icon={Invoice02Icon} iconClassName="module-text" title="Contas e parcelas" description="Antecipar já é uma forma de cuidado. Uma conta por vez." action={<Button size="sm" variant="outline" onClick={onAdd}><AlumiaIcon icon={Add01Icon} size="xs" />Adicionar</Button>} />{obligations.length ? <div className="mt-4 space-y-2.5">{obligations.map((item) => <article key={item.id} className={cn("flex flex-col gap-3 rounded-2xl border p-3.5 sm:flex-row sm:items-center", item.status === "paid" ? "bg-success/25" : isUrgent(item) ? "border-warning/60 bg-warning/25" : "bg-surface-subtle/50")}><span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", item.status === "paid" ? "bg-success text-success-foreground" : isUrgent(item) ? "bg-warning text-warning-foreground" : "bg-surface text-muted-foreground")}><AlumiaIcon icon={item.status === "paid" ? CheckmarkCircle02Icon : item.kind === "debt" ? CreditCardIcon : Invoice02Icon} size="sm" /></span><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold">{item.title}</h3><p className="mt-0.5 text-xs text-muted-foreground">{obligationDetail(item)}</p></div><Money value={item.amount} className="text-base font-bold" />{item.status === "pending" && <Button size="sm" variant={isUrgent(item) ? "default" : "outline"} disabled={payingId === item.id} onClick={() => onPay(item.id)}>{payingId === item.id ? "Guardando..." : "Marcar como paga"}</Button>}</article>)}</div> : <div className="mt-4"><EmptyHint action={<Button size="sm" onClick={onAdd}>Adicionar uma conta</Button>}>Você ainda não cadastrou contas ou dívidas.</EmptyHint></div>}</Surface><aside className="space-y-3"><Surface className="module-surface p-4"><p className="text-sm font-semibold module-text">Ainda neste ciclo</p><Money value={total} className="mt-2 block font-display text-3xl font-bold" /><p className="mt-1 text-sm leading-relaxed text-muted-foreground">Somando {open.length} compromisso{open.length === 1 ? "" : "s"}. Isso é uma fotografia, não uma cobrança.</p></Surface><Surface className="p-4"><div className="flex items-center gap-2"><AlumiaIcon icon={CreditCardIcon} size="sm" className="module-text" /><h3 className="font-display text-base font-semibold">Dívidas com clareza</h3></div><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Parcelas e acordos ficam reunidos aqui, mostrando o que precisa de atenção.</p><div className="mt-3"><EmptyHint>{debts.length ? `${debts.length} dívida${debts.length === 1 ? "" : "s"} pendente${debts.length === 1 ? "" : "s"}.` : "Nenhuma dívida pendente cadastrada."}</EmptyHint></div></Surface></aside></div>;
}

function Goals({ goals, onAdd, onContribute }: { goals: FinanceGoal[]; onAdd: () => void; onContribute: (goal: FinanceGoal) => void }) {
  return <div className="space-y-3"><Surface className="module-surface p-4 sm:p-5"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary"><AlumiaIcon icon={PiggyBankIcon} size="xl" /></span><div><p className="text-sm font-semibold module-text">Um futuro feito aos poucos</p><h2 className="font-display text-xl font-semibold sm:text-2xl">Seus cofrinhos</h2><p className="mt-0.5 text-sm text-muted-foreground">Metas flexíveis, sem transformar sonho em pressão.</p></div></div><Button onClick={onAdd}><AlumiaIcon icon={Add01Icon} size="sm" />Novo cofrinho</Button></div></Surface>{goals.length ? <div className="grid gap-3 md:grid-cols-2">{goals.map((goal) => { const percentage = Math.min(100, Math.round(goal.currentAmount / goal.targetAmount * 100)); return <Surface key={goal.id} className="p-4 sm:p-5"><div className="flex items-start justify-between gap-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-tone-mint text-tone-mint-fg"><AlumiaIcon icon={Target02Icon} size="lg" /></span><span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">{percentage}%</span></div><h3 className="mt-3 font-display text-lg font-semibold">{goal.title}</h3>{goal.note && <p className="mt-0.5 text-sm text-muted-foreground">{goal.note}</p>}<div className="mt-4 flex items-end justify-between gap-2"><div><p className="text-xs text-muted-foreground">Você já guardou</p><Money value={goal.currentAmount} className="text-lg font-bold" /></div><p className="text-xs text-muted-foreground">de {currency.format(goal.targetAmount)}</p></div><Progress value={percentage} className="mt-2.5 h-2.5" />{goal.status === "active" && <Button className="mt-4 w-full" variant="outline" onClick={() => onContribute(goal)}><AlumiaIcon icon={Add01Icon} size="xs" />Guardar um valor</Button>}</Surface>; })}</div> : <Surface className="p-5"><EmptyHint action={<Button size="sm" onClick={onAdd}>Criar primeiro cofrinho</Button>}>Nenhuma meta foi criada. Este espaço começa vazio e só recebe o que você escolher.</EmptyHint></Surface>}</div>;
}

interface FormDialogProps<T> { open: boolean; onOpenChange: (open: boolean) => void; onSave: (input: T) => Promise<void>; }
function TransactionDialog({ open, onOpenChange, onSave }: FormDialogProps<CreateFinanceTransactionInput>) {
  const [kind, setKind] = useState<FinanceTransactionKind>("expense"); const [title, setTitle] = useState(""); const [category, setCategory] = useState(""); const [amount, setAmount] = useState(""); const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null);
  const submit = async (event: FormEvent) => { event.preventDefault(); const parsed = parseMoney(amount); if (!title.trim() || !parsed) return; setSaving(true); setError(null); try { await onSave({ title, category, amount: parsed, kind }); setTitle(""); setCategory(""); setAmount(""); onOpenChange(false); } catch { setError("Não conseguimos guardar esse movimento."); } finally { setSaving(false); } };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="module-theme-finance max-w-md rounded-[1.5rem] bg-surface p-5 sm:p-6"><DialogHeader><DialogTitle className="font-display text-xl">Registrar um movimento</DialogTitle><DialogDescription>Preencha apenas o necessário. Você continua no controle.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4"><div><Label>Que tipo de movimento foi?</Label><div className="mt-2 grid grid-cols-2 gap-2">{(["income", "expense"] as const).map((option) => <button key={option} type="button" onClick={() => setKind(option)} className={cn("flex min-h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold", kind === option ? "border-primary bg-primary/10 text-primary" : "bg-surface text-muted-foreground")}><AlumiaIcon icon={option === "income" ? ArrowDown01Icon : ArrowUp01Icon} size="sm" />{option === "income" ? "Entrada" : "Saída"}</button>)}</div></div><Field label="Descrição" id="finance-description" value={title} onChange={setTitle} placeholder="Ex.: mercado, freela, aluguel" autoFocus /><Field label="Categoria (opcional)" id="finance-category" value={category} onChange={setCategory} placeholder="Ex.: casa, alimentação" /><MoneyField value={amount} onChange={setAmount} />{error && <InlineFeedback tone="danger">{error}</InlineFeedback>}<DialogFooter><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Agora não</Button><Button type="submit" disabled={saving || !title.trim() || !parseMoney(amount)}>{saving ? "Guardando..." : "Guardar movimento"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
function ObligationDialog({ open, onOpenChange, onSave }: FormDialogProps<CreateFinanceObligationInput>) {
  const [kind, setKind] = useState<"bill" | "debt">("bill"); const [title, setTitle] = useState(""); const [amount, setAmount] = useState(""); const [dueDate, setDueDate] = useState(""); const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null);
  const submit = async (event: FormEvent) => { event.preventDefault(); const parsed = parseMoney(amount); if (!title.trim() || !parsed || !dueDate) return; setSaving(true); setError(null); try { await onSave({ title, amount: parsed, dueDate, kind }); setTitle(""); setAmount(""); setDueDate(""); onOpenChange(false); } catch { setError("Não conseguimos adicionar esse compromisso."); } finally { setSaving(false); } };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="module-theme-finance max-w-md rounded-[1.5rem] bg-surface p-5 sm:p-6"><DialogHeader><DialogTitle className="font-display text-xl">Adicionar conta ou dívida</DialogTitle><DialogDescription>Organize um compromisso por vez, sem julgamento.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4"><div className="grid grid-cols-2 gap-2">{(["bill", "debt"] as const).map((option) => <button key={option} type="button" onClick={() => setKind(option)} className={cn("min-h-11 rounded-xl border text-sm font-semibold", kind === option ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground")}>{option === "bill" ? "Conta" : "Dívida"}</button>)}</div><Field label="Nome" id="obligation-title" value={title} onChange={setTitle} placeholder="Ex.: energia, cartão" autoFocus /><MoneyField value={amount} onChange={setAmount} id="obligation-amount" /><div className="space-y-2"><Label htmlFor="obligation-date">Vencimento</Label><Input id="obligation-date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="h-11 rounded-xl bg-surface" /></div>{error && <InlineFeedback tone="danger">{error}</InlineFeedback>}<DialogFooter><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Agora não</Button><Button type="submit" disabled={saving || !title.trim() || !parseMoney(amount) || !dueDate}>{saving ? "Guardando..." : "Adicionar"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
function GoalDialog({ open, onOpenChange, onSave }: FormDialogProps<CreateFinanceGoalInput>) {
  const [title, setTitle] = useState(""); const [note, setNote] = useState(""); const [amount, setAmount] = useState(""); const [targetDate, setTargetDate] = useState(""); const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null);
  const submit = async (event: FormEvent) => { event.preventDefault(); const parsed = parseMoney(amount); if (!title.trim() || !parsed) return; setSaving(true); setError(null); try { await onSave({ title, note, targetAmount: parsed, targetDate }); setTitle(""); setNote(""); setAmount(""); setTargetDate(""); onOpenChange(false); } catch { setError("Não conseguimos criar esse cofrinho."); } finally { setSaving(false); } };
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="module-theme-finance max-w-md rounded-[1.5rem] bg-surface p-5 sm:p-6"><DialogHeader><DialogTitle className="font-display text-xl">Criar um cofrinho</DialogTitle><DialogDescription>A meta pode mudar depois. Comece com o que faz sentido agora.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4"><Field label="Nome" id="goal-title" value={title} onChange={setTitle} placeholder="Ex.: reserva, viagem" autoFocus /><Field label="Uma lembrança para você (opcional)" id="goal-note" value={note} onChange={setNote} placeholder="Por que isso importa?" /><MoneyField label="Valor da meta" value={amount} onChange={setAmount} id="goal-amount" /><div className="space-y-2"><Label htmlFor="goal-date">Data desejada (opcional)</Label><Input id="goal-date" type="date" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} className="h-11 rounded-xl bg-surface" /></div>{error && <InlineFeedback tone="danger">{error}</InlineFeedback>}<DialogFooter><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Agora não</Button><Button type="submit" disabled={saving || !title.trim() || !parseMoney(amount)}>{saving ? "Criando..." : "Criar cofrinho"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
function ContributionDialog({ goal, onClose, onSave }: { goal: FinanceGoal | null; onClose: () => void; onSave: (amount: number) => Promise<void> }) {
  const [amount, setAmount] = useState(""); const [saving, setSaving] = useState(false); const [error, setError] = useState<string | null>(null);
  const submit = async (event: FormEvent) => { event.preventDefault(); const parsed = parseMoney(amount); if (!parsed) return; setSaving(true); setError(null); try { await onSave(parsed); setAmount(""); onClose(); } catch { setError("Não conseguimos guardar esse valor agora."); } finally { setSaving(false); } };
  return <Dialog open={Boolean(goal)} onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="module-theme-finance max-w-md rounded-[1.5rem] bg-surface p-5 sm:p-6"><DialogHeader><DialogTitle className="font-display text-xl">Guardar em {goal?.title}</DialogTitle><DialogDescription>Cada valor conta, sem obrigação de manter sempre o mesmo ritmo.</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4"><MoneyField value={amount} onChange={setAmount} id="contribution-amount" autoFocus />{error && <InlineFeedback tone="danger">{error}</InlineFeedback>}<DialogFooter><Button type="button" variant="ghost" onClick={onClose}>Agora não</Button><Button type="submit" disabled={saving || !parseMoney(amount)}>{saving ? "Guardando..." : "Guardar valor"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
function Field({ label, id, value, onChange, placeholder, autoFocus }: { label: string; id: string; value: string; onChange: (value: string) => void; placeholder?: string; autoFocus?: boolean }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} className="h-11 rounded-xl bg-surface" placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} autoFocus={autoFocus} /></div>;
}
function MoneyField({ value, onChange, id = "finance-amount", label = "Valor", autoFocus }: { value: string; onChange: (value: string) => void; id?: string; label?: string; autoFocus?: boolean }) {
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">R$</span><Input id={id} inputMode="decimal" className="h-11 rounded-xl bg-surface pl-10" placeholder="0,00" value={value} onChange={(event) => onChange(event.target.value)} autoFocus={autoFocus} /></div></div>;
}
