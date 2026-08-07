"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, Input, Btn, Select, Badge } from "@/components/ui";
import { Plus } from "lucide-react";
import type { Cliente, ClienteTipo } from "@/lib/types";

const TIPO_LABEL: Record<ClienteTipo, string> = {
  pessoal: "Pessoal",
  organizador_torneio: "Organizador de torneio",
  patrocinador: "Patrocinador",
  escola: "Escola",
  outro: "Outro",
};

export default function ClientesClient({
  clientesIniciais,
}: {
  clientesIniciais: Cliente[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [aberto, setAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tipo, setTipo] = useState<ClienteTipo>("pessoal");
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    if (!nome) return;
    setSalvando(true);
    await supabase.from("clientes").insert({
      nome,
      telefone: telefone || null,
      instagram: instagram || null,
      tipo,
    });
    setNome("");
    setTelefone("");
    setInstagram("");
    setSalvando(false);
    setAberto(false);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display font-bold text-xl">Clientes</h1>
        <Btn onClick={() => setAberto(!aberto)}>
          <Plus size={14} /> Novo cliente
        </Btn>
      </div>

      {aberto && (
        <Card className="p-4 mb-4">
          <div className="grid grid-cols-4 gap-2.5 mb-3">
            <Input mono={false} value={nome} onChange={setNome} placeholder="Nome" />
            <Input mono={false} value={telefone} onChange={setTelefone} placeholder="Telefone" />
            <Input mono={false} value={instagram} onChange={setInstagram} placeholder="@instagram" />
            <Select value={tipo} onChange={(v) => setTipo(v as ClienteTipo)}>
              {Object.entries(TIPO_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </div>
          <Btn onClick={salvar} disabled={salvando || !nome}>
            {salvando ? "Salvando..." : "Salvar"}
          </Btn>
        </Card>
      )}

      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-[11px] uppercase text-[var(--text-faint)]">
              <th className="p-3">Nome</th>
              <th className="p-3">Contato</th>
              <th className="p-3">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {clientesIniciais.map((c) => (
              <tr key={c.id} className="border-b border-[var(--border)] last:border-0">
                <td className="p-3">{c.nome}</td>
                <td className="p-3 text-[var(--text-muted)]">
                  {c.telefone ?? c.instagram ?? "—"}
                </td>
                <td className="p-3">
                  <Badge>{TIPO_LABEL[c.tipo]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {clientesIniciais.length === 0 && (
          <p className="text-[var(--text-faint)] text-sm p-4">Nenhum cliente ainda.</p>
        )}
      </Card>
    </div>
  );
}
