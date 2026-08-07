import { createClient } from "@/lib/supabase/server";
import type { Filamento, Insumo } from "@/lib/types";
import EstoqueClient from "@/components/EstoqueClient";

export default async function EstoquePage() {
  const supabase = await createClient();

  const [{ data: filamentos }, { data: insumos }] = await Promise.all([
    supabase.from("filamentos").select("*").order("nome").returns<Filamento[]>(),
    supabase.from("insumos").select("*").order("nome").returns<Insumo[]>(),
  ]);

  return (
    <EstoqueClient
      filamentosIniciais={filamentos ?? []}
      insumosIniciais={insumos ?? []}
    />
  );
}
