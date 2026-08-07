import { createClient } from "@/lib/supabase/server";
import NovoPedidoForm from "@/components/NovoPedidoForm";
import type { Cliente, Produto } from "@/lib/types";

export default async function NovoPedidoPage() {
  const supabase = await createClient();

  const [{ data: clientes }, { data: produtos }] = await Promise.all([
    supabase.from("clientes").select("*").order("nome").returns<Cliente[]>(),
    supabase
      .from("produtos")
      .select("*")
      .eq("ativo", true)
      .order("nome")
      .returns<Produto[]>(),
  ]);

  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-6">Novo pedido</h1>
      <NovoPedidoForm clientes={clientes ?? []} produtos={produtos ?? []} />
    </div>
  );
}
