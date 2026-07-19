# SweetHub

Sistema de cálculo e precificação de produtos para confeitaria.

## Funcionalidades

- Cadastro dinâmico dos ingredientes da ficha técnica.
- Cálculo proporcional do custo usado a partir do preço e quantidade comprada.
- Composição com embalagem, custos operacionais, mão de obra e margem de lucro.
- Resultado de custo total, preço sugerido e valores unitários por rendimento.

## Como executar

```bash
npm install
npm run start
```

## Validação

```bash
npm test
npm run build
```

## Sistema de estilos (Sass)

Os estilos ficam em `src/styles/` (Sass, com `@use`/`@forward`) e são
compilados para `src/styles.css` — esse arquivo gerado não fica no
controle de versão, então **não edite `src/styles.css` diretamente**.

```
src/styles/
  abstracts/   → cores (escala 100–900), tipografia, tokens e mixins
  base/        → reset, tipografia base, botões e padrão de formulários
  components/  → navbar, banner, cards, listas, wizard, etc.
  main.scss    → ponto de entrada que importa tudo na ordem certa
```

- `npm run build:css` — compila uma vez (roda sozinho antes de `start` e `build`)
- `npm run watch:css` — recompila automaticamente a cada alteração, útil durante o desenvolvimento

Paleta: cor **primária** (vermelho-terracota), **secundária** (caramelo)
e **terciária** (dourado), cada uma com escala de 100 (mais clara) a 900
(mais escura) e o tom 500 como principal — ver
`src/styles/abstracts/_colors.scss`. Tipografia: `Fraunces` para títulos
e `Inter` para texto/formulários (carregadas via Google Fonts no
`index.html`).

## Publicação no GitHub

O passo a passo para autorizar pelo terminal e publicar no GitHub está em [`docs/subir-para-github.md`](docs/subir-para-github.md).

## Deploy no Cloudflare Workers

O projeto está migrando da Vercel pro Cloudflare Workers (static assets) —
plano grátis, sem limite de tráfego relevante e com uso comercial permitido.
Workers em vez de Pages porque a própria Cloudflare recomenda esse caminho
pra projetos novos (Pages é o caminho legado). Configuração em
`wrangler.jsonc` já pronta no repositório:
- **Build**: `npm run build` (gera `dist/`)
- **Deploy**: `npm run deploy` (builda e roda `wrangler deploy`)

Não há variáveis de ambiente pra configurar — a URL e a chave anon do
Supabase ficam direto em `src/supabaseClient.js` (a chave anon é pública por
natureza, ver comentário no arquivo). O rewrite do cardápio público
(`/loja/:slug`) é resolvido pela opção `not_found_handling:
"single-page-application"` em `wrangler.jsonc` — qualquer rota sem arquivo
correspondente cai no `index.html`, sem precisar de um arquivo `_redirects`
separado (isso era necessário no Pages).

Primeira vez rodando `npm run deploy`: o Wrangler abre o navegador pra
autenticar com a conta Cloudflare (`wrangler login`), se ainda não estiver
autenticado na máquina.

Pra apontar o domínio `sweethub.com.br`: no painel do Worker → Settings →
Domains & Routes → Add Custom Domain. Se o DNS dele já estiver no
Cloudflare, é só isso; senão, primeiro mova o DNS pro Cloudflare (ou aponte
um CNAME conforme o painel indicar).

## Deploy na Vercel (legado)

O projeto ainda tem um `vercel.json` configurado com:
- `buildCommand`: `npm run build`
- `outputDirectory`: `dist`
- rewrite de `/loja/:slug` pro cardápio público

Mantido por enquanto como opção de rollback durante a migração pro
Cloudflare Pages.

## Banco de dados (Supabase)

O projeto usa [Supabase](https://supabase.com) para autenticação e persistência de produtos, ingredientes e histórico de cálculos.

1. Rode o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) no **SQL Editor** do seu projeto Supabase para criar as tabelas e políticas de RLS.
2. As credenciais (URL e chave `anon`/`publishable`) ficam em `src/supabaseClient.js`. A chave anon é pública por natureza — a segurança é garantida pelas políticas de Row Level Security do banco.
3. Funcionalidades disponíveis após login:
   - Login/cadastro por e-mail e senha
   - Salvar e reabrir produtos/receitas
   - Cadastro reutilizável de ingredientes
   - Histórico dos últimos cálculos de precificação

## Super admin e privacidade (LGPD)

- A tabela `profiles` tem uma coluna `role` (`user` por padrão, `admin`).
  Para promover o primeiro super admin: peça para a pessoa criar a conta
  pelo cadastro normal do site e depois rode uma única vez no SQL Editor:
  ```sql
  update public.profiles set role = 'admin' where id = '<uuid do usuário>';
  ```
  Não existe um jeito de virar admin pelo próprio app — é proposital, para
  não deixar uma porta de promoção de admin exposta em produção.
- `supabase/functions/admin-users` é uma Edge Function que faz as ações de
  administrador (listar/suspender/reativar/excluir usuários) usando a
  service role key **apenas no servidor** — o navegador nunca tem acesso a
  essa chave. Publique/atualize com `supabase functions deploy admin-users`
  ou pelo MCP do Supabase.
- Qualquer usuário pode excluir a própria conta (direito ao esquecimento da
  LGPD) pelo menu de perfil → "Atualizar informações pessoais" → "Excluir
  minha conta". A exclusão remove a conta e, em cascata, todos os dados
  associados (receitas, ingredientes, despesas, histórico).
- Trocar a senha exige informar a senha atual (reautenticação) antes de
  definir a nova. O cadastro exige aceite explícito de um termo de
  tratamento de dados.

