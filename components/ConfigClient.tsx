"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, Input, Label, Btn, SectionTitle } from "@/components/ui";
import { brl } from "@/lib/calc";
import { Settings2, Save } from "lucide-react";
import type { Config } from "@/lib/types";

const num = (s: string) => parseFloat(s.replace(",", ".")) || 0;

export default function ConfigClient({ configInicial }: { configInicial: Config }) {
  const router = useRouter();
  const supabase = createClient();

  const [custoHora, setCustoHora] = useState(String(configInicial.custo_hora_maquina ?? 0));
  const [margem, setMargem] = useState(String(configInicial.margem_padrao_pct ?? 0));
  const [piso, setPiso] = useState(String(configInicial.piso_rhora ?? 0));
  const [potencia, setPotencia] = useState(String(configInicial.potencia_w ?? 0));
  const [tarifa, setTarifa] = useState(String(configInicial.tarifa_kwh ?? 0));
  const [precoImpressora, setPrecoImpressora] = useState(
    String(configInicial.preco_impressora ?? 0)
  );
  const [vidaUtil, setVidaUtil] = useState(String(configInicial.vida_util_horas ?? 0));
  const [custoTrabalho, setCustoTrabalho] = useState(
    String(configInicial.custo_hora_trabalho ?? 0)
  );
  const [taxaFalha, setTaxaFalha] = useState(String(configInicial.taxa_falha_pct ?? 0));
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  const { energia, depreciacao, rhora, derivado } = useMemo(() => {
    const energia = (num(potencia) / 1000) * num(tarifa);
    const vida = num(vidaUtil);
    const depreciacao = vida > 0 ? num(precoImpressora) / vida : 0;
    const derivado = energia + depreciacao;
    return { energia, depreciacao, derivado, rhora: derivado > 0 ? derivado : num(custoHora) };
  }, [potencia, tarifa, precoImpressora, vidaUtil, custoHora]);

  async function salvar() {
    setSalvando(true);
    await supabase
      .from("config")
      .update({
        custo_hora_maquina: num(custoHora),
        margem_padrao_pct: num(margem),
        piso_rhora: num(piso),
        potencia_w: num(potencia),
        tarifa_kwh: num(tarifa),
        preco_impressora: num(precoImpressora),
        vida_util_horas: num(vidaUtil),
        custo_hora_trabalho: num(custoTrabalho),
        taxa_falha_pct: num(taxaFalha),
        updated_at: new Date().toISOString(),
      })
      .eq("id", true);
    setSalvando(false);
    setSalvo(true);
    router.refresh();
    setTimeout(() => setSalvo(false), 2000);
  }

  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-6">Configurações</h1>

      <div className="flex flex-col gap-4 max-w-md">
        <Card className="p-4">
          <SectionTitle icon={<Settings2 size={15} color="var(--amber)" />}>
            Custo da hora de máquina
          </SectionTitle>
          <div className="grid grid-cols-2 gap-3.5 mb-4">
            <div>
              <Label>Potência média</Label>
              <Input type="number" value={potencia} onChange={setPotencia} suffix="W" />
            </div>
            <div>
              <Label>Tarifa de energia</Label>
              <Input type="number" value={tarifa} onChange={setTarifa} suffix="R$/kWh" />
            </div>
            <div>
              <Label>Preço da impressora</Label>
              <Input type="number" value={precoImpressora} onChange={setPrecoImpressora} suffix="R$" />
            </div>
            <div>
              <Label>Vida útil estimada</Label>
              <Input type="number" value={vidaUtil} onChange={setVidaUtil} suffix="h" />
            </div>
          </div>
          <div className="bg-[var(--surface-2)] rounded-lg p-3 text-xs">
            <div className="flex justify-between mb-1">
              <span className="text-[var(--text-muted)]">Energia</span>
              <span className="font-mono">{brl(energia)}/h</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-[var(--text-muted)]">Depreciação</span>
              <span className="font-mono">{brl(depreciacao)}/h</span>
            </div>
            <div className="h-px bg-[var(--border)] my-1.5" />
            <div className="flex justify-between font-semibold">
              <span>R$/hora de máquina</span>
              <span className="font-mono text-[var(--amber)]">{brl(rhora)}/h</span>
            </div>
          </div>
          <div className="mt-3">
            <Label>R$/h manual (usado só se os campos acima ficarem zerados)</Label>
            <Input type="number" value={custoHora} onChange={setCustoHora} suffix="R$/h" />
            {!derivado && (
              <p className="text-[10px] text-[var(--text-faint)] mt-1">
                Preencha energia e depreciação acima pra derivar o R$/h automaticamente.
              </p>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <SectionTitle>Mão de obra e refugo</SectionTitle>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <Label>Custo da sua hora de trabalho</Label>
              <Input type="number" value={custoTrabalho} onChange={setCustoTrabalho} suffix="R$/h" />
            </div>
            <div>
              <Label>Taxa de falha / refugo</Label>
              <Input type="number" value={taxaFalha} onChange={setTaxaFalha} suffix="%" />
            </div>
          </div>
          <p className="text-[10px] text-[var(--text-faint)] mt-2">
            A taxa de falha encarece material e tempo de máquina, refletindo prints que dão errado.
          </p>
        </Card>

        <Card className="p-4">
          <SectionTitle>Margem e piso</SectionTitle>
          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <Label>Margem padrão sobre a venda</Label>
              <Input type="number" value={margem} onChange={setMargem} suffix="%" />
            </div>
            <div>
              <Label>Piso de R$/hora (abaixo, revise)</Label>
              <Input type="number" value={piso} onChange={setPiso} suffix="R$/h" />
            </div>
          </div>
        </Card>

        <Btn onClick={salvar} disabled={salvando}>
          <Save size={14} /> {salvo ? "Salvo!" : salvando ? "Salvando..." : "Salvar"}
        </Btn>
      </div>
    </div>
  );
}
