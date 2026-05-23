# EasyProf — Guia de Configuração

## Pré-requisitos

- Node.js 18+
- Conta no Supabase (supabase.com)
- Conta na OpenAI (platform.openai.com)
- Conta no Stripe (stripe.com)

## 1. Clonar e instalar dependências

```bash
git clone <repositório>
cd easy-prof
npm install
```

## 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha todas as variáveis:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

OPENAI_API_KEY=sk-...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_PRICE_ID=price_...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Configurar Supabase

1. Crie um novo projeto em supabase.com
2. No SQL Editor, execute o conteúdo de `supabase/migrations/001_initial_schema.sql`
3. Em Authentication > URL Configuration, adicione:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`

## 4. Configurar Stripe

1. Crie uma conta em stripe.com
2. Crie um produto "EasyProf Premium" com preço de R$ 29,90/mês
3. Copie o Price ID para `STRIPE_PREMIUM_PRICE_ID`
4. Configure o webhook:
   - URL: `https://seu-dominio.com/api/stripe/webhook`
   - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## 5. Executar o projeto

```bash
npm run dev
```

Acesse http://localhost:3000

## 6. Deploy na Vercel

```bash
npm install -g vercel
vercel
```

Configure as variáveis de ambiente no painel da Vercel.

---

## Estrutura do Projeto

```
easy-prof/
├── app/
│   ├── (auth)/          # Páginas de autenticação
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/     # Área do professor (protegida)
│   │   ├── dashboard/   # Visão geral
│   │   ├── turmas/      # Gestão de turmas + detalhe com alunos
│   │   ├── alunos/      # Lista de turmas com link para alunos
│   │   ├── frequencia/  # Diário de classe digital
│   │   ├── avaliacoes/  # Gestão de avaliações
│   │   ├── notas/       # Lançamento de notas em massa
│   │   ├── planejamento/# Gerador de planejamentos com IA
│   │   ├── atividades/  # Gerador de atividades com IA
│   │   ├── provas/      # Gerador de provas com IA
│   │   ├── relatorios/  # Relatórios individuais com IA
│   │   ├── assistente/  # Chat pedagógico IA
│   │   ├── planos/      # Gestão de assinatura
│   │   └── perfil/      # Perfil do usuário
│   ├── api/
│   │   └── stripe/      # Webhooks e checkout Stripe
│   └── auth/callback/   # Callback OAuth Supabase
├── components/
│   ├── ui/              # Componentes base (shadcn style)
│   ├── shared/          # Componentes compartilhados
│   ├── turmas/          # Componentes de turmas
│   ├── alunos/          # Componentes de alunos
│   ├── frequencia/      # Controle de frequência
│   ├── avaliacoes/      # Gestão de avaliações
│   ├── notas/           # Lançamento de notas
│   ├── planejamento/    # Planejamento com IA
│   ├── atividades/      # Gerador de atividades
│   ├── provas/          # Gerador de provas
│   ├── relatorios/      # Relatórios com IA
│   ├── assistente/      # Chat IA
│   └── planos/          # Página de planos
├── lib/
│   ├── actions/         # Server Actions (auth, classes, students, grades, ai)
│   ├── openai/          # Cliente OpenAI + prompts
│   ├── stripe/          # Cliente Stripe
│   └── supabase/        # Cliente Supabase (client/server/middleware)
├── hooks/               # React hooks (useToast)
├── types/               # TypeScript types
└── supabase/
    └── migrations/      # SQL schema completo
```

## Banco de Dados

Tabelas principais:
- `profiles` — dados do professor
- `classes` — turmas
- `students` — alunos
- `attendance` — frequência
- `assessments` — avaliações
- `grades` — notas
- `lesson_plans` — planejamentos
- `activities` — atividades geradas
- `exams` — provas geradas
- `student_reports` — relatórios individuais
- `subscriptions` — assinaturas Stripe
- `ai_generations` — histórico de IA

Todas as tabelas têm RLS (Row Level Security) ativada.

## Limites do Plano Gratuito

- 1 turma máxima
- 30 alunos por turma
- 5 gerações de IA por mês (reset mensal)

## Modelo de IA

Utiliza `gpt-4o-mini` por padrão para equilíbrio entre qualidade e custo.
Para maior qualidade, altere `AI_MODEL` em `lib/openai/client.ts`.
