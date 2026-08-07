"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, Input, Label, Btn, SectionTitle } from "@/components/ui";
import { Settings2, Save } from "lucide-react";
import type { Config } from "@/lib/types";

export default function ConfigClient({ configInicial }: { configInicial: Config }) {
  const router = useRouter();
  const supabase = createClient();

  const [custoHora, setCustoHora] = useState(String(configInicial.custo_hora_maquina));
  const [margem, setMargem] = useState(String(configInicial.margem_padrao_pct));
  const [piso, setPiso] = useState(String(configInicial.piso_rhora));
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  async function salvar() {
    setSalvando(true);
    await supabase
      .from("config")
      .update({
        custo_hora_maquina: parseFloat(custoHora.replace(",", ".")) || 0,
        margem_padrao_pct: parseFloat(margem.replace(",", ".")) || 0,
        piso_rhora: parseFloat(piso.replace(",", ".")) || 0,
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

      <Card className="p-4 max-w-md">
        <SectionTitle icon={<Settings2 size={15} color="var(--amber)" />}>
          Parâmetros de precificação
        </SectionTitle>
        <div className="flex flex-col gap-3.5 mb-4">
          <div>
            <Label>Custo da hora de máquina (energia + depreciação)</Label>
            <Input type="number" value={custoHora} onChange={setCustoHora} suffix="R$/h" />
          </div>
          <div>
            <Label>Margem padrão sobre o preço de venda</Label>
            <Input type="number" value={margem} onChange={setMargem} suffix="%" />
          </div>
          <div>
            <Label>Piso de R$/hora (abaixo disso, revise o produto)</Label>
            <Input type="number" value={piso} onChange={setPiso} suffix="R$/h" />
          </div>
        </div>
        <Btn onClick={salvar} disabled={salvando}>
          <Save size={14} /> {salvo ? "Salvo!" : salvando ? "Salvando..." : "Salvar"}
        </Btn>
      </Card>
    </div>
  );
}
