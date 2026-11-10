import { ArrowDownLeft, Receipt, Trash2 } from "lucide-react";
import type { Contract, Transaction } from "@/types/finance";
import { formatCurrency, formatDate } from "@/lib/finance-format";

export function TransactionsTable({
  transactions,
  contracts,
  onReverse,
}: {
  transactions: Transaction[];
  contracts: Contract[];
  onReverse: (transaction: Transaction) => void;
}) {
  const contractNames = new Map(contracts.map((contract) => [contract.id, contract.name]));

  return (
    <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
        <div>
          <h2 className="font-semibold tracking-tight text-slate-950">Lançamentos recentes</h2>
          <p className="mt-1 text-sm text-slate-500">Histórico cronológico de consumo dos contratos.</p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600">
          {transactions.length} lançamentos
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[690px] text-left">
          <thead>
            <tr className="bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3.5">Descrição</th>
              <th className="px-5 py-3.5">Contrato</th>
              <th className="px-5 py-3.5">Data</th>
              <th className="px-5 py-3.5 text-right">Valor</th>
              <th className="px-5 py-3.5 text-right">AÇÕES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((transaction, index) => (
              <tr
                key={`${transaction.id || ""}-${index}`}
                className="text-sm transition hover:bg-slate-50/60"
              >
                <td className="px-6 py-4">
                  <span className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                      <ArrowDownLeft size={17} />
                    </span>
                    <span>
                      <span className="block font-medium text-slate-800">
                        {transaction.description || "—"}
                      </span>
                      <span className="mt-0.5 block text-xs text-slate-400">
                        {transaction.category ?? "—"}
                      </span>
                    </span>
                  </span>
                </td>
                <td className="max-w-[200px] truncate px-5 py-4 text-slate-500">
                  {transaction.contractName ??
                    contractNames.get(transaction.contractId) ??
                    transaction.contractId ??
                    "—"}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                  {formatDate(transaction.date)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-slate-800">
                  {formatCurrency(transaction.amount)}
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    type="button"
                    onClick={() => onReverse(transaction)}
                    disabled={!transaction.id}
                    aria-label={`Estornar ${transaction.description}`}
                    title="Estornar lançamento"
                    className="inline-flex items-center gap-1.5 rounded-lg p-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 size={16} />
                    Estornar
                  </button>
                </td>
              </tr>
            ))}
            {!transactions.length && (
              <tr>
                <td colSpan={5} className="px-6 py-14 text-center">
                  <Receipt className="mx-auto text-slate-300" size={25} />
                  <p className="mt-3 text-sm font-semibold text-slate-800">Nenhum lançamento encontrado</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Os lançamentos registrados aparecerão aqui.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
