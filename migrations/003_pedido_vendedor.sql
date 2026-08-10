-- Vendedor do pedido (qual criança fez a venda) — não destrutivo.
-- Rode INTEIRO no SQL Editor do Supabase (projeto CotaPro: tvujamusoucurjoqyfcc).
-- Coluna nullable: pedidos existentes ficam "sem vendedor" (null).

alter table camadadupla.pedidos
  add column if not exists vendedor_id uuid references camadadupla.criancas(id);
