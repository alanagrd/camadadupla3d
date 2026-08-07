import { createClient } from "@/lib/supabase/server";
import ProdutoForm from "@/components/ProdutoForm";
import type { Filamento, Insumo, Config } from "@/lib/types";

export default async function NovoProdutoPage() {
  const supabase = await createClient();

  const [{ data: filamentos }, { data: insumos }, { data: config }] =
    await Promise.all([
      supabase.from("filamentos").select("*").eq("ativo", true).order("nome").returns<Filamento[]>(),
      supabase.from("insumos").select("*").eq("ativo", true).order("nome").returns<Insumo[]>(),
      supabase.from("config").select("*").single<Config>(),
    ]);

  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-6">Novo produto</h1>
      <ProdutoForm
        filamentos={filamentos ?? []}
        insumos={insumos ?? []}
        config={config!}
      />
    </div>
  );
}
