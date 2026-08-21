"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui";
import { brl } from "@/lib/calc";
import { Pencil, X } from "lucide-react";
import Link from "next/link";
import type { Pedido, PedidoItem, Pagamento, Cliente, ContaCrianca } from "@/lib/types";

const STATUS_COR: Record<string, "amber" | "green" | "muted" | "red"> = {
  novo: "amber",
  em_producao: "amber",
  pronto: "green",
  entregue: "muted",
  cancelado: "red",
};

export default function PedidosListClient({
  pedidos,
  itens,
  pagamentos,
  criancas,
}: {
  pedidos: (Pedido & { clientes: Cliente | null })[];
  itens: PedidoItem[];
  pagamentos: Pagamento[];
  criancas: ContaCrianca[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [excluindo, setExcluindo] = useState<string | null>(null);

  async function excluir(id: string) {
    if (!confirm("Excluir este pedido? Essa ação não pode ser desfeita.")) return;
    setExcluindo(id);
    await supabase.from("pedido_itens").delete().eq("pedido_id", id);
    await supabase.from("pagamentos").delete().eq("pedido_id", id);
    await supabase.from("pedidos").delete().eq("id", id);
    setExcluindo(null);
    router.refresh();
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-[var(--border)] text-left text-[11px] uppercase text-[var(--text-faint)]">
          <th className="p-3">Cliente</th>
          <th className="p-3">Vendedor</th>
          <th className="p-3">Pagamento</th>
          <th className="p-3">Prazo</th>
          <th className="p-3">Total</th>
          <th className="p-3">Status</th>
          <th className="p-3 w-16"></th>
        </tr>
      </thead>
      <tbody>
        {pedidos.map((p) => {
          const meusItens = itens.filter((i) => i.pedido_id === p.id);
          const total = meusItens.reduce(
            (acc, i) => acc + i.preco_unitario * i.quantidade,
            0
          );
          const totalPago = pagamentos
            .filter((pg) => pg.pedido_id === p.id && pg.status === "pago")
            .reduce((acc, pg) => acc + pg.valor, 0);
          const pagamento =
            total > 0 && totalPago >= total
              ? { label: "Pago", cor: "green" as const }
              : totalPago > 0
              ? { label: "Parcial", cor: "amber" as const }
              : { label: "Não pago", cor: "muted" as const };
          const vendedor = criancas.find((c) => c.id === p.vendedor_id);
          return (
            <tr
              key={p.id}
              className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]"
            >
              <td className="p-3">
                <Link
                  href={`/pedidos/${p.id}`}
                  className="hover:text-[var(--amber)]"
                >
                  {p.clientes?.nome ?? "Sem cliente"}
                </Link>
              </td>
              <td className="p-3 text-[var(--text-muted)]">
                {vendedor?.nome ?? <span className="text-[var(--text-faint)]">—</span>}
              </td>
              <td className="p-3">
                <Badge color={pagamento.cor}>{pagamento.label}</Badge>
              </td>
              <td className="p-3 text-[var(--text-muted)]">
                {p.prazo_entrega
                  ? new Date(p.prazo_entrega).toLocaleDateString("pt-BR")
                  : "—"}
              </td>
              <td className="p-3 font-mono">{brl(total)}</td>
              <td className="p-3">
                <Badge color={STATUS_COR[p.status]}>
                  {p.status.replace("_", " ")}
                </Badge>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-1 justify-end">
                  <Link
                    href={`/pedidos/${p.id}/editar`}
                    title="Editar"
                    className="p-1.5 rounded hover:bg-[var(--surface-2)] text-[var(--text-faint)] hover:text-[var(--amber)] transition-colors"
                  >
                    <Pencil size={13} />
                  </Link>
                  <button
                    onClick={() => excluir(p.id)}
                    disabled={excluindo === p.id}
                    title="Excluir"
                    className="p-1.5 rounded text-[var(--text-faint)] hover:text-[var(--red)] transition-colors disabled:opacity-40"
                  >
                    <X size={13} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
