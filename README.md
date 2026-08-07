# camadadupla3D

Sistema de produtos, precificação, pedidos, estoque e contas das crianças
pro negócio de impressão 3D. Next.js + Supabase, mesmo padrão dos outros
sistemas (AGOS, CotaPro).

Roda no **mesmo projeto Supabase do CotaPro**, mas isolado no schema
`camadadupla` — não mistura com as tabelas do CotaPro em si.

---

## Antes de rodar: o banco

Se ainda não rodou, execute o arquivo `camadadupla3d_schema.sql`
(entregue à parte) inteiro no **SQL Editor** do projeto Supabase do
CotaPro (`tvujamusoucurjoqyfcc`).

**Passo obrigatório depois de rodar o SQL:** em
*Project Settings → Data API → Exposed schemas*, adicione `camadadupla`
na lista. Sem isso o app não enxerga as tabelas.

---

## Rodando localmente

```bash
npm install
cp .env.example .env.local
```

Edita o `.env.local` e cola a **anon key** do projeto CotaPro
(Project Settings → API → Project API keys → `anon` `public`).

```bash
npm run dev
```

Abre em `http://localhost:3000`.

### Criar o primeiro usuário (seu login)

Esse app não tem tela de cadastro — só login (por enquanto é só você).
Crie o usuário direto no Supabase:

**Authentication → Users → Add user** → seu e-mail e senha.

---

## Deploy — GitHub + Vercel (automático)

```bash
git init
git add .
git commit -m "primeira versão do camadadupla3D"
git branch -M main
git remote add origin <URL_DO_SEU_REPO_GITHUB>
git push -u origin main
```

Depois:

1. No [dashboard do Vercel](https://vercel.com/new), importa esse
   repositório
2. Nas variáveis de ambiente do projeto, adiciona:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://tvujamusoucurjoqyfcc.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (a mesma do `.env.local`)
3. Deploy

A partir daí, todo `git push` na `main` gera deploy automático —
mesmo fluxo que você já usa no CotaPro e na AGOS.

---

## Estrutura

```
app/
  login/              tela de login
  (app)/              tudo que exige login
    page.tsx           dashboard
    produtos/          catálogo + precificação
    pedidos/           pedidos do Kayky
    clientes/          cadastro de clientes
    estoque/           filamentos e insumos
    contas/            contas do Kayky/Yago (3 potes)
    configuracoes/      custo hora-máquina, margem, piso
lib/
  calc.ts              lógica de precificação (mesma do Precificador
                        standalone, com os mesmos testes já validados)
  supabase/            clientes browser/server, schema "camadadupla"
  types.ts             tipos batendo 1:1 com o SQL
components/
  ui.tsx               componentes visuais compartilhados
  *Client.tsx           formulários (client components)
```

## O que ainda falta pra crescer

- Convite de login pro Kayky (hoje só você loga)
- Ligar pedido_itens a uma criança específica, pra automatizar o
  lançamento nas Contas em vez de fazer manual
- Upload de foto do produto
