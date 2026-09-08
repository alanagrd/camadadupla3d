import { createClient } from "@/lib/supabase/server";
import CalculadoraRapidaClient from "@/components/CalculadoraRapidaClient";
import type { Config } from "@/lib/types";

export default async function CalculadoraPage() {
  const supabase = await createClient();
  const { data: config } = await supabase
    .schema("camadadupla")
    .from("config")
    .select("*")
    .single();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Calculadora Rápida</h1>
        <p className="text-[13px] text-[var(--text-muted)] mt-1">
          Custo e preço estimado sem precisar cadastrar produto.
        </p>
      </div>

      <CalculadoraRapidaClient config={config as Config} />
    </div>
  );
}
