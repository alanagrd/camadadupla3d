import { createClient } from "@/lib/supabase/server";
import { Card, Btn } from "@/components/ui";
import Link from "next/link";
import { Plus } from "lucide-react";
import type { Pedido, PedidoItem, Cliente, ContaCrianca } from "@/lib/types";
import PedidosListClient from "@/components/PedidosListClient";

export default async function PedidosPage() {
  const supabase = await createClient();

  const [{ data: pedidos }, { data: itens }, { data: criancas }] =
    await Promise.all([
      supabase
        .from("pedidos")
        .select("*, clientes(nome)")
        .order("created_at", { ascending: false })
        .returns<(Pedido & { clientes: Cliente | null })[]>(),
      supabase.from("pedido_itens").select("*").returns<PedidoItem[]>(),
      supabase
        .from("contas_criancas")
        .select("*")
        .order("nome")
        .returns<ContaCrianca[]>(),
    ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-xl mb-1">Pedidos</h1>
          <p className="text-[var(--text-faint)] text-sm">
            Tudo que o Kayky, o Yago (e você) já tiraram de pedido
          </p>
        </div>
        <Link href="/pedidos/novo">
          <Btn>
            <Plus size={14} /> Novo pedido
          </Btn>
        </Link>
      </div>

      <Card>
        <PedidosListClient
          pedidos={pedidos ?? []}
          itens={itens ?? []}
          criancas={criancas ?? []}
        />
        {(pedidos ?? []).length === 0 && (
          <p className="text-[var(--text-faint)] text-sm p-4">
            Nenhum pedido ainda.
          </p>
        )}
      </Card>
    </div>
  );
}
