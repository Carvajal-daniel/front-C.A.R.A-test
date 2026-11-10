"use client";

import { ArrowUpRight, CalendarDays, FileText } from "lucide-react";
import type { Contract } from "@/types/finance";
import {
  formatCurrency,
  formatDate,
  getContractUsage,
} from "@/lib/finance-format";
import { HealthBadge } from "@/components/health-badge";

export function ContractsTable({
  contracts,
  selectedContractId,
  onSelect,
}: {
  contracts: Contract[];
  selectedContractId: string | null;
  onSelect: (id: string | null) => void;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
        <div>
          <h2 className="font-semibold tracking-tight text-slate-950">Contratos cadastrados</h2>
          <p className="mt-1 text-sm text-slate-500">Acompanhe saldo, consumo e vigência.</p>
        </div>
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
            selectedContractId === null
              ? "bg-slate-950 text-white"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          Ver todos
        </button>
      </div>
      {contracts.length ? (
        <div className="divide-y divide-slate-100">
          {contracts.map((contract, index) => {
            const usage = getContractUsage(contract);
            const healthClass =
              contract.nearLimit
                ? "border-orange-400 bg-orange-100"
                : contract.underutilized
                  ? "border-blue-300 bg-blue-100"
                  : "border-emerald-200 bg-emerald-50/50";
            const selected = selectedContractId === contract.id;
            return (
              <button
                type="button"
                key={`${contract.id || ""}-${index}`}
                onClick={() => onSelect(selected ? null : contract.id)}
                className={`grid w-full gap-4 border-l-2 px-5 py-5 text-left transition hover:bg-slate-50/80 sm:px-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(170px,0.8fr)_minmax(140px,0.7fr)_auto] lg:items-center ${healthClass} ${
                  selected ? "ring-1 ring-inset ring-indigo-200" : ""
                }`}
              >
                <span className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <FileText size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-900">
                      {contract.name}
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <CalendarDays size={13} />
                      Vigência: {formatDate(contract.startDate)} até {formatDate(contract.endDate)}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      Valor contratado:{" "}
                      <strong className="font-semibold text-slate-700">
                        {formatCurrency(contract.totalAmount)}
                      </strong>
                    </span>
                  </span>
                </span>
                <span className="block">
                  <span className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-slate-500">Utilizado</span>
                    <span className="font-medium text-slate-700">
                      {formatCurrency(contract.totalUsed)} · {usage.toFixed(0)}%
                    </span>
                  </span>
                  <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <span
                      className={`block h-full rounded-full ${
                        usage >= 80 ? "bg-rose-500" : "bg-indigo-500"
                      }`}
                      style={{ width: `${usage}%` }}
                    />
                  </span>
                </span>
                <span>
                  <span className="block text-[11px] text-slate-400">Saldo disponível</span>
                  <span className="mt-1 block text-sm font-semibold text-slate-900">
                    {formatCurrency(contract.balanceAvailable)}
                  </span>
                </span>
                <span className="flex items-center justify-between gap-3 lg:justify-end">
                  <HealthBadge contract={contract} />
                  <ArrowUpRight size={16} className="hidden text-slate-300 lg:block" />
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="px-6 py-14 text-center">
          <FileText className="mx-auto text-slate-300" size={25} />
          <p className="mt-3 text-sm font-semibold text-slate-800">Nenhum contrato cadastrado</p>
          <p className="mt-1 text-sm text-slate-500">Crie um contrato para começar a acompanhar os saldos.</p>
        </div>
      )}
    </section>
  );
}
