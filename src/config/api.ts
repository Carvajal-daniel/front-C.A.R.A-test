const BASE_URL = "https://api-test-roan-beta.vercel.app";

export const API_CONFIG = {
  baseUrl: BASE_URL,
  routes: {
    dashboard: "/contracts/dashboard",
    createContract: "/contracts",
    createTransaction: "/transactions",
    deleteTransaction: "/transactions/:id",
  },
} as const;
