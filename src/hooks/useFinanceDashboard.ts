"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createContract,
  createTransaction,
  deleteTransaction,
  getContractDashboardData,
  normalizeDashboardContracts,
} from "@/services/finance-api";
import type {
  Contract,
  CreateContractInput,
  CreateTransactionInput,
} from "@/types/finance";

export function useFinanceDashboard() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await getContractDashboardData();
      setContracts(normalizeDashboardContracts(data));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar os dados financeiros.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addContract = useCallback(
    async (input: CreateContractInput) => {
      await createContract(input);
      await refresh();
    },
    [refresh],
  );

  const addTransaction = useCallback(
    async (input: CreateTransactionInput) => {
      await createTransaction(input);
      await refresh();
    },
    [refresh],
  );

  const reverseTransaction = useCallback(
    async (id: string) => {
      await deleteTransaction(id);
      await refresh();
    },
    [refresh],
  );

  return {
    contracts,
    isLoading,
    error,
    refresh,
    addContract,
    addTransaction,
    reverseTransaction,
  };
}
