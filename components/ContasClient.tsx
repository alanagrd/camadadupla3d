"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, Input, Btn, Select, SectionTitle } from "@/components/ui";
import { brl } from "@/lib/calc";
import { Plus, Wallet, PiggyBank, TrendingUp } from "lucide-react";
import type { ContaCrianca, MovimentacaoConta, MovimentacaoTipo, Pote } from "@/lib/types";

const POTE_INFO: Record<Pote, { label: string; icon: typeof Wallet; cor: string }> = {
  gastar: { label: "Gastar", icon: Wallet, cor: "var(--amber)" },
  guardar: { label: "Guardar", icon: PiggyBank, cor: "var(--green)" },
  reinvestir: { label: "Reinvestir", icon: TrendingUp, cor: "#7aa2f7" },
};

export default function ContasClient({
  criancas,
  movimentacoes,
}: {
  criancas: ContaCrianca[];
  movimentacoes: MovimentacaoConta[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [criancaSelecionada, setCriancaSelecionada] = useState(criancas[0]?.id ?? "");
  const [tipo, setTipo] = useState<MovimentacaoTipo>("venda");
  const [pote, setPote] = useState<Pote>("guardar");
  const [valor, setValor] = useState("");
  const [descricao, setDescricao] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function registrar() {
    const v = parseFloat(valor.replace(",", "."));
    if (!v || !criancaSelecionada) return;
    setSalvando(true);
    await supabase.from("movimentacoes_conta").insert({
      crianca_id: criancaSelecionada,
      tipo,
      pote: tipo === "venda" || tipo === "deposito" ? pote : null,
      valor: tipo === "custo_material" || tipo === "retirada" ? -Math.abs(v) : Math.abs(v),
      descricao: descricao || null,
    });
    setValor("");
    setDescricao("");
    setSalvando(false);
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-6">Contas das crianças</h1>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {criancas.map((c) => {
          const minhas = movimentacoes.filter((m) => m.crianca_id === c.id);
          const saldoTotal = minhas.reduce((acc, m) => acc + m.valor, 0);
          const porPote = (["gastar", "guardar", "reinvestir"] as Pote[]).map((p) => ({
            pote: p,
            saldo: minhas.filter((m) => m.pote === p).reduce((acc, m) => acc + m.valor, 0),
          }));

          return (
            <Card key={c.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-semibold">{c.nome}</span>
                <span className="font-mono font-bold text-[var(--amber)]">
                  {brl(saldoTotal)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {porPote.map(({ pote, saldo }) => {
                  const info = POTE_INFO[pote];
                  return (
                    <div
                      key={pote}
                      className="bg-[var(--surface-2)] rounded-lg p-2.5 text-center"
                    >
                      <info.icon size={14} color={info.cor} className="mx-auto mb-1" />
                      <div className="text-[10px] text-[var(--text-faint)] uppercase mb-0.5">
                        {info.label}
                      </div>
                      <div className="text-xs font-mono">{brl(saldo)}</div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-4 mb-4">
        <SectionTitle>Registrar movimentação</SectionTitle>
        <div className="grid grid-cols-5 gap-2 mb-3">
          <Select value={criancaSelecionada} onChange={setCriancaSelecionada}>
            {criancas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>
          <Select value={tipo} onChange={(v) => setTipo(v as MovimentacaoTipo)}>
            <option value="venda">Venda</option>
            <option value="custo_material">Custo material</option>
            <option value="retirada">Retirada</option>
            <option value="deposito">Depósito</option>
          </Select>
          {(tipo === "venda" || tipo === "deposito") && (
            <Select value={pote} onChange={(v) => setPote(v as Pote)}>
              <option value="gastar">Gastar</option>
              <option value="guardar">Guardar</option>
              <option value="reinvestir">Reinvestir</option>
            </Select>
          )}
          <Input type="number" value={valor} onChange={setValor} suffix="R$" />
          <Input mono={false} value={descricao} onChange={setDescricao} placeholder="Descrição" />
        </div>
        <Btn onClick={registrar} disabled={salvando}>
          <Plus size={13} /> Registrar
        </Btn>
      </Card>

      <Card className="p-4">
        <SectionTitle>Histórico</SectionTitle>
        <div className="flex flex-col gap-1.5">
          {movimentacoes.slice(0, 20).map((m) => {
            const crianca = criancas.find((c) => c.id === m.crianca_id);
            return (
              <div key={m.id} className="flex justify-between text-xs py-1.5 border-b border-[var(--border)] last:border-0">
                <span className="text-[var(--text-muted)]">
                  {crianca?.nome} · {m.tipo.replace("_", " ")}
                  {m.descricao ? ` — ${m.descricao}` : ""}
                </span>
                <span className={`font-mono ${m.valor < 0 ? "text-[var(--red)]" : "text-[var(--green)]"}`}>
                  {brl(m.valor)}
                </span>
              </div>
            );
          })}
          {movimentacoes.length === 0 && (
            <p className="text-xs text-[var(--text-faint)]">Nenhuma movimentação ainda.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
