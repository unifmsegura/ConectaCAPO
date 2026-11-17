# Conecta CAPO

Plataforma da ONG Eliane Martins (Centro de Apoio ao Paciente Oncológico):
app móvel para doadoras (Pix, assinaturas e Mural de Impacto) + painel
administrativo com campanhas, assinantes, relatórios e gestão da equipe.

Stack: React 19 · TypeScript · Vite · Tailwind CSS 3 · Supabase (supabase-js v2)

## Requisitos

- Node.js 18+
- Um projeto Supabase com o schema aplicado (veja `conecta-capo.sql`)
- A Edge Function `create-charge` implantada no projeto Supabase


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
