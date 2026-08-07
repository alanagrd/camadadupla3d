import { createClient } from "@/lib/supabase/server";
import type { Cliente } from "@/lib/types";
import ClientesClient from "@/components/ClientesClient";

export default async function ClientesPage() {
  const supabase = await createClient();
  const { data: clientes } = await supabase
    .from("clientes")
    .select("*")
    .order("nome")
    .returns<Cliente[]>();

  return <ClientesClient clientesIniciais={clientes ?? []} />;
}
