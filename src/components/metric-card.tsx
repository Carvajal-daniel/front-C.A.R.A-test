import type { ReactNode } from "react";

export function MetricCard({
  title,
  value,
  note,
  icon,
  accent = "slate",
}: {
  title: string;
  value: string;
  note: string;
  icon: ReactNode;
  accent?: "slate" | "indigo" | "emerald" | "amber";
}) {
  const iconColors = {
    slate: "bg-slate-100 text-slate-600",
    indigo: "bg-indigo-50 text-indigo-600",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  };

  return (
    <article className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[27px]">
            {value}
          </p>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconColors[accent]}`}>
          {icon}
        </span>
      </div>
      <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">{note}</p>
    </article>
  );
}
