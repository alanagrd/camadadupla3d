"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, Badge, Btn, Input, Select, SectionTitle } from "@/components/ui";
import { brl } from "@/lib/calc";
import { Plus, Pencil } from "lucide-react";
import Link from "next/link";
import type {
  Pedido,
  PedidoItem,
  Pagamento,
  Cliente,
  PedidoStatus,
  PagamentoForma,
} from "@/lib/types";

const STATUS_OPCOES: PedidoStatus[] = [
  "novo",
  "em_producao",
  "pronto",
  "entregue",
  "cancelado",
];

export default function PedidoDetalheClient({
  pedido,
  itens,
  pagamentos,
  vendedorNome,
}: {
  pedido: Pedido & { clientes: Cliente | null };
  itens: (PedidoItem & { produtos: { nome: string } | null })[];
  pagamentos: Pagamento[];
  vendedorNome?: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [status, setStatus] = useState(pedido.status);
  const [mudandoStatus, setMudandoStatus] = useState(false);

  const [valorPagamento, setValorPagamento] = useState("");
  const [formaPagamento, setFormaPagamento] = useState<PagamentoForma>("pix");
  const [salvandoPagamento, setSalvandoPagamento] = useState(false);

  const total = itens.reduce((acc, i) => acc + i.preco_unitario * i.quantidade, 0);
  const totalPago = pagamentos
    .filter((p) => p.status === "pago")
    .reduce((acc, p) => acc + p.valor, 0);

  async function mudarStatus(novo: PedidoStatus) {
    setMudandoStatus(true);
    await supabase.from("pedidos").update({ status: novo }).eq("id", pedido.id);
    setStatus(novo);
    setMudandoStatus(false);
    router.refresh();
  }

  async function registrarPagamento() {
    const valor = parseFloat(valorPagamento.replace(",", "."));
    if (!valor) return;
    setSalvandoPagamento(true);
    await supabase.from("pagamentos").insert({
      pedido_id: pedido.id,
      valor,
      forma: formaPagamento,
      status: "pago",
      pago_em: new Date().toISOString(),
    });
    setValorPagamento("");
    setSalvandoPagamento(false);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-xl mb-1">
            {pedido.clientes?.nome ?? "Sem cliente"}
          </h1>
          <div className="flex items-center gap-3 text-sm text-[var(--text-faint)]">
            {pedido.clientes?.telefone && <span>{pedido.clientes.telefone}</span>}
            {pedido.clientes?.instagram && (
              <span>@{pedido.clientes.instagram}</span>
            )}
            {vendedorNome && (
              <Badge color="amber">vendedor: {vendedorNome}</Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/pedidos/${pedido.id}/editar`}
            className="p-2 rounded-lg border border-[var(--border-light)] text-[var(--text-faint)] hover:text-[var(--amber)] hover:border-[var(--amber)] transition-colors"
            title="Editar pedido"
          >
            <Pencil size={14} />
          </Link>
          <div className="flex gap-1.5">
            {STATUS_OPCOES.map((s) => (
              <button
                key={s}
                onClick={() => mudarStatus(s)}
                disabled={mudandoStatus}
                className={`px-2.5 py-1 rounded-full text-[11px] border capitalize ${
                  status === s
                    ? "border-[var(--amber)] bg-[var(--amber-dim)]/30 text-[var(--amber)]"
                    : "border-[var(--border-light)] text-[var(--text-faint)]"
                }`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_300px] gap-4">
        <Card className="p-4">
          <SectionTitle>Itens</SectionTitle>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase text-[var(--text-faint)] border-b border-[var(--border)]">
                <th className="py-2">Produto</th>
                <th className="py-2">Nome gravado</th>
                <th className="py-2">Qtd</th>
                <th className="py-2 text-right">Preço</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item) => (
                <tr key={item.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2">{item.produtos?.nome ?? "—"}</td>
                  <td className="py-2 text-[var(--text-muted)]">
                    {item.nome_personalizado ?? "—"}
                  </td>
                  <td className="py-2 font-mono">{item.quantidade}</td>
                  <td className="py-2 font-mono text-right">
                    {brl(item.preco_unitario * item.quantidade)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between mt-3 pt-3 border-t border-[var(--border)] font-semibold text-sm">
            <span>Total</span>
            <span className="font-mono">{brl(total)}</span>
          </div>

          {pedido.observacoes && (
            <>
              <div className="h-px bg-[var(--border)] my-4" />
              <SectionTitle>Observações</SectionTitle>
              <p className="text-sm text-[var(--text-muted)]">{pedido.observacoes}</p>
            </>
          )}
        </Card>

        <div className="flex flex-col gap-3.5">
          <Card className="p-4">
            <div className="text-[11px] text-[var(--text-muted)] uppercase mb-1">
              Pago até agora
            </div>
            <div className="font-display text-xl font-bold text-[var(--green)]">
              {brl(totalPago)}
            </div>
            <div className="text-xs text-[var(--text-faint)] mt-1">
              de {brl(total)} ({total > 0 ? Math.round((totalPago / total) * 100) : 0}%)
            </div>
          </Card>

          <Card className="p-4">
            <SectionTitle>Pagamentos</SectionTitle>
            <div className="flex flex-col gap-1.5 mb-3">
              {pagamentos.map((p) => (
                <div key={p.id} className="flex justify-between text-xs">
                  <Badge color={p.status === "pago" ? "green" : "muted"}>
                    {p.forma ?? "—"}
                  </Badge>
                  <span className="font-mono">{brl(p.valor)}</span>
                </div>
              ))}
              {pagamentos.length === 0 && (
                <p className="text-xs text-[var(--text-faint)]">Nenhum pagamento ainda.</p>
              )}
            </div>
            <div className="flex gap-1.5">
              <Input type="number" value={valorPagamento} onChange={setValorPagamento} suffix="R$" />
              <Select
                value={formaPagamento}
                onChange={(v) => setFormaPagamento(v as PagamentoForma)}
              >
                <option value="pix">Pix</option>
                <option value="dinheiro">Dinheiro</option>
                <option value="cartao">Cartão</option>
                <option value="outro">Outro</option>
              </Select>
            </div>
            <div className="mt-2">
              <Btn
                variant="ghost"
                full
                onClick={registrarPagamento}
                disabled={salvandoPagamento}
              >
                <Plus size={13} /> Registrar
              </Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
