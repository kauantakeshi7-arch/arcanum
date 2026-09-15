# Arcanum — app (React)

Reescrita em **React + Vite + TypeScript** do Arcanum, que substituiu o
`index.html` vanilla como app de **produção** (`arcanum-mu.vercel.app`).
O `index.html`/`js/` na raiz do repo continuam existindo só como referência
histórica e rede de segurança para rollback — não são mais servidos.

## Rodar localmente

```bash
cd app
npm install
cp .env.example .env.local   # preencha com as credenciais do seu projeto Supabase
npm run dev
```

## Scripts

- `npm run dev` — servidor de desenvolvimento (Vite)
- `npm run build` — typecheck + build de produção
- `npm run test` / `npm run test:watch` — Vitest
- `npm run lint` — ESLint
- `npm run format` — Prettier

## Estrutura

```
app/src/
├── main.tsx, App.tsx        # bootstrap + rotas (React Router, lazy por tela)
├── styles/tokens.css        # design tokens globais + classes utilitárias compartilhadas
├── lib/                     # supabaseClient, auth, api (Supabase), constantes, utilitários
├── types/                   # tipos por domínio (agora, covens, dm, egregora, ...)
├── context/                 # um *DataContext por domínio — busca dados uma vez, expõe ações
├── components/              # primitivos reaproveitáveis (modal, toast, shell, Skeleton, PageTransition)
└── features/                # uma pasta por tela/funcionalidade (agora, covens, perfil, ...)
```

Cada tela pesada (Covens, Trilhas, Altar, Egrégora, Perfil) é um chunk
separado via `React.lazy` — só baixa quando o usuário navega até ela.

## O que é real (Supabase) vs. o que é mock (local, sem tabela)

Mantido 1:1 do app original — o objetivo da migração foi paridade de
comportamento, não "consertar" mocks sem pedido explícito.

### ✅ Real
Login/cadastro, perfil (tradição, Mana/XP, streak, avatar da Loja de Mana),
Ágora (posts com upload de foto real, curtir, comentar, stories com
contagem de visualização), Grimório privado, Mural de Firmezas (velas),
Covens (criar/entrar/postar/curtir/comentar/membros/moderação), Passe Lunar
(conclusão persiste + Mana), Radar Sagrado (locais no mapa), Mural de
Graças Alcançadas, Mensagens Diretas (com Realtime), notificações,
seguir/bloquear/denunciar, badges/conquistas (calculadas sobre dados reais).

### 🟡 Ainda local (mock, sem tabela — igual ao app original)
- **Repost** e "guardar no grimório" (bookmark de post) — reação só visual (`context/AgoraDataContext.tsx`)
- **Progresso da Árvore da Sabedoria** (Trilhas) — o Mana ganho é salvo no perfil, mas o `done` de cada módulo reseta ao recarregar (`context/TrilhasDataContext.tsx`)
- **Duelos Arcanos** — inteiramente mock (`features/trilhas/DuelCard.tsx`)
- **Conexões/Afinidades** (Egrégora) — local-only (`features/egregora/AffinitiesList.tsx`)
- **Sinastria Cósmica** e **Desapego Sagrado** (mercado) — conteúdo estático (`features/egregora/egregoraData.ts`)
- **Grimório Público** do Perfil — grade de fotos ilustrativas, sem tabela própria

Ao dar uma nova capacidade real a algum desses, atualize esta lista — o
código já referencia "ver README" nos comentários acima.

## Modo Discreto

Três toques rápidos no brasão do Arcanum (topo da tela) escondem o app
inteiro atrás de uma calculadora real e funcional, preservando todo o
estado (nada é desmontado, só escondido via CSS). Digitar o código pessoal
salvo em `profiles.stealth_pin` e apertar "=" volta ao app. Ver
`context/StealthContext.tsx` e `features/stealth/StealthCalculator.tsx`.

## Deploy

Projeto Vercel de produção com **Root Directory = `app`**, framework
**Vite**. Variáveis de ambiente `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`
configuradas no ambiente **Production** do projeto (a anon key é pública
por design do Supabase — a proteção real é o RLS do banco).
