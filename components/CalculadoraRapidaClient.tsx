"use client";

import { useState, useMemo } from "react";
import type { Config } from "@/lib/types";
import { numParse, parseTempoParaMinutos, custoHoraMaquina, brl } from "@/lib/calc";

interface Props {
  config: Config;
}

export default function CalculadoraRapidaClient({ config }: Props) {
  const [gramas, setGramas] = useState("");
  const [precoKg, setPrecoKg] = useState("");
  const [tempo, setTempo] = useState("");
  const [qtdChapa, setQtdChapa] = useState("1");
  const [tempoAcabamento, setTempoAcabamento] = useState("");
  const [perdaPct, setPerdaPct] = useState("5");
  const [margem, setMargem] = useState(String(config.margem_padrao_pct ?? 30));

  const resultado = useMemo(() => {
    const g = numParse(gramas);
    const pkg = numParse(precoKg);
    const min = parseTempoParaMinutos(tempo);
    const qtd = Math.max(numParse(qtdChapa) || 1, 1);
    const minAcab = parseTempoParaMinutos(tempoAcabamento);
    const perda = numParse(perdaPct);
    const mg = numParse(margem);

    const horas = min / 60;
    const rhoraMaquina = custoHoraMaquina(config);

    const custoFilamento = (g / 1000) * pkg;
    const custoPerda = custoFilamento * (perda / 100);
    const custoMaquinaChapa = horas * rhoraMaquina;
    const custoMaquinaUnidade = custoMaquinaChapa / qtd;
    const custoTrabalhoUnidade = (minAcab / 60) * numParse(config.custo_hora_trabalho);
    const taxaFalha = numParse(config.taxa_falha_pct) / 100;
    const custoRefugo = (custoFilamento + custoPerda + custoMaquinaUnidade) * taxaFalha;

    const custoTotal =
      custoFilamento +
      custoPerda +
      custoMaquinaUnidade +
      custoTrabalhoUnidade +
      custoRefugo;

    const precoSugerido =
      mg >= 100 ? custoTotal * 2 : custoTotal / (1 - mg / 100);
    const lucro = precoSugerido - custoTotal;
    const markup = custoTotal > 0 ? (lucro / custoTotal) * 100 : 0;
    const margemReal = precoSugerido > 0 ? (lucro / precoSugerido) * 100 : 0;
    const receitaHora = horas > 0 ? (precoSugerido * qtd) / horas : 0;

    return {
      custoFilamento,
      custoPerda,
      custoMaquinaUnidade,
      custoTrabalhoUnidade,
      custoRefugo,
      custoTotal,
      precoSugerido,
      lucro,
      markup,
      margemReal,
      receitaHora,
      rhoraMaquina,
      horas,
    };
  }, [gramas, precoKg, tempo, qtdChapa, tempoAcabamento, perdaPct, margem, config]);

  const inputCls =
    "w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--amber)] transition-shadow";
  const labelCls = "block text-[11px] font-medium text-[var(--text-muted)] mb-1 uppercase tracking-wide";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start">
      {/* Inputs */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-4">
        <h2 className="text-[13px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
          Parâmetros
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Gramas (g)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="ex: 85"
              className={inputCls}
              value={gramas}
              onChange={(e) => setGramas(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Preço / kg (R$)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="ex: 80"
              className={inputCls}
              value={precoKg}
              onChange={(e) => setPrecoKg(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Tempo impressão (h:mm)</label>
            <input
              type="text"
              placeholder="ex: 1:45"
              className={inputCls}
              value={tempo}
              onChange={(e) => setTempo(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Peças por chapa</label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="ex: 4"
              className={inputCls}
              value={qtdChapa}
              onChange={(e) => setQtdChapa(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Acabamento / peça (h:mm)</label>
            <input
              type="text"
              placeholder="ex: 0:10"
              className={inputCls}
              value={tempoAcabamento}
              onChange={(e) => setTempoAcabamento(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Perda extra (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              className={inputCls}
              value={perdaPct}
              onChange={(e) => setPerdaPct(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Margem desejada (%)</label>
          <input
            type="number"
            min="0"
            max="99"
            step="1"
            className={inputCls}
            value={margem}
            onChange={(e) => setMargem(e.target.value)}
          />
          <p className="text-[11px] text-[var(--text-faint)] mt-1">
            Padrão da configuração: {config.margem_padrao_pct}%
          </p>
        </div>

        <div className="border-t border-[var(--border)] pt-3 text-[11px] text-[var(--text-faint)] space-y-0.5">
          <p>R$/h máquina: {brl(resultado.rhoraMaquina)}</p>
          <p>R$/h trabalho: {brl(numParse(config.custo_hora_trabalho))}</p>
          <p>Taxa falha: {config.taxa_falha_pct}%</p>
        </div>
      </div>

      {/* Resultado */}
      <div className="flex flex-col gap-4">
        {/* Preço sugerido em destaque */}
        <div className="rounded-xl border-2 border-[var(--amber)] bg-[var(--surface)] p-6 text-center">
          <p className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wide mb-1">
            Preço Sugerido
          </p>
          <p className="text-4xl font-bold text-[var(--amber)]">
            {brl(resultado.precoSugerido)}
          </p>
          <p className="text-[12px] text-[var(--text-faint)] mt-1">
            Lucro: {brl(resultado.lucro)} · Markup: {resultado.markup.toFixed(1)}% · Margem real: {resultado.margemReal.toFixed(1)}%
          </p>
        </div>

        {/* Receita por hora */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
          <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1">
            Receita por hora de impressora
          </p>
          <p className="text-2xl font-semibold">
            {resultado.receitaHora > 0 ? brl(resultado.receitaHora) + "/h" : "—"}
          </p>
        </div>

        {/* Breakdown de custos */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h3 className="text-[12px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-4">
            Composição do custo ({brl(resultado.custoTotal)} / peça)
          </h3>
          <div className="space-y-2">
            {[
              { label: "Filamento", valor: resultado.custoFilamento },
              { label: `Perda extra (${perdaPct}%)`, valor: resultado.custoPerda },
              { label: "Máquina", valor: resultado.custoMaquinaUnidade },
              { label: "Trabalho (acabamento)", valor: resultado.custoTrabalhoUnidade },
              { label: `Refugo (${config.taxa_falha_pct}%)`, valor: resultado.custoRefugo },
            ].map(({ label, valor }) => {
              const pct =
                resultado.custoTotal > 0 ? (valor / resultado.custoTotal) * 100 : 0;
              return (
                <div key={label}>
                  <div className="flex justify-between text-[13px] mb-1">
                    <span className="text-[var(--text-muted)]">{label}</span>
                    <span className="font-medium">
                      {brl(valor)}{" "}
                      <span className="text-[var(--text-faint)] font-normal text-[11px]">
                        ({pct.toFixed(0)}%)
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[var(--amber)]"
                      style={{ width: `${pct}%`, opacity: 0.7 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info adicional */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1">
              Tempo impressão
            </p>
            <p className="text-xl font-semibold">
              {resultado.horas > 0
                ? `${Math.floor(resultado.horas)}h ${Math.round((resultado.horas % 1) * 60)}m`
                : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <p className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide mb-1">
              Peças na chapa
            </p>
            <p className="text-xl font-semibold">{Math.max(numParse(qtdChapa) || 1, 1)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
