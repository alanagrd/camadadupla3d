// Portado 1:1 da versão já testada no Precificador standalone
// (mesmas fórmulas, mesmos parsers de vírgula e h:mm validados lá).

import type { Config, Filamento, Insumo, Produto, ProdutoComponente, ProdutoInsumo } from "./types";

export function numParse(v: unknown): number {
  if (typeof v === "number") return isNaN(v) ? 0 : v;
  if (v == null || v === "") return 0;
  const n = parseFloat(String(v).replace(",", "."));
  return isNaN(n) ? 0 : n;
}

// aceita "4:14" (h:mm), "4h14m" (formato do Bambu Studio), ou minutos puros
export function parseTempoParaMinutos(v: unknown): number {
  if (v == null) return 0;
  const s = String(v).trim();
  if (s === "") return 0;

  if (s.includes(":")) {
    const [h, m] = s.split(":");
    return numParse(h) * 60 + numParse(m || 0);
  }

  const mh = s.match(/(-?[\d.,]+)\s*h/i);
  const mm = s.match(/(-?[\d.,]+)\s*m(?!s)/i);
  if (mh || mm) {
    return (mh ? numParse(mh[1]) : 0) * 60 + (mm ? numParse(mm[1]) : 0);
  }

  return numParse(s);
}

// formata minutos de volta pra h:mm, pra exibir no formulário
export function minutosParaHMM(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return `${h}:${String(m).padStart(2, "0")}`;
}

// R$/hora de máquina: deriva de energia (W × tarifa) + depreciação
// (preço da impressora ÷ vida útil em horas). Se esses campos estiverem
// zerados, cai no valor fixo custo_hora_maquina (retrocompatível).
export function custoHoraMaquina(config: Config): number {
  const energia = (numParse(config.potencia_w) / 1000) * numParse(config.tarifa_kwh);
  const vida = numParse(config.vida_util_horas);
  const depreciacao = vida > 0 ? numParse(config.preco_impressora) / vida : 0;
  const derivado = energia + depreciacao;
  return derivado > 0 ? derivado : numParse(config.custo_hora_maquina);
}

export interface ResultadoCalculo {
  custoFilamento: number;
  custoPerda: number;
  custoInsumos: number;
  custoMaquinaUnidade: number;
  custoTrabalhoUnidade: number;
  custoRefugo: number;
  custoTotalUnidade: number;
  rhoraMaquina: number;
  margem: number;
  precoSugerido: number;
  lucroUnidade: number;
  markup: number;
  margemReal: number;
  receitaPorHora: number;
  lucroPorHora: number;
  precoParaPiso: number;
  horas: number;
  unidades: number;
}

export function calcularProduto(
  produto: Produto,
  componentes: ProdutoComponente[],
  produtoInsumos: ProdutoInsumo[],
  filamentos: Filamento[],
  insumos: Insumo[],
  config: Config
): ResultadoCalculo {
  const custoFilamento = componentes.reduce((acc, c) => {
    const fil = filamentos.find((f) => f.id === c.filamento_id);
    const preco = fil ? numParse(fil.preco_kg) : 0;
    return acc + (numParse(c.gramas) / 1000) * preco;
  }, 0);

  const custoPerda = custoFilamento * (numParse(produto.perda_extra_pct) / 100);

  const custoInsumos = produtoInsumos.reduce((acc, u) => {
    const ins = insumos.find((i) => i.id === u.insumo_id);
    return acc + (ins ? numParse(ins.custo) * (numParse(u.qtd) || 1) : 0);
  }, 0);

  const horas = parseTempoParaMinutos(produto.tempo_impressao_min) / 60;
  const unidades = Math.max(numParse(produto.pecas_por_chapa) || 1, 1);
  const rhoraMaquina = custoHoraMaquina(config);
  const custoMaquinaChapa = horas * rhoraMaquina;
  const custoMaquinaUnidade = custoMaquinaChapa / unidades;

  // mão de obra: tempo de acabamento (min por peça) × R$/h de trabalho
  const custoTrabalhoUnidade =
    (parseTempoParaMinutos(produto.tempo_acabamento_min) / 60) *
    numParse(config.custo_hora_trabalho);

  // refugo: prints que falham queimam material E tempo de máquina
  const taxaFalha = numParse(config.taxa_falha_pct) / 100;
  const custoRefugo = (custoFilamento + custoPerda + custoMaquinaUnidade) * taxaFalha;

  const custoTotalUnidade =
    custoFilamento +
    custoPerda +
    custoInsumos +
    custoMaquinaUnidade +
    custoTrabalhoUnidade +
    custoRefugo;

  const margem =
    produto.margem_personalizada != null
      ? numParse(produto.margem_personalizada)
      : numParse(config.margem_padrao_pct);

  const precoManual =
    produto.preco_manual != null ? numParse(produto.preco_manual) : null;

  const precoSugerido =
    precoManual != null
      ? precoManual
      : margem >= 100
      ? custoTotalUnidade * 2
      : custoTotalUnidade / (1 - margem / 100);

  const lucroUnidade = precoSugerido - custoTotalUnidade;
  const markup = custoTotalUnidade > 0 ? (lucroUnidade / custoTotalUnidade) * 100 : 0;
  const margemReal = precoSugerido > 0 ? (lucroUnidade / precoSugerido) * 100 : 0;
  const receitaPorHora = horas > 0 ? (precoSugerido * unidades) / horas : 0;
  const lucroPorHora = horas > 0 ? (lucroUnidade * unidades) / horas : 0;
  const precoParaPiso =
    horas > 0 ? (numParse(config.piso_rhora) * horas) / unidades : 0;

  return {
    custoFilamento,
    custoPerda,
    custoInsumos,
    custoMaquinaUnidade,
    custoTrabalhoUnidade,
    custoRefugo,
    custoTotalUnidade,
    rhoraMaquina,
    margem,
    precoSugerido,
    lucroUnidade,
    markup,
    margemReal,
    receitaPorHora,
    lucroPorHora,
    precoParaPiso,
    horas,
    unidades,
  };
}

export function brl(v: number): string {
  return (v || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
