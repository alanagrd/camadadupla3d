import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EditarPedidoForm from "@/components/EditarPedidoForm";
import type { Pedido, Cliente, ContaCrianca } from "@/lib/types";

export default async function EditarPedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: pedido }, { data: criancas }] = await Promise.all([
    supabase
      .from("pedidos")
      .select("*, clientes(*)")
      .eq("id", id)
      .single<Pedido & { clientes: Cliente | null }>(),
    supabase
      .from("contas_criancas")
      .select("*")
      .order("nome")
      .returns<ContaCrianca[]>(),
  ]);

  if (!pedido) notFound();

  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-1">Editar pedido</h1>
      <p className="text-[var(--text-faint)] text-sm mb-6">
        {pedido.clientes?.nome ?? "Sem cliente"}
      </p>
      <EditarPedidoForm pedido={pedido} criancas={criancas ?? []} />
    </div>
  );
}
