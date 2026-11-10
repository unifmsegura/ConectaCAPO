# Conecta CAPO

Plataforma da ONG Eliane Martins (Centro de Apoio ao Paciente Oncológico):
app móvel para doadoras (Pix, assinaturas e Mural de Impacto) + painel
administrativo com campanhas, assinantes, relatórios e gestão da equipe.

Stack: React 19 · TypeScript · Vite · Tailwind CSS 3 · Supabase (supabase-js v2)

## Requisitos

- Node.js 18+
- Um projeto Supabase com o schema aplicado (veja `conecta-capo.sql`)
- A Edge Function `create-charge` implantada no projeto Supabase

## Configuração

1. Instale as dependências:

   ```
   npm install
   ```

2. Crie o arquivo `.env` na raiz (copie de `.env.example`) e preencha com os
   valores do seu projeto Supabase (Settings → API):

   ```
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-anon-key
   ```

   > Usar apenas a URL e a anon key públicas. Nunca coloque a
   > `service_role` ou segredos do provedor de pagamento no front-end, eles
   > ficam na Edge Function `create-charge` (server-side).

3. Aplique o banco: rode `conecta-capo.sql` inteiro no SQL Editor do Supabase
   (em projeto novo/limpo). Ele cria tabelas, RLS, views, triggers, o bucket
   público `mural` e as campanhas iniciais.

4. Crie os usuários da equipe em Authentication -> Users e, no SQL Editor,
   libere cada um na tabela `admins` (as instruções estão comentadas no final
   do `conecta-capo.sql`). Papéis:
   - `admin` — acesso total ao painel;
   - `voluntaria` — acesso apenas às seções Mural e Configurações.

## Como rodar

```
npm run dev      # ambiente de desenvolvimento
npm run build    # build de produção (tsc + vite build)
npm test         # testes (vitest)
```

## Acessando

- App da doadora: raiz do site (`/`).
- Painel administrativo: `/#admin` (login com e-mail e senha; o papel vem
  da tabela `admins`). Não há botão de alternância na interface.

## Segurança

- Somente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no front-end.
- RLS em todas as tabelas: o público (anon) lê campanhas ativas, posts do
  mural e estatísticas agregadas; doações, assinaturas, despesas e a lista
  completa da equipe exigem sessão de administradora.
- O QR Pix é gerado pela Edge Function `create-charge`; o status do pagamento
  é consultado pelo RPC `donation_status` (id aleatório, sem dados pessoais).
