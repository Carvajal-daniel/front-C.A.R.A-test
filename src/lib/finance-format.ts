import type { Contract, Transaction } from "@/types/finance";

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatCurrency(amount: number): string {
  return brlFormatter.format(amount);
}

export function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function parseMoneyInput(value: string): number | null {
  const cleaned = value.replace(/\s/g, '').replace(',', '.');
  const normalized = value.includes(',')
    ? `${cleaned.slice(0, cleaned.lastIndexOf('.')).replace(/\./g, '')}.${cleaned.slice(cleaned.lastIndexOf('.') + 1)}`
    : cleaned;
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;

  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getContractUsage(contract: Contract): number {
  return contract.totalAmount > 0
    ? Math.min((contract.totalUsed / contract.totalAmount) * 100, 100)
    : 0;
}

export function getContractAlert(
  contract: Contract,
): "near-limit" | "underutilized" | "healthy" {
  if (contract.nearLimit === true) return "near-limit";
  if (contract.underutilized === true) return "underutilized";
  return "healthy";
}

export function getAllTransactions(contracts: Contract[]): Transaction[] {
  return contracts.flatMap((contract) => contract.transactions);
}
