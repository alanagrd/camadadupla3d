-- Precificador 3D profissional — colunas novas (não destrutivo)
-- Rode INTEIRO no SQL Editor do Supabase (projeto CotaPro: tvujamusoucurjoqyfcc).
-- Todas as colunas entram com default 0, então nada quebra nos registros existentes.

alter table camadadupla.config
  add column if not exists potencia_w         numeric not null default 0,
  add column if not exists tarifa_kwh         numeric not null default 0,
  add column if not exists preco_impressora   numeric not null default 0,
  add column if not exists vida_util_horas    numeric not null default 0,
  add column if not exists custo_hora_trabalho numeric not null default 0,
  add column if not exists taxa_falha_pct     numeric not null default 0;

alter table camadadupla.produtos
  add column if not exists tempo_acabamento_min numeric not null default 0;
