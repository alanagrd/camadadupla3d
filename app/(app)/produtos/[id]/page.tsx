import { createClient } from "@/lib/supabase/server";
import ProdutoForm from "@/components/ProdutoForm";
import type { Produto, ProdutoComponente, Filamento, Insumo, Config } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function EditarProdutoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [
    { data: produto },
    { data: componentes },
    { data: produtoInsumos },
    { data: filamentos },
    { data: insumos },
    { data: config },
  ] = await Promise.all([
    supabase.from("produtos").select("*").eq("id", id).single<Produto>(),
    supabase
      .from("produto_componentes")
      .select("*")
      .eq("produto_id", id)
      .returns<ProdutoComponente[]>(),
    supabase.from("produto_insumos").select("insumo_id, qtd").eq("produto_id", id),
    supabase.from("filamentos").select("*").eq("ativo", true).order("nome").returns<Filamento[]>(),
    supabase.from("insumos").select("*").eq("ativo", true).order("nome").returns<Insumo[]>(),
    supabase.from("config").select("*").single<Config>(),
  ]);

  if (!produto) notFound();

  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-6">{produto.nome}</h1>
      <ProdutoForm
        filamentos={filamentos ?? []}
        insumos={insumos ?? []}
        config={config!}
        produtoExistente={produto}
        componentesExistentes={componentes ?? []}
        insumosExistentes={produtoInsumos ?? []}
      />
    </div>
  );
}
