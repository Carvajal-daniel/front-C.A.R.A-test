"use client";

import { useState, type FormEvent } from "react";
import { CalendarDays, FilePlus2 } from "lucide-react";
import { parseMoneyInput } from "@/lib/finance-format";
import type { CreateContractInput } from "@/types/finance";
import { inputClassName, Modal, primaryButtonClassName } from "@/components/modal";

export function ContractFormModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (input: CreateContractInput) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const endDate = startDate
    ? (() => {
        const date = new Date(`${startDate}T00:00:00.000Z`);
        date.setUTCFullYear(date.getUTCFullYear() + 1);
        return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
      })()
    : "—";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedAmount = parseMoneyInput(amount);
    if (
      !name.trim() ||
      parsedAmount === null ||
      parsedAmount <= 0 ||
      !startDate ||
      (endDateInput && endDateInput < startDate)
    ) {
      setError("Preencha o nome, um valor maior que zero e a data de início.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      await onSubmit({
        name: name.trim(),
        totalAmount: parsedAmount,
        startDate: new Date(`${startDate}T00:00:00.000Z`).toISOString(),
        ...(endDateInput
          ? { endDate: new Date(`${endDateInput}T00:00:00.000Z`).toISOString() }
          : {}),
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Não foi possível criar o contrato.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      title="Novo contrato"
      description="Cadastre um contrato e acompanhe seu saldo no painel."
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={submit}>
        <label className="block text-sm font-medium text-slate-700">
          Nome do contrato
          <input
            autoFocus
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex.: Infraestrutura cloud"
            className={inputClassName}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Valor total contratado
          <span className="relative block">
            <span className="absolute left-3 top-1/2 mt-1.5 -translate-y-1/2 text-sm text-slate-400">
              R$
            </span>
            <input
              required
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0,00"
              className={`${inputClassName} pl-10`}
            />
          </span>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Data de início
          <input
            required
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className={inputClassName}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Data de fim (Opcional)
          <input
            type="date"
            value={endDateInput}
            min={startDate || undefined}
            onChange={(event) => setEndDateInput(event.target.value)}
            className={inputClassName}
          />
        </label>
        <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <CalendarDays size={17} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Fim da vigência</span>
          </div>
          <span className="text-sm font-semibold text-slate-900">
            {endDateInput
              ? new Date(`${endDateInput}T00:00:00.000Z`).toLocaleDateString("pt-BR", {
                  timeZone: "UTC",
                })
              : endDate}
          </span>
          {!endDateInput && (
            <span className="sr-only">
              Prazo padrão de um ano calculado automaticamente pelo domínio.
            </span>
          )}
        </div>
        <p className="-mt-2 text-xs text-slate-500">
          {endDateInput
            ? "Será usada a data de término informada."
            : "Sem data final, o domínio assegura automaticamente o prazo padrão de +1 ano."}
        </p>
        {error && (
          <p role="alert" className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl px-4 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button type="submit" disabled={isSaving} className={primaryButtonClassName}>
            <FilePlus2 size={16} />
            {isSaving ? "Salvando..." : "Criar contrato"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
