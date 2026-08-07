import { createClient } from "@/lib/supabase/server";
import { Card, Badge } from "@/components/ui";
import { ShoppingCart, Package, AlertTriangle, Boxes } from "lucide-react";
import Link from "next/link";
import type { Pedido, Filamento } from "@/lib/types";

const ESTOQUE_BAIXO_G = 150; // abaixo disso, alerta

export default async function DashboardPage() {
  const supabase = await createClient();

  const [{ data: pedidos }, { data: produtos }, { data: filamentos }] =
    await Promise.all([
      supabase
        .from("pedidos")
        .select("*, clientes(nome)")
        .neq("status", "entregue")
        .neq("status", "cancelado")
        .order("prazo_entrega", { ascending: true, nullsFirst: false })
        .returns<(Pedido & { clientes: { nome: string } | null })[]>(),
      supabase.from("produtos").select("id").eq("ativo", true),
      supabase
        .from("filamentos")
        .select("*")
        .eq("ativo", true)
        .returns<Filamento[]>(),
    ]);

  const pedidosAbertos = pedidos ?? [];
  const filamentosBaixos = (filamentos ?? []).filter(
    (f) => f.estoque_g < ESTOQUE_BAIXO_G
  );

  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-1">Dashboard</h1>
      <p className="text-[var(--text-faint)] text-sm mb-6">
        camadadupla3D — visão geral
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs mb-2">
            <ShoppingCart size={14} /> Pedidos em aberto
          </div>
          <div className="font-display text-2xl font-bold">
            {pedidosAbertos.length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs mb-2">
            <Package size={14} /> Produtos ativos
          </div>
          <div className="font-display text-2xl font-bold">
            {produtos?.length ?? 0}
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs mb-2">
            <Boxes size={14} /> Filamentos com estoque baixo
          </div>
          <div className="font-display text-2xl font-bold text-[var(--red)]">
            {filamentosBaixos.length}
          </div>
        </Card>
      </div>

      {filamentosBaixos.length > 0 && (
        <Card className="p-4 mb-6 border-[var(--red)]/40 bg-[var(--red-dim)]/10">
          <div className="flex items-center gap-2 text-[var(--red)] text-sm font-semibold mb-2">
            <AlertTriangle size={15} /> Estoque baixo
          </div>
          <ul className="text-sm text-[var(--text-muted)] space-y-1">
            {filamentosBaixos.map((f) => (
              <li key={f.id}>
                {f.nome} — {f.estoque_g.toFixed(0)}g restantes
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-4">
        <h2 className="font-display font-semibold text-sm mb-3">
          Pedidos em aberto
        </h2>
        {pedidosAbertos.length === 0 ? (
          <p className="text-[var(--text-faint)] text-sm">
            Nenhum pedido em aberto.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {pedidosAbertos.map((p) => (
              <Link
                key={p.id}
                href={`/pedidos/${p.id}`}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[var(--surface-2)] text-sm"
              >
                <span>{p.clientes?.nome ?? "Sem cliente"}</span>
                <div className="flex items-center gap-3">
                  {p.prazo_entrega && (
                    <span className="text-[var(--text-faint)] text-xs">
                      {new Date(p.prazo_entrega).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                  <Badge
                    color={
                      p.status === "novo"
                        ? "amber"
                        : p.status === "pronto"
                        ? "green"
                        : "muted"
                    }
                  >
                    {p.status.replace("_", " ")}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
