export type Transaction = {
  id: string;
  contractId: string;
  contractName?: string;
  description: string;
  amount: number;
  date: string;
  category?: string;
};

export type Contract = {
  id: string;
  name: string;
  totalAmount: number;
  totalUsed: number;
  balanceAvailable: number;
  startDate: string;
  endDate: string;
  nearLimit?: boolean;
  underutilized?: boolean;
  transactions: Transaction[];
  Transactions?: unknown;
};

export type CreateContractInput = {
  name: string;
  totalAmount: number;
  startDate: string;
  endDate?: string;
};

export type CreateTransactionInput = {
  contractId: string;
  description: string;
  amount: number;
  date: string;
};
