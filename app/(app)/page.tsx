import { createClient } from "@/lib/supabase/server";
import { Card, Badge } from "@/components/ui";
import {
  ShoppingCart,
  Package,
  AlertTriangle,
  Boxes,
  TrendingUp,
  Wallet,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { brl } from "@/lib/calc";
import type { Pedido, Filamento, PedidoItem, Pagamento, ContaCrianca } from "@/lib/types";

const ESTOQUE_BAIXO_G = 150;

export default async function DashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { data: pedidosAbertos },
    { data: todosPedidos },
    { data: todosItens },
    { data: pagamentosMes },
    { data: produtos },
    { data: filamentos },
    { data: criancas },
  ] = await Promise.all([
    // pedidos em aberto para a tabela
    supabase
      .from("pedidos")
      .select("*, clientes(nome)")
      .neq("status", "entregue")
      .neq("status", "cancelado")
      .order("prazo_entrega", { ascending: true, nullsFirst: false })
      .returns<(Pedido & { clientes: { nome: string } | null })[]>(),
    // todos pedidos não-cancelados (para métricas)
    supabase
      .from("pedidos")
      .select("id, vendedor_id, status, created_at")
      .neq("status", "cancelado")
      .returns<Pick<Pedido, "id" | "vendedor_id" | "status" | "created_at">[]>(),
    // todos os itens (para calcular valores)
    supabase
      .from("pedido_itens")
      .select("pedido_id, preco_unitario, quantidade")
      .returns<Pick<PedidoItem, "pedido_id" | "preco_unitario" | "quantidade">[]>(),
    // pagamentos pagos do mês
    supabase
      .from("pagamentos")
      .select("valor")
      .eq("status", "pago")
      .gte("created_at", inicioMes)
      .returns<Pick<Pagamento, "valor">[]>(),
    // produtos ativos
    supabase.from("produtos").select("id").eq("ativo", true),
    // filamentos
    supabase.from("filamentos").select("*").eq("ativo", true).returns<Filamento[]>(),
    // crianças
    supabase.from("contas_criancas").select("*").order("nome").returns<ContaCrianca[]>(),
  ]);

  const filamentosBaixos = (filamentos ?? []).filter((f) => f.estoque_g < ESTOQUE_BAIXO_G);

  // Pedidos do mês
  const pedidosMes = (todosPedidos ?? []).filter((p) => p.created_at >= inicioMes);
  const idsPedidosMes = new Set(pedidosMes.map((p) => p.id));

  // Itens do mês
  const itensMes = (todosItens ?? []).filter((i) => idsPedidosMes.has(i.pedido_id));
  const totalVendasMes = itensMes.reduce(
    (acc, i) => acc + i.preco_unitario * i.quantidade,
    0
  );
  const totalRecebidoMes = (pagamentosMes ?? []).reduce((acc, p) => acc + p.valor, 0);
  const pedidosEntregues = (todosPedidos ?? []).filter((p) => p.status === "entregue").length;

  // Vendas por criança (total histórico)
  const idsTodosPedidos = new Set((todosPedidos ?? []).map((p) => p.id));
  const vendasPorCrianca = (criancas ?? []).map((c) => {
    const pedidosDaCrianca = (todosPedidos ?? []).filter((p) => p.vendedor_id === c.id);
    const ids = new Set(pedidosDaCrianca.map((p) => p.id));
    const vendas = (todosItens ?? [])
      .filter((i) => ids.has(i.pedido_id))
      .reduce((acc, i) => acc + i.preco_unitario * i.quantidade, 0);
    return { ...c, vendas };
  });
  const maxVendas = Math.max(...vendasPorCrianca.map((c) => c.vendas), 1);

  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-1">Dashboard</h1>
      <p className="text-[var(--text-faint)] text-sm mb-6">
        camadadupla3D — visão geral
      </p>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs mb-2">
            <ShoppingCart size={14} /> Pedidos em aberto
          </div>
          <div className="font-display text-2xl font-bold">
            {(pedidosAbertos ?? []).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs mb-2">
            <TrendingUp size={14} /> Vendas este mês
          </div>
          <div className="font-display text-2xl font-bold text-[var(--amber)]">
            {brl(totalVendasMes)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs mb-2">
            <Wallet size={14} /> Recebido este mês
          </div>
          <div className="font-display text-2xl font-bold text-[var(--green)]">
            {brl(totalRecebidoMes)}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
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
            <CheckCircle size={14} /> Pedidos entregues
          </div>
          <div className="font-display text-2xl font-bold text-[var(--green)]">
            {pedidosEntregues}
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-[var(--text-muted)] text-xs mb-2">
            <Boxes size={14} /> Estoque baixo
          </div>
          <div className={`font-display text-2xl font-bold ${filamentosBaixos.length > 0 ? "text-[var(--red)]" : ""}`}>
            {filamentosBaixos.length}
          </div>
        </Card>
      </div>

      {/* Alerta de estoque */}
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

      {/* Vendas por criança */}
      {vendasPorCrianca.some((c) => c.vendas > 0) && (
        <Card className="p-4 mb-6">
          <h2 className="font-display font-semibold text-sm mb-4">
            Vendas por criança — total histórico
          </h2>
          <div className="flex flex-col gap-3">
            {vendasPorCrianca.map((c) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="w-16 text-sm font-medium truncate">{c.nome}</div>
                <div className="flex-1 bg-[var(--surface-2)] rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-[var(--amber)] rounded-full h-2.5 transition-all"
                    style={{ width: `${Math.round((c.vendas / maxVendas) * 100)}%` }}
                  />
                </div>
                <div className="w-28 text-right font-mono text-sm">
                  {brl(c.vendas)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Pedidos em aberto */}
      <Card className="p-4">
        <h2 className="font-display font-semibold text-sm mb-3">
          Pedidos em aberto
        </h2>
        {(pedidosAbertos ?? []).length === 0 ? (
          <p className="text-[var(--text-faint)] text-sm">
            Nenhum pedido em aberto.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {(pedidosAbertos ?? []).map((p) => (
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
