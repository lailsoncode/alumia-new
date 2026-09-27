import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  BanknoteIcon,
  Calendar01Icon,
  Chart01Icon,
  CheckmarkCircle02Icon,
  CreditCardIcon,
  EyeIcon,
  EyeOffIcon,
  Home01Icon,
  Invoice02Icon,
  MoneySavingJarIcon,
  MoreHorizontalIcon,
  PiggyBankIcon,
  ShoppingBasket02Icon,
  Target02Icon,
  Wallet02Icon,
} from "@hugeicons/core-free-icons";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { SectionHeader, Surface } from "@/components/ui/surface";
import { cn } from "@/lib/utils";

type FinanceView = "overview" | "activity" | "bills" | "goals";
type TransactionKind = "income" | "expense";

interface Transaction {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  kind: TransactionKind;
  icon: IconSvgElement;
}

interface Bill {
  id: string;
  title: string;
  detail: string;
  amount: number;
  status: "soon" | "planned" | "paid";
}

const initialTransactions: Transaction[] = [
  { id: "salary", title: "Salário", category: "Entrada", date: "Hoje, 08:12", amount: 5400, kind: "income", icon: BanknoteIcon },
  { id: "market", title: "Mercado do bairro", category: "Alimentação", date: "Ontem, 18:40", amount: 186.42, kind: "expense", icon: ShoppingBasket02Icon },
  { id: "rent", title: "Aluguel", category: "Casa", date: "25 set", amount: 1200, kind: "expense", icon: Home01Icon },
  { id: "reserve", title: "Reserva do mês", category: "Cofrinho", date: "23 set", amount: 250, kind: "expense", icon: PiggyBankIcon },
];

const initialBills: Bill[] = [
  { id: "energy", title: "Energia", detail: "Vence amanhã", amount: 184.6, status: "soon" },
  { id: "internet", title: "Internet", detail: "Vence em 4 dias", amount: 99.9, status: "planned" },
  { id: "card", title: "Cartão principal", detail: "Vence em 8 dias", amount: 623.18, status: "planned" },
  { id: "course", title: "Curso — parcela 5/10", detail: "Pago em 22 set", amount: 149, status: "paid" },
];

const goals = [
  { id: "calm", title: "Reserva de tranquilidade", note: "Um pouco de segurança, no seu tempo", current: 1850, target: 5000, tone: "bg-tone-mint text-tone-mint-fg", icon: MoneySavingJarIcon },
  { id: "trip", title: "Minha viagem", note: "Cada passo já conta", current: 720, target: 2400, tone: "bg-tone-sky text-tone-sky-fg", icon: Target02Icon },
];

const spending = [
  { label: "Casa", amount: 1200, percent: 100, color: "bg-primary" },
  { label: "Alimentação", amount: 642, percent: 54, color: "bg-tone-peach-fg" },
  { label: "Transporte", amount: 398, percent: 33, color: "bg-tone-sky-fg" },
  { label: "Bem-estar", amount: 320, percent: 27, color: "bg-tone-lavender-fg" },
];

const tabs: Array<{ id: FinanceView; label: string; shortLabel?: string }> = [
  { id: "overview", label: "Visão geral", shortLabel: "Resumo" },
  { id: "activity", label: "Movimentos" },
  { id: "bills", label: "Contas e dívidas", shortLabel: "Contas" },
  { id: "goals", label: "Cofrinhos" },
];

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function Money({ value, hidden = false, className }: { value: number; hidden?: boolean; className?: string }) {
  return <span className={className}>{hidden ? "R$ ••••" : currency.format(value)}</span>;
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl bg-surface-subtle px-3 py-2.5 text-sm text-muted-foreground">{children}</p>;
}

export function FinanceDashboard() {
  const [view, setView] = useState<FinanceView>("overview");
  const [showValues, setShowValues] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [kind, setKind] = useState<TransactionKind>("expense");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState(initialTransactions);
  const [bills, setBills] = useState(initialBills);
  const [savedExtra, setSavedExtra] = useState(0);

  const totals = useMemo(() => transactions.reduce((result, item) => {
    result[item.kind] += item.amount;
    return result;
  }, { income: 0, expense: 0 }), [transactions]);
  const balance = totals.income - totals.expense;

  const submitTransaction = (event: FormEvent) => {
    event.preventDefault();
    const parsedAmount = Number(amount.replace(/\./g, "").replace(",", "."));
    if (!description.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
    setTransactions((current) => [{
      id: `transaction-${Date.now()}`,
      title: description.trim(),
      category: kind === "income" ? "Entrada" : "Novo movimento",
      date: "Agora",
      amount: parsedAmount,
      kind,
      icon: kind === "income" ? BanknoteIcon : Wallet02Icon,
    }, ...current]);
    setDescription("");
    setAmount("");
    setDialogOpen(false);
    setView("activity");
  };

  return (
    <section className="mx-auto max-w-6xl space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <AlumiaIcon icon={Wallet02Icon} size="md" />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-xl font-semibold sm:text-2xl">Financeiro</h2>
            <p className="truncate text-sm text-muted-foreground">Clareza para escolher, sem cobranças.</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <AlumiaIcon icon={Add01Icon} size="sm" />
          <span className="hidden min-[430px]:inline">Novo lançamento</span>
          <span className="min-[430px]:hidden">Adicionar</span>
        </Button>
      </div>

      <div className="overflow-x-auto pb-0.5" aria-label="Áreas do módulo financeiro">
        <div className="grid min-w-[34rem] grid-cols-4 gap-1 rounded-2xl border bg-surface p-1 shadow-[var(--shadow-card)]" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={view === tab.id}
              onClick={() => setView(tab.id)}
              className={cn(
                "min-h-10 rounded-xl px-3 text-sm font-semibold transition-colors",
                view === tab.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span className="sm:hidden">{tab.shortLabel || tab.label}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {view === "overview" && (
        <Overview
          balance={balance}
          income={totals.income}
          expenses={totals.expense}
          showValues={showValues}
          bills={bills}
          onToggleValues={() => setShowValues((current) => !current)}
          onViewChange={setView}
        />
      )}
      {view === "activity" && <Activity transactions={transactions} showValues={showValues} onAdd={() => setDialogOpen(true)} />}
      {view === "bills" && <Bills bills={bills} onPay={(id) => setBills((current) => current.map((bill) => bill.id === id ? { ...bill, detail: "Pago hoje", status: "paid" } : bill))} />}
      {view === "goals" && <Goals savedExtra={savedExtra} onSave={() => setSavedExtra((current) => current + 50)} />}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="module-theme-finance max-w-md rounded-[1.5rem] bg-surface p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Registrar um movimento</DialogTitle>
            <DialogDescription>Do jeito que der hoje. Você pode completar os detalhes depois.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitTransaction} className="space-y-4">
            <div>
              <Label>Que tipo de movimento foi?</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {(["income", "expense"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setKind(option)}
                    className={cn("flex min-h-11 items-center justify-center gap-2 rounded-xl border text-sm font-semibold", kind === option ? "border-primary bg-primary/10 text-primary" : "bg-surface text-muted-foreground")}
                  >
                    <AlumiaIcon icon={option === "income" ? ArrowDown01Icon : ArrowUp01Icon} size="sm" />
                    {option === "income" ? "Entrada" : "Saída"}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="finance-description">Descrição</Label>
              <Input id="finance-description" className="h-11 rounded-xl bg-surface" placeholder="Ex.: mercado, freela, aluguel" value={description} onChange={(event) => setDescription(event.target.value)} autoFocus />
            </div>
            <div className="space-y-2">
              <Label htmlFor="finance-amount">Valor</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">R$</span>
                <Input id="finance-amount" inputMode="decimal" className="h-11 rounded-xl bg-surface pl-10" placeholder="0,00" value={amount} onChange={(event) => setAmount(event.target.value)} />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Agora não</Button>
              <Button type="submit" disabled={!description.trim() || !amount}>Guardar movimento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Overview({ balance, income, expenses, showValues, bills, onToggleValues, onViewChange }: {
  balance: number;
  income: number;
  expenses: number;
  showValues: boolean;
  bills: Bill[];
  onToggleValues: () => void;
  onViewChange: (view: FinanceView) => void;
}) {
  return (
    <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
      <div className="space-y-3">
        <Surface className="module-surface relative overflow-hidden p-4 sm:p-5">
          <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-primary/10" />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold module-text">Seu mês, sem julgamento</p>
              <p className="mt-3 text-sm text-muted-foreground">Saldo disponível</p>
              <Money value={balance} hidden={!showValues} className="mt-0.5 block font-display text-3xl font-bold tracking-tight sm:text-4xl" />
            </div>
            <button type="button" onClick={onToggleValues} className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface/75 text-muted-foreground hover:text-foreground" aria-label={showValues ? "Ocultar valores" : "Mostrar valores"}>
              <AlumiaIcon icon={showValues ? EyeOffIcon : EyeIcon} size="sm" />
            </button>
          </div>
          <div className="relative mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-surface/75 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><AlumiaIcon icon={ArrowDown01Icon} size="xs" className="text-success-foreground" />Entradas</div>
              <Money value={income} hidden={!showValues} className="mt-1 block text-base font-bold" />
            </div>
            <div className="rounded-xl bg-surface/75 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><AlumiaIcon icon={ArrowUp01Icon} size="xs" className="text-tone-rose-fg" />Saídas</div>
              <Money value={expenses} hidden={!showValues} className="mt-1 block text-base font-bold" />
            </div>
          </div>
          <p className="relative mt-3 flex items-center gap-2 text-sm leading-relaxed text-foreground/80">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success text-success-foreground"><AlumiaIcon icon={CheckmarkCircle02Icon} size="xs" /></span>
            As contas essenciais deste mês cabem no seu saldo atual. Respira: você está acompanhando.
          </p>
        </Surface>

        <Surface className="p-4">
          <SectionHeader icon={Chart01Icon} iconClassName="module-text" title="Para onde o dinheiro foi" description="Uma visão simples das suas saídas neste mês." />
          <div className="mt-4 space-y-3">
            {spending.map((item) => (
              <div key={item.label} className="grid grid-cols-[5.5rem_1fr_auto] items-center gap-2 text-sm">
                <span className="font-medium">{item.label}</span>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.percent}%` }} /></div>
                <Money value={item.amount} className="w-20 text-right text-xs font-semibold text-muted-foreground" />
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl bg-success/55 px-3 py-2.5 text-sm leading-relaxed text-success-foreground">
            Você gastou <strong>12% menos</strong> com alimentação do que no mês passado. Sem meta rígida — só um sinal gentil do seu caminho.
          </div>
        </Surface>
      </div>

      <aside className="space-y-3">
        <Surface className="p-4">
          <SectionHeader
            icon={Calendar01Icon}
            iconClassName="module-text"
            title="Próximos compromissos"
            description="O que merece atenção primeiro."
            action={<button type="button" onClick={() => onViewChange("bills")} className="text-xs font-semibold text-primary hover:underline">Ver todos</button>}
          />
          <ul className="mt-3 divide-y divide-border">
            {bills.filter((bill) => bill.status !== "paid").slice(0, 3).map((bill) => (
              <li key={bill.id} className="flex items-center gap-3 py-3 first:pt-1 last:pb-0">
                <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", bill.status === "soon" ? "bg-warning text-warning-foreground" : "bg-muted text-muted-foreground")}><AlumiaIcon icon={Invoice02Icon} size="sm" /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{bill.title}</p><p className="text-xs text-muted-foreground">{bill.detail}</p></div>
                <Money value={bill.amount} className="text-sm font-bold" />
              </li>
            ))}
          </ul>
        </Surface>

        <button type="button" onClick={() => onViewChange("goals")} className="w-full text-left">
          <Surface variant="interactive" className="module-whisper p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary"><AlumiaIcon icon={MoneySavingJarIcon} size="lg" /></span>
              <div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-wide module-text">Seu cofrinho</p><h3 className="font-display text-lg font-semibold">Reserva de tranquilidade</h3></div>
              <AlumiaIcon icon={ArrowRight01Icon} size="sm" className="text-muted-foreground" />
            </div>
            <div className="mt-3 flex justify-between text-xs"><span className="font-semibold">R$ 1.850 guardados</span><span className="text-muted-foreground">37%</span></div>
            <Progress value={37} className="mt-2" />
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Você já construiu 37% desse cuidado. Cada valor conta.</p>
          </Surface>
        </button>
      </aside>
    </div>
  );
}

function Activity({ transactions, showValues, onAdd }: { transactions: Transaction[]; showValues: boolean; onAdd: () => void }) {
  return (
    <Surface className="p-4 sm:p-5">
      <SectionHeader
        icon={Wallet02Icon}
        iconClassName="module-text"
        title="Seus movimentos"
        description="Tudo o que entrou e saiu, com espaço para ajustar depois."
        action={<Button size="sm" variant="outline" onClick={onAdd}><AlumiaIcon icon={Add01Icon} size="xs" />Adicionar</Button>}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground">Todos</span>
        <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">Entradas</span>
        <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">Saídas</span>
      </div>
      <ul className="mt-4 divide-y divide-border">
        {transactions.map((transaction) => (
          <li key={transaction.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", transaction.kind === "income" ? "bg-success text-success-foreground" : "bg-surface-subtle text-muted-foreground")}><AlumiaIcon icon={transaction.icon} size="sm" /></span>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{transaction.title}</p><p className="text-xs text-muted-foreground">{transaction.category} · {transaction.date}</p></div>
            <div className="text-right"><Money value={transaction.amount} hidden={!showValues} className={cn("text-sm font-bold", transaction.kind === "income" && "text-success-foreground")} /><p className="mt-0.5 text-[0.7rem] text-muted-foreground">{transaction.kind === "income" ? "entrou" : "saiu"}</p></div>
            <button type="button" className="hidden h-10 w-10 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted sm:flex" aria-label={`Mais opções para ${transaction.title}`}><AlumiaIcon icon={MoreHorizontalIcon} size="sm" /></button>
          </li>
        ))}
      </ul>
    </Surface>
  );
}

function Bills({ bills, onPay }: { bills: Bill[]; onPay: (id: string) => void }) {
  const openBills = bills.filter((bill) => bill.status !== "paid");
  const total = openBills.reduce((sum, bill) => sum + bill.amount, 0);
  return (
    <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Surface className="p-4 sm:p-5">
        <SectionHeader icon={Invoice02Icon} iconClassName="module-text" title="Contas e parcelas" description="Antecipar já é uma forma de cuidado. Uma conta por vez." />
        <div className="mt-4 space-y-2.5">
          {bills.map((bill) => (
            <article key={bill.id} className={cn("flex flex-col gap-3 rounded-2xl border p-3.5 sm:flex-row sm:items-center", bill.status === "paid" ? "bg-success/25" : bill.status === "soon" ? "border-warning/60 bg-warning/25" : "bg-surface-subtle/50")}>
              <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", bill.status === "paid" ? "bg-success text-success-foreground" : bill.status === "soon" ? "bg-warning text-warning-foreground" : "bg-surface text-muted-foreground")}><AlumiaIcon icon={bill.status === "paid" ? CheckmarkCircle02Icon : Invoice02Icon} size="sm" /></span>
              <div className="min-w-0 flex-1"><h3 className="truncate text-sm font-semibold">{bill.title}</h3><p className="mt-0.5 text-xs text-muted-foreground">{bill.detail}</p></div>
              <Money value={bill.amount} className="text-base font-bold" />
              {bill.status !== "paid" && <Button size="sm" variant={bill.status === "soon" ? "default" : "outline"} onClick={() => onPay(bill.id)}>Marcar como paga</Button>}
            </article>
          ))}
        </div>
      </Surface>
      <aside className="space-y-3">
        <Surface className="module-surface p-4">
          <p className="text-sm font-semibold module-text">Ainda neste ciclo</p>
          <Money value={total} className="mt-2 block font-display text-3xl font-bold" />
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">Somando {openBills.length} compromissos. Isso é uma fotografia, não uma cobrança.</p>
        </Surface>
        <Surface className="p-4">
          <div className="flex items-center gap-2"><AlumiaIcon icon={CreditCardIcon} size="sm" className="module-text" /><h3 className="font-display text-base font-semibold">Dívidas com clareza</h3></div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Parcelas e acordos ficam reunidos aqui, mostrando quanto já foi percorrido — não apenas o que falta.</p>
          <EmptyHint>Nenhuma dívida atrasada. Se isso mudar, vamos organizar com você, sem culpa.</EmptyHint>
        </Surface>
      </aside>
    </div>
  );
}

function Goals({ savedExtra, onSave }: { savedExtra: number; onSave: () => void }) {
  return (
    <div className="space-y-3">
      <Surface className="module-surface p-4 sm:p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/12 text-primary"><AlumiaIcon icon={PiggyBankIcon} size="xl" /></span>
            <div><p className="text-sm font-semibold module-text">Um futuro feito aos poucos</p><h2 className="font-display text-xl font-semibold sm:text-2xl">Seus cofrinhos</h2><p className="mt-0.5 text-sm text-muted-foreground">Metas flexíveis, sem transformar sonho em pressão.</p></div>
          </div>
          <Button onClick={onSave}><AlumiaIcon icon={Add01Icon} size="sm" />Guardar R$ 50</Button>
        </div>
        {savedExtra > 0 && <p className="mt-3 rounded-xl bg-success px-3 py-2.5 text-sm text-success-foreground">Que bom: mais {currency.format(savedExtra)} foram guardados nesta visita. Pequenos passos também constroem segurança.</p>}
      </Surface>
      <div className="grid gap-3 md:grid-cols-2">
        {goals.map((goal, index) => {
          const current = goal.current + (index === 0 ? savedExtra : 0);
          const percentage = Math.min(100, Math.round((current / goal.target) * 100));
          return (
            <Surface key={goal.id} className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", goal.tone)}><AlumiaIcon icon={goal.icon} size="lg" /></span>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">{percentage}%</span>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold">{goal.title}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">{goal.note}</p>
              <div className="mt-4 flex items-end justify-between gap-2"><div><p className="text-xs text-muted-foreground">Você já guardou</p><Money value={current} className="text-lg font-bold" /></div><p className="text-xs text-muted-foreground">de {currency.format(goal.target)}</p></div>
              <Progress value={percentage} className="mt-2.5 h-2.5" />
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{index === 0 ? "No seu ritmo atual, esse cuidado cresce sem apertar o mês." : "Não precisa ter pressa. O plano pode mudar junto com você."}</p>
            </Surface>
          );
        })}
      </div>
    </div>
  );
}
