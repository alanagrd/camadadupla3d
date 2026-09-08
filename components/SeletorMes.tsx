"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SeletorMes({ mes, atual }: { mes: string; atual: string }) {
  const router = useRouter();
  const [ano, m] = mes.split("-").map(Number);
  const label = new Date(ano, m - 1, 1).toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const desloca = (delta: number) => {
    const d = new Date(ano, m - 1 + delta, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    router.push(ym >= atual ? "/" : `/?mes=${ym}`);
  };

  const noFuturo = mes >= atual;

  const btn =
    "p-1.5 rounded-lg border border-[var(--border-light)] text-[var(--text-faint)] " +
    "hover:text-[var(--amber)] hover:border-[var(--amber)] transition-colors " +
    "disabled:opacity-30 disabled:pointer-events-none";

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => desloca(-1)} title="Mês anterior" className={btn}>
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm font-medium min-w-[150px] text-center">{label}</span>
      <button
        onClick={() => desloca(1)}
        disabled={noFuturo}
        title="Próximo mês"
        className={btn}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
