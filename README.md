# Arcanum

Rede social e ecossistema místico gamificado — PWA mobile-first, responsivo para desktop.
Backend em **Supabase** (Postgres + Auth), compartilhado pelas duas versões do frontend abaixo.

> ⚠️ **Este `index.html`/`js/` na raiz NÃO está mais em produção.** Ele foi
> substituído pela reescrita em React + Vite + TypeScript que vive em
> [`app/`](./app) (`arcanum-mu.vercel.app` já serve o app novo). Este
> diretório continua no repositório apenas como referência histórica e rede
> de segurança para rollback — veja [`app/README.md`](./app/README.md) para
> a documentação da versão atual. O conteúdo abaixo descreve especificamente
> este `index.html` legado, não o app em produção.

---

## 1. Criar o projeto no Supabase

1. Crie uma conta em [supabase.com](https://supabase.com) e um novo projeto.
2. No projeto, vá em **SQL Editor → New query**, cole o conteúdo de
   [`supabase/schema.sql`](./supabase/schema.sql) e rode. Isso cria todas as
   tabelas com **Row Level Security (RLS) já habilitada** — sem isso, qualquer
   pessoa com a chave pública conseguiria ler/escrever qualquer linha.
3. Vá em **Project Settings → API** e copie:
   - **Project URL**
   - **anon public** key (⚠️ NUNCA use a `service_role` key aqui — essa é secreta e nunca deve aparecer em código de frontend)
4. Abra [`config.js`](./config.js) na raiz do projeto e cole os dois valores.
5. (Opcional, recomendado para testar rápido) Em **Authentication → Providers → Email**,
   desative "Confirm email" enquanto testa localmente — assim login funciona
   na hora, sem precisar clicar num link de confirmação por e-mail. Reative
   antes de ir para produção de verdade.

---

## 2. Rodar localmente

Como o app usa `<script type="module">` com imports ES, **não dá pra abrir o
`index.html` direto clicando duas vezes** (o navegador bloqueia imports de
módulo em `file://` por CORS). Sirva por HTTP:

```bash
# qualquer uma das duas opções funciona:
npx serve .
# ou
python3 -m http.server 8000
```

Depois abra `http://localhost:3000` (ou `:8000`) no navegador.

---

## 3. Subir para o GitHub

```bash
# dentro da pasta do projeto:
git remote add origin https://github.com/SEU-USUARIO/arcanum.git
git branch -M main
git push -u origin main
```

(Crie o repositório vazio no GitHub antes, sem README/gitignore — já temos os nossos.)

---

## 4. Deploy na Vercel

Não tem build step nem framework — é um site estático puro, então a Vercel
detecta e publica sem nenhuma configuração:

1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → selecione `arcanum`.
2. Framework Preset: **Other** (detectado automaticamente).
3. Deploy. Pronto — sem variáveis de ambiente a configurar, já que a chave
   `anon` do Supabase vive em `config.js` (e é segura para ficar pública —
   a proteção real é a RLS do banco, não o sigilo dessa chave).

---

## 5. O que está realmente ligado ao Supabase (e o que ainda é mock)

Pra não criar falsa expectativa, aqui vai o mapa exato:

### ✅ Real (Postgres + Auth + RLS)
- **Login / cadastro** (e-mail e senha via Supabase Auth)
- **Perfil**: tradição religiosa, Mana (XP), streak da Chama Sagrada — persistem entre sessões
- **Ágora**: publicar posts, curtir (✨ Axé), comentar — tudo gravado no banco
- **Grimório**: registros privados (só o próprio usuário lê os seus, via RLS)
- **Mural de Firmezas**: acender vela nova e "firmar" luz em vela existente

### 🟡 Ainda local (não persiste, sem tabela ainda)
- **Repost** e **"guardar no grimório" (bookmark de post)** — são reações puramente visuais por enquanto
- **Trilhas** (progresso de quiz) e **Duelos Arcanos** — a lógica do quiz/duelo roda no cliente; o Mana ganho *é* salvo no perfil, mas o progresso dos módulos (`done: true/false`) reseta ao recarregar a página
- **Sinastria Cósmica**, **Ritual da Lua Cheia**, **Desapego Sagrado** (marketplace) — conteúdo estático de exemplo
- **Upload de foto de altar** — o app mostra uma ilustração gerada (SVG), não faz upload real de imagem ainda

### Como estender (mesmo padrão usado no código)
Cada fluxo "real" acima segue o mesmo padrão em três arquivos:
- `supabase/schema.sql` → tabela + política de RLS
- `js/api.js` → funções `fetch*` / `create*` que chamam `supabase.from(...)`
- `index.html` → o handler do botão chama a função de `api.js` e atualiza o `state` local

Pra persistir progresso de trilha, por exemplo: crie uma tabela
`user_module_progress (user_id, module_id, done)`, adicione `fetchProgress` /
`markModuleDone` em `api.js`, e troque a checagem local `mod.done` pela
checagem vinda do banco.

---

## Estrutura do projeto

```
arcanum/
├── index.html              # app inteiro (UI + lógica de render)
├── config.js                # URL + anon key do Supabase (público, sem segredos)
├── js/
│   ├── supabaseClient.js    # cria o client do Supabase
│   ├── auth.js               # signup/login/logout/perfil
│   └── api.js                 # posts, likes, comentários, grimório, velas
├── supabase/
│   └── schema.sql            # tabelas + RLS (rodar no SQL Editor do Supabase)
├── vercel.json                # config opcional de hospedagem
└── README.md
```

## Segurança

- RLS está habilitado em toda tabela — sempre teste novas tabelas com "roda
  como usuário anônimo/outro usuário" antes de confiar nelas.
- A chave `anon` é pública por design do Supabase; a `service_role` nunca deve
  entrar neste repositório.
- Todo texto digitado pelo usuário (posts, comentários, grimório, velas) passa
  por `escapeHtml()` antes de ir para o DOM — sem isso, seria possível injetar
  HTML/JS via esses campos (XSS armazenado).
