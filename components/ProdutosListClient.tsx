"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, Badge } from "@/components/ui";
import { brl } from "@/lib/calc";
import {
  Package, Search, X, LayoutGrid, List as ListIcon,
  ImageOff, Store, AlertTriangle,
} from "lucide-react";

export interface ProdutoListItem {
  id: string;
  nome: string;
  ativo: boolean;
  categoria: string | null;
  custo: number | null;
  preco: number | null;
  margem: number;
  rhora: number;
  cor: "muted" | "amber" | "green" | "red";
  noCatalogo: boolean;
  temFoto: boolean;
  abaixoDoPiso: boolean;
}

type Ordem = "nome" | "preco" | "margem" | "rhora";
type Visao = "grade" | "lista";

/** Remove acentos e caixa para a busca casar "decoracao" com "Decoração". */
function normalizar(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

const SEM_CATEGORIA = "Sem categoria";

export default function ProdutosListClient({
  produtos,
  piso,
}: {
  produtos: ProdutoListItem[];
  piso: number;
}) {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const [soCatalogo, setSoCatalogo] = useState(false);
  const [soSemFoto, setSoSemFoto] = useState(false);
  const [soAbaixoPiso, setSoAbaixoPiso] = useState(false);
  const [ocultarInativos, setOcultarInativos] = useState(false);
  const [ordem, setOrdem] = useState<Ordem>("nome");
  const [visao, setVisao] = useState<Visao>("grade");

  const categorias = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of produtos) {
      const c = p.categoria ?? SEM_CATEGORIA;
      m.set(c, (m.get(c) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], "pt-BR"));
  }, [produtos]);

  const resumo = useMemo(() => ({
    total: produtos.length,
    catalogo: produtos.filter((p) => p.noCatalogo).length,
    semFoto: produtos.filter((p) => p.noCatalogo && !p.temFoto).length,
    abaixoPiso: produtos.filter((p) => p.abaixoDoPiso).length,
  }), [produtos]);

  const visiveis = useMemo(() => {
    const termos = normalizar(busca).split(/\s+/).filter(Boolean);
    const out = produtos.filter((p) => {
      if (categoria && (p.categoria ?? SEM_CATEGORIA) !== categoria) return false;
      if (soCatalogo && !p.noCatalogo) return false;
      if (soSemFoto && (p.temFoto || !p.noCatalogo)) return false;
      if (soAbaixoPiso && !p.abaixoDoPiso) return false;
      if (ocultarInativos && !p.ativo) return false;
      if (termos.length) {
        const alvo = normalizar(`${p.nome} ${p.categoria ?? ""}`);
        if (!termos.every((t) => alvo.includes(t))) return false;
      }
      return true;
    });

    const ordenado = [...out];
    if (ordem === "nome") ordenado.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    if (ordem === "preco") ordenado.sort((a, b) => (b.preco ?? 0) - (a.preco ?? 0));
    if (ordem === "margem") ordenado.sort((a, b) => a.margem - b.margem);
    if (ordem === "rhora") ordenado.sort((a, b) => a.rhora - b.rhora);
    return ordenado;
  }, [produtos, busca, categoria, soCatalogo, soSemFoto, soAbaixoPiso, ocultarInativos, ordem]);

  const filtrando =
    !!busca || !!categoria || soCatalogo || soSemFoto || soAbaixoPiso || ocultarInativos;

  function limparTudo() {
    setBusca(""); setCategoria(null); setSoCatalogo(false);
    setSoSemFoto(false); setSoAbaixoPiso(false); setOcultarInativos(false);
  }

  const chip = (ativo: boolean) =>
    `px-2.5 py-1 rounded-full text-[12px] border transition-colors whitespace-nowrap ${
      ativo
        ? "border-[var(--amber)] bg-[var(--amber)]/12 text-[var(--amber)] font-medium"
        : "border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--border-light)]"
    }`;

  return (
    <>
      {/* resumo */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-[12px] text-[var(--text-faint)] mb-4">
        <span><b className="text-[var(--text)] font-semibold">{resumo.total}</b> produtos</span>
        <span><b className="text-[var(--text)] font-semibold">{resumo.catalogo}</b> no catálogo</span>
        {resumo.semFoto > 0 && (
          <button onClick={() => { limparTudo(); setSoSemFoto(true); }}
            className="hover:text-[var(--amber)] transition-colors">
            <b className="text-[var(--amber)] font-semibold">{resumo.semFoto}</b> sem foto
          </button>
        )}
        {resumo.abaixoPiso > 0 && (
          <button onClick={() => { limparTudo(); setSoAbaixoPiso(true); }}
            className="hover:text-[var(--red)] transition-colors">
            <b className="text-[var(--red)] font-semibold">{resumo.abaixoPiso}</b> abaixo do piso
          </button>
        )}
      </div>

      {/* busca + visão */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-faint)] pointer-events-none" />
          <input
            type="text" value={busca} onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou categoria..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] pl-9 pr-9 py-2 text-[13px] placeholder:text-[var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--amber)] focus:border-transparent transition-shadow"
          />
          {busca && (
            <button type="button" onClick={() => setBusca("")} aria-label="Limpar busca"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text)]">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden shrink-0">
          <button onClick={() => setVisao("grade")} aria-label="Ver em grade"
            className={`px-2.5 ${visao === "grade" ? "bg-[var(--amber)]/15 text-[var(--amber)]" : "text-[var(--text-faint)] hover:text-[var(--text)]"}`}>
            <LayoutGrid size={15} />
          </button>
          <button onClick={() => setVisao("lista")} aria-label="Ver em lista"
            className={`px-2.5 border-l border-[var(--border)] ${visao === "lista" ? "bg-[var(--amber)]/15 text-[var(--amber)]" : "text-[var(--text-faint)] hover:text-[var(--text)]"}`}>
            <ListIcon size={15} />
          </button>
        </div>
      </div>

      {/* categorias */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        <button onClick={() => setCategoria(null)} className={chip(categoria === null)}>
          Todas <span className="opacity-60">{produtos.length}</span>
        </button>
        {categorias.map(([c, n]) => (
          <button key={c} onClick={() => setCategoria(categoria === c ? null : c)} className={chip(categoria === c)}>
            {c} <span className="opacity-60">{n}</span>
          </button>
        ))}
      </div>

      {/* filtros rápidos + ordenação */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <button onClick={() => setSoCatalogo(!soCatalogo)} className={chip(soCatalogo)}>
          <Store size={11} className="inline mr-1 -mt-0.5" />No catálogo
        </button>
        <button onClick={() => setSoSemFoto(!soSemFoto)} className={chip(soSemFoto)}>
          <ImageOff size={11} className="inline mr-1 -mt-0.5" />Sem foto
        </button>
        <button onClick={() => setSoAbaixoPiso(!soAbaixoPiso)} className={chip(soAbaixoPiso)}>
          <AlertTriangle size={11} className="inline mr-1 -mt-0.5" />Abaixo do piso
        </button>
        <button onClick={() => setOcultarInativos(!ocultarInativos)} className={chip(ocultarInativos)}>
          Só ativos
        </button>

        <div className="ml-auto flex items-center gap-2">
          {filtrando && (
            <button onClick={limparTudo} className="text-[12px] text-[var(--text-faint)] hover:text-[var(--text)] underline underline-offset-2">
              limpar
            </button>
          )}
          <select value={ordem} onChange={(e) => setOrdem(e.target.value as Ordem)}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2.5 py-1.5 text-[12px] focus:outline-none focus:ring-2 focus:ring-[var(--amber)]">
            <option value="nome">Nome (A→Z)</option>
            <option value="preco">Maior preço</option>
            <option value="margem">Menor margem</option>
            <option value="rhora">Menor R$/h</option>
          </select>
        </div>
      </div>

      {filtrando && (
        <p className="text-[var(--text-faint)] text-xs mb-3">
          {visiveis.length === 0 ? "Nenhum resultado" : `${visiveis.length} de ${produtos.length} produtos`}
        </p>
      )}

      {/* GRADE */}
      {visao === "grade" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visiveis.map((p) => (
            <Link key={p.id} href={`/produtos/${p.id}`}>
              <Card className="p-4 hover:border-[var(--amber)]/40 transition-colors h-full">
                <div className="flex items-start gap-2 mb-2">
                  <Package size={14} className="text-[var(--amber)] mt-0.5 shrink-0" />
                  <span className="font-semibold text-sm leading-snug flex-1">{p.nome}</span>
                  {!p.ativo && <Badge>inativo</Badge>}
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {p.categoria && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--text-muted)]">
                      {p.categoria}
                    </span>
                  )}
                  {p.noCatalogo && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--amber)]/12 text-[var(--amber)]">
                      catálogo
                    </span>
                  )}
                  {p.noCatalogo && !p.temFoto && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--red)]/12 text-[var(--red)]">
                      sem foto
                    </span>
                  )}
                </div>
                {p.custo != null && p.preco != null && (
                  <>
                    <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                      <span>Custo</span><span className="font-mono">{brl(p.custo)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
                      <span>Preço</span>
                      <span className="font-mono text-[var(--amber)]">{brl(p.preco)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-[var(--text-muted)] mb-3">
                      <span>Margem</span><span className="font-mono">{p.margem.toFixed(0)}%</span>
                    </div>
                    <Badge color={p.cor}>{brl(p.rhora)}/h de máquina</Badge>
                  </>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* LISTA */}
      {visao === "lista" && (
        <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
          <table className="w-full text-[13px] min-w-[620px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-[var(--text-faint)] border-b border-[var(--border)]">
                <th className="text-left font-semibold px-3 py-2">Produto</th>
                <th className="text-left font-semibold px-3 py-2">Categoria</th>
                <th className="text-right font-semibold px-3 py-2">Custo</th>
                <th className="text-right font-semibold px-3 py-2">Preço</th>
                <th className="text-right font-semibold px-3 py-2">Margem</th>
                <th className="text-right font-semibold px-3 py-2">R$/h</th>
              </tr>
            </thead>
            <tbody>
              {visiveis.map((p) => (
                <tr key={p.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-2)]">
                  <td className="px-3 py-2">
                    <Link href={`/produtos/${p.id}`} className="flex items-center gap-1.5 hover:text-[var(--amber)]">
                      <span className="font-medium">{p.nome}</span>
                      {p.noCatalogo && <Store size={11} className="text-[var(--amber)] shrink-0" />}
                      {p.noCatalogo && !p.temFoto && <ImageOff size={11} className="text-[var(--red)] shrink-0" />}
                      {!p.ativo && <span className="text-[10px] text-[var(--text-faint)]">(inativo)</span>}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-[var(--text-muted)] text-[12px]">{p.categoria ?? "—"}</td>
                  <td className="px-3 py-2 text-right font-mono">{p.custo != null ? brl(p.custo) : "—"}</td>
                  <td className="px-3 py-2 text-right font-mono text-[var(--amber)]">{p.preco != null ? brl(p.preco) : "—"}</td>
                  <td className="px-3 py-2 text-right font-mono">{p.margem.toFixed(0)}%</td>
                  <td className={`px-3 py-2 text-right font-mono ${p.abaixoDoPiso ? "text-[var(--red)]" : "text-[var(--green)]"}`}>
                    {brl(p.rhora)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {produtos.length === 0 && (
        <p className="text-[var(--text-faint)] text-sm mt-4">Nenhum produto cadastrado ainda.</p>
      )}
      {produtos.length > 0 && visiveis.length === 0 && (
        <div className="text-center py-10">
          <p className="text-[var(--text-faint)] text-sm mb-2">Nenhum produto com esses filtros.</p>
          <button onClick={limparTudo} className="text-[13px] text-[var(--amber)] hover:underline">
            Limpar filtros
          </button>
        </div>
      )}
      {piso > 0 && visiveis.length > 0 && (
        <p className="text-[var(--text-faint)] text-[11px] mt-4">
          Piso configurado: {brl(piso)}/h de máquina.
        </p>
      )}
    </>
  );
}
