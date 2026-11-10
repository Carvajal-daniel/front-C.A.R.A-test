"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowDownToLine } from "lucide-react";
import { formatCurrency, parseMoneyInput } from "@/lib/finance-format";
import type { Contract, CreateTransactionInput } from "@/types/finance";
import { inputClassName, Modal, primaryButtonClassName } from "@/components/modal";

export function TransactionFormModal({
  contracts,
  initialContractId,
  onClose,
  onSubmit,
}: {
  contracts: Contract[];
  initialContractId?: string;
  onClose: () => void;
  onSubmit: (input: CreateTransactionInput) => Promise<void>;
}) {
  const [contractId, setContractId] = useState(
    initialContractId ?? contracts[0]?.id ?? "",
  );
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const selectedContract = contracts.find((contract) => contract.id === contractId);
  const parsedAmount = parseMoneyInput(amount);
  const exceedsBalance =
    parsedAmount !== null &&
    selectedContract !== undefined &&
    parsedAmount > Math.max(0, selectedContract.balanceAvailable);
  const hasInsufficientBalance =
    selectedContract !== undefined && selectedContract.balanceAvailable <= 0;

  useEffect(() => {
    setDate(new Date().toISOString().slice(0, 10));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedContract || !description.trim() || parsedAmount === null || parsedAmount <= 0 || !date) {
      setError("Informe o contrato, a descrição, uma data e um valor maior que zero.");
      return;
    }
    if (exceedsBalance) {
      setError("O lançamento não pode ultrapassar o saldo disponível do contrato.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      await onSubmit({
        contractId,
        description: description.trim(),
        amount: parsedAmount,
        date: new Date(`${date}T00:00:00.000Z`).toISOString(),
      });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível registrar o lançamento.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      title="Novo lançamento"
      description="Registre um consumo e vincule-o ao contrato correto."
      onClose={onClose}
    >
      <form className="space-y-4" onSubmit={submit}>
        <label className="block text-sm font-medium text-slate-700">
          Contrato
          <select
            required
            value={contractId}
            onChange={(event) => setContractId(event.target.value)}
            className={inputClassName}
          >
            {contracts.map((contract, index) => (
              <option key={`${contract.id || ""}-${index}`} value={contract.id}>
                {contract.name} — saldo {formatCurrency(contract.balanceAvailable)}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Descrição
          <input
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ex.: Serviços de suporte"
            className={inputClassName}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium text-slate-700">
            Data do lançamento
            <input
              required
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={inputClassName}
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Valor
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
        </div>
        {selectedContract && (
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
            <span className="text-slate-500">Saldo disponível</span>
            <span className="font-semibold text-slate-900">
              {formatCurrency(selectedContract.balanceAvailable)}
            </span>
          </div>
        )}
        {(exceedsBalance || hasInsufficientBalance) && (
          <p role="alert" className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {hasInsufficientBalance
              ? "Este contrato não possui saldo disponível para novos lançamentos."
              : "O valor informado ultrapassa o saldo disponível."}
          </p>
        )}
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
          <button
            type="submit"
            disabled={
              isSaving ||
              exceedsBalance ||
              hasInsufficientBalance ||
              contracts.length === 0
            }
            className={primaryButtonClassName}
          >
            <ArrowDownToLine size={16} />
            {isSaving ? "Salvando..." : "Registrar lançamento"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
