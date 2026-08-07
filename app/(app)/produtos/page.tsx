import { createClient } from "@/lib/supabase/server";
import { Card, Btn, Badge } from "@/components/ui";
import { calcularProduto, brl } from "@/lib/calc";
import Link from "next/link";
import { Plus, Package } from "lucide-react";
import type {
  Produto,
  ProdutoComponente,
  ProdutoInsumo,
  Filamento,
  Insumo,
  Config,
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-xl mb-1">Produtos</h1>
          <p className="text-[var(--text-faint)] text-sm">
            Catálogo com custo real e preço sugerido
          </p>
        </div>
        <Link href="/produtos/novo">
          <Btn>
            <Plus size={14} /> Novo produto
          </Btn>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(produtos ?? []).map((produto) => {
          const meusComponentes = (componentes ?? []).filter(
            (c) => c.produto_id === produto.id
          );
          const meusInsumos = (produtoInsumos ?? []).filter(
            (i) => i.produto_id === produto.id
          );
          const resultado =
            config &&
            calcularProduto(
              produto,
              meusComponentes,
              meusInsumos,
              filamentos ?? [],
              insumos ?? [],
              config
            );

          const piso = config?.piso_rhora ?? 30;
          const rhora = resultado?.receitaPorHora ?? 0;
          const cor = rhora >= piso * 1.5 ? "green" : rhora >= piso ? "amber" : "red";

          return (
            <Link key={produto.id} href={`/produtos/${produto.id}`}>
              <Card className="p-4 hover:border-[var(--amber)]/40 transition-colors h-full">
                <div className="flex items-center gap-2 mb-3">
                  <Package size={14} className="text-[var(--amber)]" />
                  <span className="font-semibold text-sm">{produto.nome}</span>
                  {!produto.ativo && <Badge>inativo</Badge>}
                </div>
                {resultado && (
                  <>
                    <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                      <span>Custo</span>
                      <span className="font-mono">{brl(resultado.custoTotalUnidade)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[var(--text-muted)] mb-3">
                      <span>Preço</span>
                      <span className="font-mono text-[var(--amber)]">
                        {brl(resultado.precoSugerido)}
                      </span>
                    </div>
                    <Badge color={cor}>{brl(rhora)}/h de máquina</Badge>
                  </>
                )}
              </Card>
            </Link>
          );
        })}
      </div>

      {(produtos ?? []).length === 0 && (
        <p className="text-[var(--text-faint)] text-sm mt-4">
          Nenhum produto cadastrado ainda.
        </p>
      )}
    </div>
  );
}
