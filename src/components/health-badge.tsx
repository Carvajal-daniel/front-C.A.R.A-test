import { AlertTriangle, CheckCircle2, CircleAlert } from "lucide-react";
import type { Contract } from "@/types/finance";
import { getContractAlert } from "@/lib/finance-format";

export function HealthBadge({
  contract,
}: {
  contract: Contract;
}) {
  const state = getContractAlert(contract);
  if (state === "near-limit") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-600 bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm shadow-red-900/20">
        <CircleAlert size={13} /> Próximo ao limite
      </span>
    );
  }
  if (state === "underutilized") {
    return (
      <span className="inline-flex animate-pulse items-center gap-1.5 rounded-full border border-blue-500 bg-blue-300 px-2.5 py-1 text-xs font-bold text-blue-950 shadow-sm shadow-blue-900/10">
        <AlertTriangle size={13} /> Risco de subutilização
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-900">
      <CheckCircle2 size={13} /> Em conformidade
    </span>
  );
}
