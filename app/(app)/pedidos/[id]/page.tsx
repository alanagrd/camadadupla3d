import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Pedido, PedidoItem, Pagamento, Cliente, ContaCrianca } from "@/lib/types";
import PedidoDetalheClient from "@/components/PedidoDetalheClient";

export default async function PedidoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: pedido }, { data: itens }, { data: pagamentos }, { data: criancas }] =
    await Promise.all([
      supabase
        .from("pedidos")
        .select("*, clientes(*)")
        .eq("id", id)
        .single<Pedido & { clientes: Cliente | null }>(),
      supabase
        .from("pedido_itens")
        .select("*, produtos(nome)")
        .eq("pedido_id", id)
        .returns<(PedidoItem & { produtos: { nome: string } | null })[]>(),
      supabase
        .from("pagamentos")
        .select("*")
        .eq("pedido_id", id)
        .order("created_at", { ascending: false })
        .returns<Pagamento[]>(),
      supabase
        .from("contas_criancas")
        .select("*")
        .returns<ContaCrianca[]>(),
    ]);

  if (!pedido) notFound();

  const vendedorNome = pedido.vendedor_id
    ? (criancas ?? []).find((c) => c.id === pedido.vendedor_id)?.nome ?? null
    : null;

  return (
    <PedidoDetalheClient
      pedido={pedido}
      itens={itens ?? []}
      pagamentos={pagamentos ?? []}
      vendedorNome={vendedorNome}
    />
  );
}
