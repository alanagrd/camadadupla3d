"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, Input, Label, Btn, Select, SectionTitle } from "@/components/ui";
import { Plus, Trash2, UserPlus } from "lucide-react";
import type { Cliente, Produto, PedidoCanal, ClienteTipo, ContaCrianca } from "@/lib/types";

interface ItemForm {
  produto_id: string;
  nome_personalizado: string;
  quantidade: string;
  preco_unitario: string;
}

export default function NovoPedidoForm({
  clientes,
  produtos,
  criancas,
}: {
  clientes: Cliente[];
  produtos: Produto[];
  criancas: ContaCrianca[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [clienteId, setClienteId] = useState("");
  const [novoClienteAberto, setNovoClienteAberto] = useState(clientes.length === 0);
  const [novoClienteNome, setNovoClienteNome] = useState("");
  const [novoClienteTelefone, setNovoClienteTelefone] = useState("");
  const [novoClienteTipo, setNovoClienteTipo] = useState<ClienteTipo>("pessoal");

  const [canal, setCanal] = useState<PedidoCanal>("whatsapp");
  const [prazo, setPrazo] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [vendedorId, setVendedorId] = useState("");
  const [itens, setItens] = useState<ItemForm[]>([
    { produto_id: produtos[0]?.id ?? "", nome_personalizado: "", quantidade: "1", preco_unitario: "" },
  ]);

  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function addItem() {
    setItens([
      ...itens,
      { produto_id: produtos[0]?.id ?? "", nome_personalizado: "", quantidade: "1", preco_unitario: "" },
    ]);
  }
  function removerItem(idx: number) {
    setItens(itens.filter((_, i) => i !== idx));
  }

  const total = itens.reduce(
    (acc, i) => acc + (parseFloat(i.preco_unitario.replace(",", ".")) || 0) * (parseInt(i.quantidade) || 0),
    0
  );

  async function salvar() {
    setSalvando(true);
    setErro(null);

    let finalClienteId = clienteId;

    if (novoClienteAberto) {
      if (!novoClienteNome) {
        setErro("Nome do cliente é obrigatório.");
        setSalvando(false);
        return;
      }
      const { data, error } = await supabase
        .from("clientes")
        .insert({
          nome: novoClienteNome,
          telefone: novoClienteTelefone || null,
          tipo: novoClienteTipo,
        })
        .select("id")
        .single();
      if (error || !data) {
        setErro(error?.message ?? "Erro ao criar cliente");
        setSalvando(false);
        return;
      }
      finalClienteId = data.id;
    }

    const { data: pedido, error: erroPedido } = await supabase
      .from("pedidos")
      .insert({
        cliente_id: finalClienteId || null,
        canal,
        prazo_entrega: prazo || null,
        observacoes: observacoes || null,
        status: "novo",
        vendedor_id: vendedorId || null,
      })
      .select("id")
      .single();

    if (erroPedido || !pedido) {
      setErro(erroPedido?.message ?? "Erro ao criar pedido");
      setSalvando(false);
      return;
    }

    const itensPayload = itens
      .filter((i) => i.produto_id)
      .map((i) => ({
        pedido_id: pedido.id,
        produto_id: i.produto_id,
        nome_personalizado: i.nome_personalizado || null,
        quantidade: parseInt(i.quantidade) || 1,
        preco_unitario: parseFloat(i.preco_unitario.replace(",", ".")) || 0,
      }));

    if (itensPayload.length) {
      const { error: erroItens } = await supabase.from("pedido_itens").insert(itensPayload);
      if (erroItens) {
        setErro(erroItens.message);
        setSalvando(false);
        return;
      }
    }

    // Lança automaticamente nas contas da criança vendedora
    if (vendedorId && total > 0) {
      await supabase.from("movimentacoes_conta").insert({
        crianca_id: vendedorId,
        pedido_item_id: null,
        tipo: "venda",
        pote: "gastar",
        valor: total,
        descricao: `Pedido #${pedido.id.slice(0, 8)}`,
      });
    }

    setSalvando(false);
    router.push(`/pedidos/${pedido.id}`);
    router.refresh();
  }

  return (
    <div className="grid grid-cols-[1fr_280px] gap-4">
      <Card className="p-4">
        <SectionTitle>Cliente</SectionTitle>
        {!novoClienteAberto ? (
          <div className="flex gap-2 mb-4">
            <div className="flex-1">
              <Select value={clienteId} onChange={setClienteId}>
                <option value="">Selecione um cliente...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>
            </div>
            <Btn variant="ghost" onClick={() => setNovoClienteAberto(true)}>
              <UserPlus size={13} /> Novo
            </Btn>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Input mono={false} value={novoClienteNome} onChange={setNovoClienteNome} placeholder="Nome" />
            <Input mono={false} value={novoClienteTelefone} onChange={setNovoClienteTelefone} placeholder="Telefone" />
            <Select value={novoClienteTipo} onChange={(v) => setNovoClienteTipo(v as ClienteTipo)}>
              <option value="pessoal">Pessoal</option>
              <option value="organizador_torneio">Organizador de torneio</option>
              <option value="patrocinador">Patrocinador</option>
              <option value="escola">Escola</option>
              <option value="outro">Outro</option>
            </Select>
            {clientes.length > 0 && (
              <button
                onClick={() => setNovoClienteAberto(false)}
                className="col-span-3 text-xs text-[var(--text-faint)] text-left"
              >
                ← usar cliente existente
              </button>
            )}
          </div>
        )}

        <div className="h-px bg-[var(--border)] my-4" />

        <SectionTitle>Itens do pedido</SectionTitle>
        <div className="flex flex-col gap-2 mb-2">
          {itens.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <div className="flex-1">
                <Select
                  value={item.produto_id}
                  onChange={(v) => {
                    const novo = [...itens];
                    novo[idx].produto_id = v;
                    setItens(novo);
                  }}
                >
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="w-32">
                <Input
                  mono={false}
                  value={item.nome_personalizado}
                  onChange={(v) => {
                    const novo = [...itens];
                    novo[idx].nome_personalizado = v;
                    setItens(novo);
                  }}
                  placeholder="Nome gravado"
                />
              </div>
              <div className="w-16">
                <Input
                  type="number"
                  value={item.quantidade}
                  onChange={(v) => {
                    const novo = [...itens];
                    novo[idx].quantidade = v;
                    setItens(novo);
                  }}
                />
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  value={item.preco_unitario}
                  suffix="R$"
                  onChange={(v) => {
                    const novo = [...itens];
                    novo[idx].preco_unitario = v;
                    setItens(novo);
                  }}
                />
              </div>
              <button onClick={() => removerItem(idx)} className="text-[var(--red)] p-1.5">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        <Btn variant="ghost" onClick={addItem}>
          <Plus size={13} /> Item
        </Btn>

        <div className="h-px bg-[var(--border)] my-4" />

        <div className="grid grid-cols-3 gap-2.5 mb-4">
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
            <Label>Canal</Label>
            <Select value={canal} onChange={(v) => setCanal(v as PedidoCanal)}>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="pessoal">Pessoal</option>
              <option value="outro">Outro</option>
            </Select>
          </div>
          <div>
            <Label>Prazo de entrega</Label>
            <Input type="text" mono={false} value={prazo} onChange={setPrazo} placeholder="AAAA-MM-DD" />
          </div>
        </div>

        <div className="mb-4">
          <Label>Observações</Label>
          <Input mono={false} value={observacoes} onChange={setObservacoes} />
        </div>

        {erro && <p className="text-[var(--red)] text-xs mb-3">{erro}</p>}

        <Btn onClick={salvar} disabled={salvando}>
          {salvando ? "Salvando..." : "Criar pedido"}
        </Btn>
      </Card>

      <Card className="p-4 h-fit">
        <div className="text-[11px] text-[var(--text-muted)] uppercase mb-1">Total do pedido</div>
        <div className="font-display text-2xl font-bold text-[var(--amber)]">
          {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </div>
        {vendedorId && (
          <div className="mt-3 text-xs text-[var(--text-faint)] border-t border-[var(--border)] pt-2">
            Será lançado nas contas de{" "}
            <span className="text-[var(--text-muted)] font-medium">
              {criancas.find((c) => c.id === vendedorId)?.nome}
            </span>{" "}
            ao salvar.
          </div>
        )}
      </Card>
    </div>
  );
}
