import { createClient } from "@/lib/supabase/server";
import type { ContaCrianca, MovimentacaoConta } from "@/lib/types";
import ContasClient from "@/components/ContasClient";

export default async function ContasPage() {
  const supabase = await createClient();

  const [{ data: criancas }, { data: movimentacoes }] = await Promise.all([
    supabase.from("contas_criancas").select("*").order("nome").returns<ContaCrianca[]>(),
    supabase
      .from("movimentacoes_conta")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<MovimentacaoConta[]>(),
  ]);

  return (
    <ContasClient
      criancas={criancas ?? []}
      movimentacoes={movimentacoes ?? []}
    />
  );
}
