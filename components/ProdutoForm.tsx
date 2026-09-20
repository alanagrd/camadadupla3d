"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, Input, Label, Btn, Select, SectionTitle } from "@/components/ui";
import { calcularProduto, brl, minutosParaHMM, parseTempoParaMinutos, numParse } from "@/lib/calc";
import { Plus, Trash2, Calculator, Save, CheckCircle2, AlertTriangle, ShoppingBag, ImagePlus } from "lucide-react";
import type {
  Produto,
  ProdutoComponente,
  Filamento,
  Insumo,
  Config,
} from "@/lib/types";

interface ComponenteForm {
  filamento_id: string;
  gramas: string;
}
interface InsumoSelecionado {
  insumo_id: string;
  qtd: string;
}

export default function ProdutoForm({
  filamentos,
  insumos,
  config,
  produtoExistente,
  componentesExistentes,
  insumosExistentes,
}: {
  filamentos: Filamento[];
  insumos: Insumo[];
  config: Config;
  produtoExistente?: Produto;
  componentesExistentes?: ProdutoComponente[];
  insumosExistentes?: { insumo_id: string; qtd: number }[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [nome, setNome] = useState(produtoExistente?.nome ?? "");
  const [tempo, setTempo] = useState(
    produtoExistente
      ? minutosParaHMM(produtoExistente.tempo_impressao_min)
      : ""
  );
  const [pecasPorChapa, setPecasPorChapa] = useState(
    String(produtoExistente?.pecas_por_chapa ?? 1)
  );
  const [tempoAcabamento, setTempoAcabamento] = useState(
    String(produtoExistente?.tempo_acabamento_min ?? 0)
  );
  const [perdaExtra, setPerdaExtra] = useState(
    String(produtoExistente?.perda_extra_pct ?? 5)
  );
  const [margemPersonalizada, setMargemPersonalizada] = useState(
    produtoExistente?.margem_personalizada != null
      ? String(produtoExistente.margem_personalizada)
      : ""
  );
  const [precoManual, setPrecoManual] = useState(
    produtoExistente?.preco_manual != null
      ? String(produtoExistente.preco_manual)
      : ""
  );
  const [componentes, setComponentes] = useState<ComponenteForm[]>(
    componentesExistentes?.length
      ? componentesExistentes.map((c) => ({
          filamento_id: c.filamento_id,
          gramas: String(c.gramas),
        }))
      : [{ filamento_id: filamentos[0]?.id ?? "", gramas: "0" }]
  );
  const [insumosSelecionados, setInsumosSelecionados] = useState<
    InsumoSelecionado[]
  >(insumosExistentes?.map((i) => ({ insumo_id: i.insumo_id, qtd: String(i.qtd) })) ?? []);

  // Catálogo
  const [noCatalogo, setNoCatalogo] = useState(produtoExistente?.no_catalogo ?? false);
  const [categoria, setCategoria] = useState(produtoExistente?.categoria ?? "");
  const [descricaoPublica, setDescricaoPublica] = useState(produtoExistente?.descricao_publica ?? "");
  const [fotoUrl, setFotoUrl] = useState(produtoExistente?.foto_url ?? "");
  const [precoCatalogo, setPrecoCatalogo] = useState(
    produtoExistente?.preco_catalogo != null ? String(produtoExistente.preco_catalogo) : ""
  );
  const [uploadando, setUploadando] = useState(false);

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const resultado = useMemo(() => {
    const produtoTemp: Produto = {
      id: produtoExistente?.id ?? "",
      nome,
      tempo_impressao_min: parseTempoParaMinutos(tempo),
      tempo_acabamento_min: parseFloat(tempoAcabamento.replace(",", ".")) || 0,
      pecas_por_chapa: parseFloat(pecasPorChapa) || 1,
      perda_extra_pct: parseFloat(perdaExtra.replace(",", ".")) || 0,
      margem_personalizada:
        margemPersonalizada === "" ? null : parseFloat(margemPersonalizada.replace(",", ".")),
      preco_manual: precoManual === "" ? null : parseFloat(precoManual.replace(",", ".")),
      ativo: true,
      created_at: "",
    };
    const componentesCalc = componentes
      .filter((c) => c.filamento_id)
      .map((c) => ({
        id: "",
        produto_id: "",
        filamento_id: c.filamento_id,
        gramas: parseFloat(c.gramas.replace(",", ".")) || 0,
      }));
    const insumosCalc = insumosSelecionados.map((i) => ({
      id: "",
      produto_id: "",
      insumo_id: i.insumo_id,
      qtd: parseFloat(i.qtd.replace(",", ".")) || 1,
    }));
    return calcularProduto(
      produtoTemp,
      componentesCalc,
      insumosCalc,
      filamentos,
      insumos,
      config
    );
  }, [
    nome,
    tempo,
    tempoAcabamento,
    pecasPorChapa,
    perdaExtra,
    margemPersonalizada,
    precoManual,
    componentes,
    insumosSelecionados,
    filamentos,
    insumos,
    config,
  ]);

  function addComponente() {
    setComponentes([...componentes, { filamento_id: filamentos[0]?.id ?? "", gramas: "0" }]);
  }
  function removerComponente(idx: number) {
    setComponentes(componentes.filter((_, i) => i !== idx));
  }
  function toggleInsumo(insumoId: string) {
    const existe = insumosSelecionados.find((i) => i.insumo_id === insumoId);
    if (existe) {
      setInsumosSelecionados(insumosSelecionados.filter((i) => i.insumo_id !== insumoId));
    } else {
      setInsumosSelecionados([...insumosSelecionados, { insumo_id: insumoId, qtd: "1" }]);
    }
  }

  async function uploadFoto(file: File) {
    setUploadando(true);
    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage
      .from("catalogo-fotos")
      .upload(filename, file, { upsert: false });
    if (!error) {
      const { data } = supabase.storage.from("catalogo-fotos").getPublicUrl(filename);
      setFotoUrl(data.publicUrl);
    }
    setUploadando(false);
  }

  async function salvar() {
    setSalvando(true);
    setErro(null);

    const payload = {
      nome,
      tempo_impressao_min: parseTempoParaMinutos(tempo),
      tempo_acabamento_min: parseFloat(tempoAcabamento.replace(",", ".")) || 0,
      pecas_por_chapa: parseFloat(pecasPorChapa) || 1,
      perda_extra_pct: parseFloat(perdaExtra.replace(",", ".")) || 0,
      margem_personalizada:
        margemPersonalizada === "" ? null : parseFloat(margemPersonalizada.replace(",", ".")),
      preco_manual: precoManual === "" ? null : parseFloat(precoManual.replace(",", ".")),
      no_catalogo: noCatalogo,
      categoria: noCatalogo ? categoria || null : null,
      descricao_publica: noCatalogo ? descricaoPublica || null : null,
      foto_url: noCatalogo ? fotoUrl || null : null,
      preco_catalogo: noCatalogo && precoCatalogo !== "" ? parseFloat(precoCatalogo.replace(",", ".")) : null,
    };

    let produtoId = produtoExistente?.id;

    if (produtoId) {
      const { error } = await supabase.from("produtos").update(payload).eq("id", produtoId);
      if (error) {
        setErro(error.message);
        setSalvando(false);
        return;
      }
      await supabase.from("produto_componentes").delete().eq("produto_id", produtoId);
      await supabase.from("produto_insumos").delete().eq("produto_id", produtoId);
    } else {
      const { data, error } = await supabase
        .from("produtos")
        .insert(payload)
        .select("id")
        .single();
      if (error || !data) {
        setErro(error?.message ?? "Erro ao criar produto");
        setSalvando(false);
        return;
      }
      produtoId = data.id;
    }

    const componentesPayload = componentes
      .filter((c) => c.filamento_id)
      .map((c) => ({
        produto_id: produtoId,
        filamento_id: c.filamento_id,
        gramas: parseFloat(c.gramas.replace(",", ".")) || 0,
      }));
    if (componentesPayload.length) {
      await supabase.from("produto_componentes").insert(componentesPayload);
    }

    const insumosPayload = insumosSelecionados.map((i) => ({
      produto_id: produtoId,
      insumo_id: i.insumo_id,
      qtd: parseFloat(i.qtd.replace(",", ".")) || 1,
    }));
    if (insumosPayload.length) {
      await supabase.from("produto_insumos").insert(insumosPayload);
    }

    setSalvando(false);
    router.push("/produtos");
    router.refresh();
  }

  const piso = numParse(config.piso_rhora);
  const rhora = resultado.receitaPorHora;
  const nivel =
    piso <= 0
      ? { label: "—", cor: "var(--text-muted)", ok: true }
      : rhora >= piso * 2
      ? { label: "Ótimo", cor: "var(--green)", ok: true }
      : rhora >= piso * 1.3
      ? { label: "Bom", cor: "var(--green)", ok: true }
      : rhora >= piso
      ? { label: "No piso", cor: "var(--amber)", ok: true }
      : { label: "Abaixo do piso", cor: "var(--red)", ok: false };
  const cor = nivel.cor;
  const gaugeMax = piso * 3;
  const fillPct =
    gaugeMax > 0 ? Math.max(0, Math.min(1, rhora / gaugeMax)) * 100 : 0;

  return (
    <div className="grid grid-cols-[1fr_320px] gap-4">
      <Card className="p-4">
        <div className="mb-4">
          <Label>Nome do produto</Label>
          <Input mono={false} value={nome} onChange={setNome} placeholder="Ex: Tag Escolar" />
        </div>

        <Label>Filamento por peça</Label>
        <div className="flex flex-col gap-2 mb-2">
          {componentes.map((c, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <div className="flex-[1.4]">
                <Select
                  value={c.filamento_id}
                  onChange={(v) => {
                    const novo = [...componentes];
                    novo[idx].filamento_id = v;
                    setComponentes(novo);
                  }}
                >
                  <option value="">Selecione...</option>
                  {filamentos.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  value={c.gramas}
                  suffix="g"
                  onChange={(v) => {
                    const novo = [...componentes];
                    novo[idx].gramas = v;
                    setComponentes(novo);
                  }}
                />
              </div>
              <button onClick={() => removerComponente(idx)} className="text-[var(--red)] p-1.5">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        <Btn variant="ghost" onClick={addComponente}>
          <Plus size={13} /> Cor
        </Btn>

        <div className="h-px bg-[var(--border)] my-4" />

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div>
            <Label>Tempo de impressão da chapa (h:mm)</Label>
            <Input type="text" value={tempo} onChange={setTempo} placeholder="ex: 4:14" />
          </div>
          <div>
            <Label>Peças por chapa</Label>
            <Input type="number" value={pecasPorChapa} onChange={setPecasPorChapa} suffix="un" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div>
            <Label>Perda extra além da purga — % sobre filamento</Label>
            <Input type="number" value={perdaExtra} onChange={setPerdaExtra} suffix="%" />
          </div>
          <div>
            <Label>Acabamento (seu tempo por peça)</Label>
            <Input type="number" value={tempoAcabamento} onChange={setTempoAcabamento} suffix="min" />
          </div>
        </div>

        <div className="h-px bg-[var(--border)] my-4" />

        <Label>Insumos usados</Label>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {insumos.map((ins) => {
            const ativo = insumosSelecionados.some((i) => i.insumo_id === ins.id);
            return (
              <button
                key={ins.id}
                onClick={() => toggleInsumo(ins.id)}
                className={`px-2.5 py-1.5 rounded-full text-xs border ${
                  ativo
                    ? "border-[var(--amber)] bg-[var(--amber-dim)]/30 text-[var(--amber)]"
                    : "border-[var(--border-light)] text-[var(--text-muted)]"
                }`}
              >
                {ins.nome} · {brl(ins.custo)}
              </button>
            );
          })}
        </div>

        <div className="h-px bg-[var(--border)] my-4" />

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div>
            <Label>Margem específica (vazio = padrão)</Label>
            <Input type="number" value={margemPersonalizada} onChange={setMargemPersonalizada} suffix="%" />
          </div>
          <div>
            <Label>Ou fixar preço manual</Label>
            <Input type="number" value={precoManual} onChange={setPrecoManual} suffix="R$" />
          </div>
        </div>


        <div className="h-px bg-[var(--border)] my-4" />

        {/* Seção catálogo */}
        <div className="rounded-xl border border-[var(--border)] p-4 mb-4" style={{ background: noCatalogo ? "var(--amber-dim, rgba(245,158,11,0.07))" : undefined }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShoppingBag size={14} className="text-[var(--amber)]" />
              <span className="text-[13px] font-semibold">Incluir no catálogo público</span>
            </div>
            <button
              type="button"
              onClick={() => setNoCatalogo(!noCatalogo)}
              className={`relative w-10 h-5.5 rounded-full transition-colors flex items-center ${noCatalogo ? "bg-[var(--amber)]" : "bg-[var(--border)]"}`}
              style={{ width: 40, height: 22 }}
            >
              <span
                className="absolute w-4 h-4 bg-white rounded-full shadow transition-transform"
                style={{ transform: noCatalogo ? "translateX(20px)" : "translateX(2px)", width: 16, height: 16 }}
              />
            </button>
          </div>

          {noCatalogo && (
            <div className="flex flex-col gap-3">
              <div>
                <Label>Categoria</Label>
                <Select value={categoria} onChange={setCategoria}>
                  <option value="">Selecione...</option>
                  {["Organizadores","Brinquedos","Natal","Decoração","Educacional","Personalizado","Outros"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Preço de venda (visível no catálogo)</Label>
                <Input type="number" value={precoCatalogo} onChange={setPrecoCatalogo} suffix="R$"
                  placeholder={`Sugerido: ${resultado.precoSugerido.toFixed(2)}`} />
                <p className="text-[11px] text-[var(--text-faint)] mt-1">
                  Deixe vazio para usar o preço sugerido ({brl(resultado.precoSugerido)})
                </p>
              </div>
              <div>
                <Label>Descrição para o cliente</Label>
                <textarea
                  value={descricaoPublica}
                  onChange={e => setDescricaoPublica(e.target.value)}
                  placeholder="Ex: Tag escolar personalizada com nome. Perfeita para identificar mochilas, garrafinhas e estojo!"
                  rows={3}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-[var(--amber)] resize-none"
                />
              </div>
              <div>
                <Label>Foto do produto</Label>
                {fotoUrl && (
                  <div className="relative mb-2 w-32 h-32 rounded-lg overflow-hidden border border-[var(--border)]">
                    <img src={fotoUrl} alt="foto" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFotoUrl("")}
                      className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >✕</button>
                  </div>
                )}
                <label className="flex items-center gap-2 cursor-pointer border border-dashed border-[var(--border)] rounded-lg p-3 text-[13px] text-[var(--text-muted)] hover:border-[var(--amber)] transition-colors">
                  <ImagePlus size={16} />
                  {uploadando ? "Enviando..." : fotoUrl ? "Trocar foto" : "Escolher foto do computador"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadando}
                    onChange={e => { const f = e.target.files?.[0]; if (f) uploadFoto(f); e.target.value = ""; }}
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {erro && <p className="text-[var(--red)] text-xs mb-3">{erro}</p>}

        <Btn onClick={salvar} disabled={salvando || !nome}>
          <Save size={14} /> {salvando ? "Salvando..." : "Salvar produto"}
        </Btn>
      </Card>

      <div className="flex flex-col gap-3.5">
        <Card
          className="p-4"
          style={{
            background: `linear-gradient(135deg, ${cor}22, transparent)`,
            borderColor: `${cor}44`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] uppercase">
              <Calculator size={12} /> R$ por hora de máquina
            </div>
            <span
              className="flex items-center gap-1 text-[11px] font-semibold"
              style={{ color: cor }}
            >
              {nivel.ok ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
              {nivel.label}
            </span>
          </div>
          <div className="font-display text-[28px] font-bold" style={{ color: cor }}>
            {brl(resultado.receitaPorHora)}
          </div>
          {piso > 0 && (
            <div className="mt-3">
              <div className="relative h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ width: `${fillPct}%`, background: cor }}
                />
                <div
                  className="absolute inset-y-0 w-px bg-[var(--text-faint)]"
                  style={{ left: "33.33%" }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[var(--text-faint)] mt-1">
                <span>R$0</span>
                <span>piso {brl(piso)}</span>
                <span>{brl(gaugeMax)}+</span>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <SectionTitle>Custo por peça</SectionTitle>
          <Linha label="Filamento" valor={resultado.custoFilamento} />
          <Linha label={`Perda extra`} valor={resultado.custoPerda} />
          <Linha label="Insumos" valor={resultado.custoInsumos} />
          <Linha label="Máquina (rateado)" valor={resultado.custoMaquinaUnidade} />
          <Linha label="Mão de obra" valor={resultado.custoTrabalhoUnidade} />
          <Linha label="Refugo (falha)" valor={resultado.custoRefugo} />
          <div className="h-px bg-[var(--border)] my-2" />
          <div className="flex justify-between text-sm font-semibold">
            <span>Custo total</span>
            <span className="font-mono">{brl(resultado.custoTotalUnidade)}</span>
          </div>
        </Card>

        <Card className="p-4 border-[var(--amber)]/30">
          <div className="text-[11px] text-[var(--text-muted)] uppercase mb-1">
            Preço sugerido ({resultado.margem.toFixed(0)}% margem)
          </div>
          <div className="font-display text-2xl font-bold text-[var(--amber)] mb-2.5">
            {brl(resultado.precoSugerido)}
          </div>
          <div className="flex flex-col gap-1.5">
            <PainelLinha
              label="Lucro / peça"
              valor={brl(resultado.lucroUnidade)}
              cor={resultado.lucroUnidade >= 0 ? "var(--green)" : "var(--red)"}
            />
            <PainelLinha
              label="Margem real"
              valor={`${resultado.margemReal.toFixed(0)}%`}
              cor={resultado.margemReal >= 0 ? "var(--green)" : "var(--red)"}
            />
            <PainelLinha label="Markup sobre o custo" valor={`${resultado.markup.toFixed(0)}%`} />
            <PainelLinha
              label="Lucro / hora de máquina"
              valor={brl(resultado.lucroPorHora)}
              cor={resultado.lucroPorHora >= 0 ? "var(--green)" : "var(--red)"}
            />
          </div>
        </Card>

        <Card className="p-4">
          <SectionTitle>Saúde do produto</SectionTitle>
          <div className="flex flex-col gap-1.5">
            <PainelLinha label="Custo / hora de máquina" valor={`${brl(resultado.rhoraMaquina)}/h`} />
            <PainelLinha
              label="Você recebe / hora"
              valor={`${brl(resultado.receitaPorHora)}/h`}
              cor={cor}
            />
            <PainelLinha label="Piso definido" valor={`${brl(piso)}/h`} />
          </div>
          {piso > 0 && (
            <div
              className="mt-3 rounded-lg p-2.5 text-[11px] leading-relaxed"
              style={{ background: `${cor}18`, color: cor }}
            >
              {nivel.ok
                ? `Preço saudável — está ${nivel.label.toLowerCase()} (acima do piso de ${brl(
                    piso
                  )}/h).`
                : `Abaixo do piso de ${brl(piso)}/h. Pra bater o piso, o mínimo seria ${brl(
                    resultado.precoParaPiso
                  )} — ou aumente peças por chapa / reduza o tempo.`}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Linha({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="flex justify-between text-xs mb-1.5">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="font-mono">{brl(valor)}</span>
    </div>
  );
}

function PainelLinha({ label, valor, cor }: { label: string; valor: string; cor?: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="font-mono" style={cor ? { color: cor } : undefined}>
        {valor}
      </span>
    </div>
  );
}
