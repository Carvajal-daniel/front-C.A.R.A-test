import type {
  Contract,
  CreateContractInput,
  CreateTransactionInput,
  Transaction,
} from "@/types/finance";
import { API_CONFIG } from "@/config/api";

function asNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function firstValue(...values: unknown[]): unknown {
  return values.find((value) => value !== undefined && value !== null && value !== "");
}

function normalizeTransaction(
  value: Record<string, unknown>,
  contractId: string,
  contractName: string,
): Transaction {
  const id = firstValue(
    value.id,
    value.transactionId,
    value.transaction_id,
    value.launchId,
    value.launch_id,
    value._id,
  );
  const date = firstValue(value.date, value.created_at, value.createdAt);
  const normalizedDate = date ? new Date(String(date)) : null;
  return {
    id: String(id ?? ""),
    contractId,
    contractName,
    description: String(firstValue(value.description, "Sem descrição")),
    amount: asNumber(
      firstValue(value.amount, value.value, value.total_amount, value.totalAmount),
    ),
    date:
      normalizedDate && !Number.isNaN(normalizedDate.getTime())
        ? normalizedDate.toISOString()
        : "",
    category: typeof value.category === "string" ? value.category : undefined,
  };
}

function normalizeContract(value: Record<string, unknown>): Contract {
  const id = String(
    firstValue(value.contractId, value.contract_id, value.id, value._id) ?? "",
  );
  const totalAmount = asNumber(
    firstValue(
      value.totalContracted,
      value.total_amount,
      value.totalAmount,
      value.value,
    ),
  );
  const name = String(
    firstValue(value.contract_name, value.name, value.title) ?? "Sem nome",
  );
  const rawTransactions = Array.isArray(value.transactions)
    ? value.transactions
    : [];
  const transactions = rawTransactions
    .filter(
      (transaction): transaction is Record<string, unknown> =>
        typeof transaction === "object" && transaction !== null,
    )
    .map((transaction) => normalizeTransaction(transaction, id, name));
  const rawTotalUsed = firstValue(
    value.totalLaunched,
    value.total_launched,
    value.total_used,
    value.totalUsed,
  );
  const totalUsed =
    rawTotalUsed === undefined
      ? transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
      : asNumber(rawTotalUsed);
  const rawBalanceAvailable = firstValue(
    value.availableBalance,
    value.balance_available,
    value.balanceAvailable,
  );
  const balanceAvailable =
    rawBalanceAvailable === undefined
      ? totalAmount - totalUsed
      : asNumber(rawBalanceAvailable);
  const rawStartDate = firstValue(value.startDate, value.start_date);
  const rawEndDate = firstValue(value.endDate, value.end_date);
  const startDate = rawStartDate === undefined ? "" : String(rawStartDate);
  const endDate = rawEndDate === undefined ? "" : String(rawEndDate);

  return {
    id,
    name,
    totalAmount,
    totalUsed,
    balanceAvailable: Math.max(0, balanceAvailable),
    startDate,
    endDate,
    nearLimit: typeof value.nearLimit === "boolean" ? value.nearLimit : undefined,
    underutilized:
      typeof value.underutilized === "boolean" ? value.underutilized : undefined,
    transactions,
  };
}

async function request(path: string, init?: RequestInit): Promise<Response> {
  const endpoint = path === "/" ? "" : path;
  const response = await fetch(`${API_CONFIG.baseUrl}${endpoint}`, {
    method: "GET",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `A API respondeu com status ${response.status}.`);
  }

  return response;
}

function getArray(result: unknown, resourceName: string): Record<string, unknown>[] {
  const nested =
    typeof result === "object" && result !== null
      ? firstValue(
          "data" in result ? result.data : undefined,
          "contracts" in result ? result.contracts : undefined,
          "results" in result ? result.results : undefined,
        )
      : undefined;
  const records = Array.isArray(result) ? result : nested;

  if (
    !Array.isArray(records) ||
    !records.every((item) => typeof item === "object" && item !== null)
  ) {
    throw new Error(`A resposta de ${resourceName} não contém uma lista válida.`);
  }

  return records as Record<string, unknown>[];
}

export async function getContractDashboardData(): Promise<unknown> {
  const response = await request(API_CONFIG.routes.dashboard, { method: "GET" });
  return response.json();
}

export function normalizeDashboardContracts(data: unknown): Contract[] {
  return getArray(data, "dashboard").map(normalizeContract);
}

export async function getContracts(): Promise<Contract[]> {
  return normalizeDashboardContracts(await getContractDashboardData());
}

export async function createContract(input: CreateContractInput): Promise<void> {
  await request(API_CONFIG.routes.createContract, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createTransaction(input: CreateTransactionInput): Promise<void> {
  const contracts = await getContracts();
  const contract = contracts.find((item) => item.id === input.contractId);
  if (!contract) throw new Error("O contrato selecionado não foi encontrado.");
  if (contract.balanceAvailable <= 0 || input.amount > contract.balanceAvailable) {
    throw new Error("O lançamento não pode ultrapassar o saldo disponível do contrato.");
  }
  await request(API_CONFIG.routes.createTransaction, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deleteTransaction(transactionId: string): Promise<void> {
  const deletePath = API_CONFIG.routes.deleteTransaction.replace(
    ":id",
    encodeURIComponent(transactionId),
  );
  await request(deletePath, {
    method: "DELETE",
  });
}
