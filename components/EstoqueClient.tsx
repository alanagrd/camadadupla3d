"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, Input, Btn, SectionTitle, Badge } from "@/components/ui";
import { Plus, Layers, Package, AlertTriangle } from "lucide-react";
import type { Filamento, Insumo } from "@/lib/types";

const ESTOQUE_BAIXO_G = 150;

export default function EstoqueClient({
  filamentosIniciais,
  insumosIniciais,
}: {
  filamentosIniciais: Filamento[];
  insumosIniciais: Insumo[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [novoFilNome, setNovoFilNome] = useState("");
  const [novoFilPreco, setNovoFilPreco] = useState("");
  const [novoInsNome, setNovoInsNome] = useState("");
  const [novoInsCusto, setNovoInsCusto] = useState("");

  const [entradaAberta, setEntradaAberta] = useState<string | null>(null);
  const [gramasEntrada, setGramasEntrada] = useState("");

  async function addFilamento() {
    if (!novoFilNome) return;
    await supabase.from("filamentos").insert({
      nome: novoFilNome,
      preco_kg: parseFloat(novoFilPreco.replace(",", ".")) || 0,
    });
    setNovoFilNome("");
    setNovoFilPreco("");
    router.refresh();
  }

  async function addInsumo() {
    if (!novoInsNome) return;
    await supabase.from("insumos").insert({
      nome: novoInsNome,
      custo: parseFloat(novoInsCusto.replace(",", ".")) || 0,
    });
    setNovoInsNome("");
    setNovoInsCusto("");
    router.refresh();
  }

  async function registrarEntrada(filamento: Filamento) {
    const gramas = parseFloat(gramasEntrada.replace(",", "."));
    if (!gramas) return;
    await supabase.from("estoque_movimentacao").insert({
      filamento_id: filamento.id,
      tipo: "compra",
      gramas,
    });
    await supabase
      .from("filamentos")
      .update({ estoque_g: filamento.estoque_g + gramas })
      .eq("id", filamento.id);
    setGramasEntrada("");
    setEntradaAberta(null);
    router.refresh();
  }

  return (
    <div>
      <h1 className="font-display font-bold text-xl mb-6">Estoque</h1>

      <Card className="p-4 mb-4">
        <SectionTitle icon={<Layers size={15} color="var(--amber)" />}>
          Filamentos
        </SectionTitle>
        <div className="flex flex-col gap-2 mb-3">
          {filamentosIniciais.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[var(--surface-2)]"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{f.nome}</span>
                {f.estoque_g < ESTOQUE_BAIXO_G && (
                  <Badge color="red">
                    <AlertTriangle size={10} className="inline mr-1" />
                    baixo
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--text-faint)] font-mono">
                  R${f.preco_kg.toFixed(2)}/kg
                </span>
                <span className="text-sm font-mono">{f.estoque_g.toFixed(0)}g</span>
                {entradaAberta === f.id ? (
                  <div className="flex gap-1.5 items-center">
                    <div className="w-20">
                      <Input
                        type="number"
                        value={gramasEntrada}
                        onChange={setGramasEntrada}
                        suffix="g"
                      />
                    </div>
                    <Btn variant="ghost" onClick={() => registrarEntrada(f)}>
                      OK
                    </Btn>
                  </div>
                ) : (
                  <button
                    onClick={() => setEntradaAberta(f.id)}
                    className="text-[var(--amber)] text-xs font-medium"
                  >
                    + entrada
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input mono={false} value={novoFilNome} onChange={setNovoFilNome} placeholder="Nome do filamento" />
          <div className="w-32">
            <Input type="number" value={novoFilPreco} onChange={setNovoFilPreco} suffix="R$/kg" />
          </div>
          <Btn variant="ghost" onClick={addFilamento}>
            <Plus size={13} />
          </Btn>
        </div>
      </Card>

      <Card className="p-4">
        <SectionTitle icon={<Package size={15} color="var(--amber)" />}>
          Insumos
        </SectionTitle>
        <div className="flex flex-col gap-2 mb-3">
          {insumosIniciais.map((i) => (
            <div
              key={i.id}
              className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[var(--surface-2)]"
            >
              <span className="text-sm">{i.nome}</span>
              <span className="text-sm font-mono">R${i.custo.toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input mono={false} value={novoInsNome} onChange={setNovoInsNome} placeholder="Nome do insumo" />
          <div className="w-32">
            <Input type="number" value={novoInsCusto} onChange={setNovoInsCusto} suffix="R$" />
          </div>
          <Btn variant="ghost" onClick={addInsumo}>
            <Plus size={13} />
          </Btn>
        </div>
      </Card>
    </div>
  );
}
