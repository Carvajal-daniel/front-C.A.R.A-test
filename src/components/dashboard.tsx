"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CircleHelp,
  LayoutDashboard,
  LoaderCircle,
  Plus,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Trash2,
  Wallet,
  X,
} from "lucide-react";
import { ContractFormModal } from "@/components/contract-form-modal";
import { ContractsTable } from "@/components/contracts-table";
import { HealthBadge } from "@/components/health-badge";
import { MetricCard } from "@/components/metric-card";
import { TransactionFormModal } from "@/components/transaction-form-modal";
import { TransactionsTable } from "@/components/transactions-table";
import { Modal, primaryButtonClassName } from "@/components/modal";
import {
  formatCurrency,
  getContractUsage,
} from "@/lib/finance-format";
import { useFinanceDashboard } from "@/hooks/useFinanceDashboard";
import type { Contract, Transaction } from "@/types/finance";

type Modal = "contract" | "transaction" | null;

function getMonthlyActivity(transactions: Transaction[], now: Date) {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      amount: 0,
    };
  });

  for (const transaction of transactions) {
    const date = new Date(transaction.date);
    if (Number.isNaN(date.getTime())) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const month = months.find((item) => item.key === key);
    if (month) month.amount += transaction.amount;
  }
  return months;
}

export function Dashboard() {
  const {
    contracts,
    isLoading,
    error,
    refresh,
    addContract,
    addTransaction,
    reverseTransaction,
  } = useFinanceDashboard();
  const [now, setNow] = useState<Date | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [pendingReversalId, setPendingReversalId] = useState<string | null>(null);
  const [isReversing, setIsReversing] = useState(false);
  const [actionError, setActionError] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    setNow(new Date());
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const todosLancamentos = useMemo(
    () =>
      contracts.flatMap((contract) =>
        contract.transactions.map((transaction) => ({
          ...transaction,
          contractId: contract.id,
          contractName: contract.name,
        })),
      ),
    [contracts],
  );
  const visibleTransactions = useMemo(() => {
    if (selectedContractId === null) return todosLancamentos;
    return todosLancamentos.filter(
      (transaction) => transaction.contractId === selectedContractId,
    );
  }, [todosLancamentos, selectedContractId]);
  const totalContracted = contracts.reduce((sum, contract) => sum + contract.totalAmount, 0);
  const totalConsumed = contracts.reduce((sum, contract) => sum + contract.totalUsed, 0);
  const availableBalance = contracts.reduce((sum, contract) => sum + contract.balanceAvailable, 0);
  const activeContractsWithEndDate = now
    ? contracts.flatMap((contract) => {
        const endDateTimestamp = new Date(contract.endDate).getTime();
        if (!Number.isFinite(endDateTimestamp) || endDateTimestamp < now.getTime()) {
          return [];
        }

        return [
          Math.ceil(
            (endDateTimestamp - now.getTime()) / (1000 * 60 * 60 * 24),
          ),
        ];
      })
    : [];
  const averageRemainingDays =
    activeContractsWithEndDate.length > 0
      ? Math.round(
          activeContractsWithEndDate.reduce((sum, days) => sum + days, 0) /
            activeContractsWithEndDate.length,
        )
      : null;
  const monthlyActivity = useMemo(
    () => (now ? getMonthlyActivity(todosLancamentos, now) : []),
    [todosLancamentos, now],
  );
  const maxMonthlyAmount = Math.max(...monthlyActivity.map((item) => item.amount), 1);
  const criticalContracts = contracts.filter((contract) => contract.nearLimit);
  const selectedContract = contracts.find((contract) => contract.id === selectedContractId);

  useEffect(() => {
    if (
      selectedContractId !== null &&
      !contracts.some((contract) => contract.id === selectedContractId)
    ) {
      setSelectedContractId(null);
    }
  }, [contracts, selectedContractId]);

  async function createContract(input: Parameters<typeof addContract>[0]) {
    await addContract(input);
    setModal(null);
    setToast("Contrato cadastrado com sucesso.");
  }

  async function createTransaction(input: Parameters<typeof addTransaction>[0]) {
    await addTransaction(input);
    setModal(null);
    setToast("Lançamento registrado com sucesso.");
  }

  function requestReversal(transaction: Transaction) {
    setPendingReversalId(transaction.id);
    setActionError("");
  }

  async function confirmReversal() {
    if (!pendingReversalId || isReversing) return;

    setIsReversing(true);
    setActionError("");
    try {
      await reverseTransaction(pendingReversalId);
      setPendingReversalId(null);
      setToast("Lançamento estornado e saldo atualizado.");
    } catch (reversalError) {
      setActionError(
        reversalError instanceof Error
          ? reversalError.message
          : "Não foi possível estornar o lançamento.",
      );
    } finally {
      setIsReversing(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {toast && (
        <div
          role="status"
          className="fixed right-4 top-4 z-[60] flex max-w-sm items-center gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-medium text-emerald-800 shadow-lg shadow-slate-900/10"
        >
          <ShieldCheck size={18} className="shrink-0 text-emerald-600" />
          {toast}
          <button
            type="button"
            aria-label="Fechar notificação"
            onClick={() => setToast("")}
            className="ml-1 rounded p-1 text-slate-400 hover:bg-slate-100"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="hidden w-[244px] shrink-0 border-r border-slate-800 bg-slate-950 px-4 py-6 text-slate-100 lg:flex lg:flex-col">
          <a href="#" className="flex items-center gap-3 px-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-sm shadow-indigo-950/30">
              <BriefcaseBusiness size={19} />
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-tight text-white">orbit.</span>
              <span className="block text-[11px] text-slate-400">Financeiro corporativo</span>
            </span>
          </a>

          <nav className="mt-10 space-y-1">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Workspace
            </p>
            <a
              href="#overview"
              className="flex items-center gap-3 rounded-xl bg-indigo-500/15 px-3 py-2.5 text-sm font-medium text-indigo-200 ring-1 ring-inset ring-indigo-400/20"
            >
              <LayoutDashboard size={17} className="text-indigo-300" />
              Visão geral
            </a>
            <a
              href="#contracts"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <BriefcaseBusiness size={17} />
              Contratos
            </a>
            <a
              href="#transactions"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              <ArrowDownLeft size={17} />
              Lançamentos
            </a>
          </nav>

          <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-indigo-300 shadow-sm">
              <CircleHelp size={16} />
            </span>
            <p className="mt-3 text-sm font-semibold text-white">Precisa de ajuda?</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Consulte a equipe financeira sobre contratos e lançamentos.
            </p>
            <a href="mailto:financeiro@example.com" className="mt-3 inline-block text-xs font-semibold text-indigo-300 hover:text-indigo-200">
              Falar com suporte
            </a>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-5 py-3.5 backdrop-blur-md sm:px-8">
            <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4">
              <div className="flex items-center gap-3 lg:hidden">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
                  <BriefcaseBusiness size={17} />
                </span>
                <span className="text-sm font-semibold">orbit.</span>
              </div>
              <div className="hidden min-w-0 items-center gap-2 text-xs text-slate-400 sm:flex">
                <span>Workspace</span>
                <span>/</span>
                <span className="font-medium text-slate-700">Visão geral</span>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span
                  className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800 sm:inline-flex"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  API
                </span>
                <button
                  type="button"
                  onClick={() => void refresh()}
                  disabled={isLoading}
                  aria-label="Atualizar dados"
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                >
                  <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                </button>
                <button
                  type="button"
                  aria-label="Notificações"
                  className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100"
                >
                  <Bell size={17} />
                  <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-indigo-500" />
                </button>
                <span className="ml-1 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                  CF
                </span>
              </div>
            </div>
          </header>

          <div id="overview" className="mx-auto max-w-[1320px] px-5 py-8 sm:px-8 sm:py-10">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
                  Financeiro · TI
                </p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  Controle de contratos
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Acompanhe compromissos, consumo e saldo disponível em um só lugar.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setModal("contract")}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <Plus size={16} /> Novo contrato
                </button>
                <button
                  type="button"
                  onClick={() => setModal("transaction")}
                  disabled={contracts.length === 0}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <Plus size={16} /> Novo lançamento
                </button>
              </div>
            </div>

            {error && (
              <div role="alert" className="mt-6 flex items-start justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                <span>{error}</span>
                <button type="button" onClick={() => void refresh()} className="shrink-0 font-semibold underline">
                  Tentar novamente
                </button>
              </div>
            )}
            {actionError && (
              <div role="alert" className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {actionError}
                <button type="button" aria-label="Fechar erro" onClick={() => setActionError("")}>
                  <X size={16} />
                </button>
              </div>
            )}

            {criticalContracts.length > 0 && (
              <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 sm:flex-row sm:items-center">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600">
                  <Activity size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-rose-900">
                    {criticalContracts.length === 1
                      ? "Um contrato está próximo do limite"
                      : `${criticalContracts.length} contratos estão próximos do limite`}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-rose-700">
                    {criticalContracts.map((contract) => contract.name).join(" · ")}
                  </p>
                </div>
                <span className="self-start rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-700 sm:self-auto">
                  Consumo ≥ 80%
                </span>
              </div>
            )}

            <section className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                title="Valor total contratado"
                value={formatCurrency(totalContracted)}
                note={`${contracts.length} contratos ativos`}
                icon={<BriefcaseBusiness size={18} />}
                accent="slate"
              />
              <MetricCard
                title="Total consumido"
                value={formatCurrency(totalConsumed)}
                note={`${totalContracted > 0 ? ((totalConsumed / totalContracted) * 100).toFixed(1) : "0,0"}% do valor contratado`}
                icon={<ArrowUpRight size={19} />}
                accent="indigo"
              />
              <MetricCard
                title="Saldo disponível"
                value={formatCurrency(availableBalance)}
                note="Disponível para novos lançamentos"
                icon={<Wallet size={19} />}
                accent="emerald"
              />
              <MetricCard
                title="Prazo médio restante"
                value={
                  averageRemainingDays === null
                    ? "—"
                    : `${averageRemainingDays} dias`
                }
                note="Média dos contratos ativos com data de fim válida"
                icon={<CalendarDays size={18} />}
                accent="amber"
              />
            </section>

            <section className="mt-7 grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.8fr)]">
              <ContractsTable
                contracts={contracts}
                selectedContractId={selectedContractId}
                onSelect={setSelectedContractId}
              />
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.025] sm:p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold tracking-tight text-slate-950">Evolução de consumo</h2>
                    <p className="mt-1 text-sm text-slate-500">Últimos seis meses</p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Activity size={17} />
                  </span>
                </div>
                <div className="mt-7 flex h-40 items-end gap-3 border-b border-slate-100 pb-0">
                  {monthlyActivity.map((month) => {
                    const height = month.amount
                      ? Math.max((month.amount / maxMonthlyAmount) * 100, 8)
                      : 4;
                    return (
                      <div key={month.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                        {month.amount > 0 && (
                          <span className="text-[9px] font-medium text-slate-400">
                            {formatCurrency(month.amount).replace(/\s/g, "")}
                          </span>
                        )}
                        <div
                          className={`w-full max-w-9 rounded-t-md ${
                            month.amount ? "bg-indigo-500" : "bg-slate-100"
                          }`}
                          style={{ height: `${height}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 flex justify-between">
                  {monthlyActivity.map((month) => (
                    <span key={month.key} className="flex-1 text-center text-[10px] font-medium capitalize text-slate-400">
                      {month.label}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  Total lançado por mês
                </div>
              </section>
            </section>

            {now && (
              <section id="contracts" className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.025] sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold tracking-tight text-slate-950">Saúde dos contratos</h2>
                    <p className="mt-1 text-sm text-slate-500">Alertas de limite e ritmo de utilização.</p>
                  </div>
                  <Settings2 size={18} className="text-slate-400" />
                </div>
                {contracts.length ? (
                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {contracts.map((contract, index) => {
                      const usage = getContractUsage(contract);
                      const healthCardClass =
                        contract.nearLimit
                          ? "border-orange-400 bg-orange-200"
                          : contract.underutilized
                            ? "border-blue-300 bg-blue-100"
                            : "border-emerald-200 bg-emerald-100/70";

                      return (
                      <div
                        key={`${contract.id || ""}-${index}`}
                        className={`rounded-xl border p-4 ${healthCardClass}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="line-clamp-2 text-sm font-semibold text-slate-800">{contract.name}</p>
                          <HealthBadge contract={contract} />
                        </div>
                        <p className="mt-3 text-xs text-slate-500">
                          {usage.toFixed(1)}% consumido · saldo {formatCurrency(contract.balanceAvailable)}
                        </p>
                      </div>
                    );
                    })}
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-slate-500">Cadastre contratos para acompanhar seus alertas.</p>
                )}
              </section>
            )}

            <section id="transactions" className="mt-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                {selectedContractId !== null && selectedContract && (
                  <>
                    <p className="text-xs text-slate-500">
                      Exibindo lançamentos de{" "}
                      <strong className="font-semibold text-slate-700">
                        {selectedContract.name}
                      </strong>
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedContractId(null)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      Limpar filtro <X size={13} />
                    </button>
                  </>
                )}
              </div>
              <TransactionsTable
                transactions={visibleTransactions}
                contracts={contracts}
                onReverse={(transaction) => void requestReversal(transaction)}
              />
            </section>

            <footer className="flex flex-col justify-between gap-2 py-7 text-xs text-slate-400 sm:flex-row sm:items-center">
              <span>© {now?.getFullYear() ?? ""} orbit. Financeiro corporativo.</span>
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={14} /> Ambiente seguro · Dados protegidos
              </span>
            </footer>
          </div>
        </main>
      </div>

      {isLoading && (
        <div className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-lg">
          <LoaderCircle size={14} className="animate-spin" /> Sincronizando dados
        </div>
      )}
      {modal === "contract" && (
        <ContractFormModal onClose={() => setModal(null)} onSubmit={createContract} />
      )}
      {modal === "transaction" && (
        <TransactionFormModal
          contracts={contracts}
          initialContractId={selectedContractId ?? undefined}
          onClose={() => setModal(null)}
          onSubmit={createTransaction}
        />
      )}
      {pendingReversalId && (
        <Modal
          title="Confirmar estorno"
          description="O lançamento será removido e os saldos dos contratos serão atualizados."
          onClose={() => {
            if (!isReversing) setPendingReversalId(null);
          }}
        >
          {actionError && (
            <p
              role="alert"
              className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
            >
              {actionError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPendingReversalId(null)}
              disabled={isReversing}
              className="h-10 rounded-xl px-4 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void confirmReversal()}
              disabled={isReversing}
              className={`${primaryButtonClassName} bg-red-600 hover:bg-red-700`}
            >
              <Trash2 size={16} />
              {isReversing ? "Estornando..." : "Confirmar estorno"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
