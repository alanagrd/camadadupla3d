import { createClient } from "@/lib/supabase/server";
import { Card, Btn, Badge } from "@/components/ui";
import { brl } from "@/lib/calc";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Pedido, PedidoItem, Cliente } from "@/lib/types";

const STATUS_COR: Record<string, "amber" | "green" | "muted" | "red"> = {
  novo: "amber",
  em_producao: "amber",
  pronto: "green",
  entregue: "muted",
  cancelado: "red",
};

export default async function PedidosPage() {
  const supabase = await createClient();

  const [{ data: pedidos }, { data: itens }] = await Promise.all([
    supabase
      .from("pedidos")
      .select("*, clientes(nome)")
      .order("created_at", { ascending: false })
      .returns<(Pedido & { clientes: Cliente | null })[]>(),
    supabase.from("pedido_itens").select("*").returns<PedidoItem[]>(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-xl mb-1">Pedidos</h1>
          <p className="text-[var(--text-faint)] text-sm">
            Tudo que o Kayky (e você) já tirou de pedido
          </p>
        </div>
        <Link href="/pedidos/novo">
          <Btn>
            <Plus size={14} /> Novo pedido
          </Btn>
        </Link>
      </div>

      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[11px] uppercase text-[var(--text-faint)]">
              <th className="p-3">Cliente</th>
              <th className="p-3">Canal</th>
              <th className="p-3">Prazo</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(pedidos ?? []).map((p) => {
              const meusItens = (itens ?? []).filter((i) => i.pedido_id === p.id);
              const total = meusItens.reduce(
                (acc, i) => acc + i.preco_unitario * i.quantidade,
                0
              );
              return (
                <tr
                  key={p.id}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]"
                >
                  <td className="p-3">
                    <Link href={`/pedidos/${p.id}`} className="hover:text-[var(--amber)]">
                      {p.clientes?.nome ?? "Sem cliente"}
                    </Link>
                  </td>
                  <td className="p-3 text-[var(--text-muted)] capitalize">
                    {p.canal ?? "—"}
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
                </tr>
              );
            })}
          </tbody>
        </table>
        {(pedidos ?? []).length === 0 && (
          <p className="text-[var(--text-faint)] text-sm p-4">
            Nenhum pedido ainda.
          </p>
        )}
      </Card>
    </div>
  );
}
