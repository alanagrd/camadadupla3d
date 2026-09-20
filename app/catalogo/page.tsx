import { createClient } from "@/lib/supabase/server";
import CatalogoPublico from "@/components/CatalogoPublico";

export const revalidate = 60; // revalida a cada 60s

export default async function CatalogoPage() {
  const supabase = await createClient();
  const { data: produtos } = await supabase
    .schema("camadadupla")
    .from("produtos")
    .select("id, nome, categoria, descricao_publica, foto_url, preco_catalogo, preco_manual")
    .eq("no_catalogo", true)
    .eq("ativo", true)
    .order("categoria", { ascending: true })
    .order("nome", { ascending: true });

  return <CatalogoPublico produtos={produtos ?? []} />;
}
