"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, Input, Label, Btn, Select, SectionTitle } from "@/components/ui";
import type {
  Pedido,
  Cliente,
  ContaCrianca,
  PedidoStatus,
  PedidoCanal,
} from "@/lib/types";

const STATUS_OPCOES: PedidoStatus[] = [
  "novo",
  "em_producao",
  "pronto",
  "entregue",
  "cancelado",
];

export default function EditarPedidoForm({
  pedido,
  criancas,
}: {
  pedido: Pedido & { clientes: Cliente | null };
  criancas: ContaCrianca[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [status, setStatus] = useState<PedidoStatus>(pedido.status);
  const [canal, setCanal] = useState<PedidoCanal>(pedido.canal ?? "whatsapp");
  const [prazo, setPrazo] = useState(pedido.prazo_entrega ?? "");
  const [observacoes, setObservacoes] = useState(pedido.observacoes ?? "");
  const [vendedorId, setVendedorId] = useState(pedido.vendedor_id ?? "");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function salvar() {
    setSalvando(true);
    setErro(null);
    const { error } = await supabase
      .from("pedidos")
      .update({
        status,
        canal,
        prazo_entrega: prazo || null,
        observacoes: observacoes || null,
        vendedor_id: vendedorId || null,
      })
      .eq("id", pedido.id);

    if (error) {
      setErro(error.message);
      setSalvando(false);
      return;
    }
    router.push(`/pedidos/${pedido.id}`);
    router.refresh();
  }

  return (
    <Card className="p-4 max-w-lg">
      <SectionTitle>Dados do pedido</SectionTitle>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <Label>Status</Label>
          <Select value={status} onChange={(v) => setStatus(v as PedidoStatus)}>
            {STATUS_OPCOES.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Canal</Label>
          <Select value={canal} onChange={(v) => setCanal(v as PedidoCanal)}>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram">Instagram</option>
            <option value="pessoal">Pessoal</option>
            <option value="outro">Outro</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <Label>Vendedor</Label>
          <Select value={vendedorId} onChange={setVendedorId}>
            <option value="">Sem vendedor</option>
            {criancas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Prazo de entrega</Label>
          <Input
            mono={false}
            value={prazo}
            onChange={setPrazo}
            placeholder="AAAA-MM-DD"
          />
        </div>
      </div>

      <div className="mb-5">
        <Label>Observações</Label>
        <Input mono={false} value={observacoes} onChange={setObservacoes} />
      </div>

      {erro && <p className="text-[var(--red)] text-xs mb-3">{erro}</p>}

      <div className="flex gap-2">
        <Btn onClick={salvar} disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar alterações"}
        </Btn>
        <Btn variant="ghost" onClick={() => router.back()}>
          Cancelar
        </Btn>
      </div>
    </Card>
  );
}
