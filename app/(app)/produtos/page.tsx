import { createClient } from "@/lib/supabase/server";
import { Btn } from "@/components/ui";
import { calcularProduto, numParse } from "@/lib/calc";
import Link from "next/link";
import { Plus } from "lucide-react";
import ProdutosListClient, { type ProdutoListItem } from "@/components/ProdutosListClient";
import type {
  Produto, ProdutoComponente, ProdutoInsumo, Filamento, Insumo, Config,
} from "@/lib/types";

export default async function ProdutosPage() {
  const supabase = await createClient();

  const [
    { data: produtos },
    { data: componentes },
    { data: produtoInsumos },
    { data: filamentos },
    { data: insumos },
    { data: config },
  ] = await Promise.all([
    supabase.from("produtos").select("*").order("nome").returns<Produto[]>(),
    supabase.from("produto_componentes").select("*").returns<ProdutoComponente[]>(),
    supabase.from("produto_insumos").select("*").returns<ProdutoInsumo[]>(),
    supabase.from("filamentos").select("*").returns<Filamento[]>(),
    supabase.from("insumos").select("*").returns<Insumo[]>(),
    supabase.from("config").select("*").single<Config>(),
  ]);

  const piso = config ? numParse(config.piso_rhora) : 0;

  const itens: ProdutoListItem[] = (produtos ?? []).map((produto) => {
    const meusComponentes = (componentes ?? []).filter((c) => c.produto_id === produto.id);
    const meusInsumos = (produtoInsumos ?? []).filter((i) => i.produto_id === produto.id);
    const r = config
      ? calcularProduto(produto, meusComponentes, meusInsumos, filamentos ?? [], insumos ?? [], config)
      : null;

    const rhora = r?.receitaPorHora ?? 0;
    const cor: ProdutoListItem["cor"] =
      !r || piso <= 0 ? "muted" : rhora >= piso * 1.5 ? "green" : rhora >= piso ? "amber" : "red";

    return {
      id: produto.id,
      nome: produto.nome,
      ativo: produto.ativo,
      categoria: produto.categoria,
      custo: r ? r.custoTotalUnidade : null,
      preco: r ? r.precoSugerido : null,
      margem: r ? r.margemReal : 0,
      rhora,
      cor,
      noCatalogo: produto.no_catalogo,
      temFoto: !!produto.foto_url,
      abaixoDoPiso: !!r && piso > 0 && rhora < piso,
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-display font-bold text-xl mb-1">Produtos</h1>
          <p className="text-[var(--text-faint)] text-sm">
            Custo real, preço sugerido e o que já está no catálogo
          </p>
        </div>
        <Link href="/produtos/novo">
          <Btn>
            <Plus size={14} /> Novo produto
          </Btn>
        </Link>
      </div>

      <ProdutosListClient produtos={itens} piso={piso} />
    </div>
  );
}
