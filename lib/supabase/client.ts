import { createBrowserClient } from "@supabase/ssr";

// Aponta explicitamente pro schema "camadadupla" -- por padrão o
// supabase-js só enxerga o schema "public". Sem isso, toda consulta
// falharia com "relation does not exist" mesmo com as tabelas certas.
//
// Sem genérico de tipos aqui de propósito: não geramos os tipos via
// Supabase CLI, então usamos os tipos manuais de lib/types.ts junto
// com .returns<T>() em cada consulta (ver as páginas em app/).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { db: { schema: "camadadupla" } }
  );
}
