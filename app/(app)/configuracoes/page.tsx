import { createClient } from "@/lib/supabase/server";
import type { Config } from "@/lib/types";
import ConfigClient from "@/components/ConfigClient";

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data: config } = await supabase.from("config").select("*").single<Config>();

  return <ConfigClient configInicial={config!} />;
}
