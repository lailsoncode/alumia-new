# Blueprint replicável para um novo SaaS multi-tenant

> Guia de arquitetura e construção derivado do projeto MeAgende.Me, mas neutralizado para servir a qualquer nicho. A proposta é preservar a mesma linguagem, stack, forma de organização e fluxo técnico, sem carregar nomes ou regras de agendamento.

> **Nota da Alumia:** esta é uma cópia de referência do blueprint de origem. Os caminhos citados na seção de fontes pertencem ao repositório MeAgende.Me e são mantidos como texto para registrar a proveniência; eles não representam arquivos deste repositório.

- **Data do levantamento:** 21 de agosto de 2026
- **Status:** referência de criação para projetos novos
- **Objetivo:** permitir que uma equipe inicie outro produto do zero com a mesma identidade técnica do repositório atual.

---

## 1. Como usar este documento

Este arquivo tem três funções:

1. Registrar o padrão arquitetural que realmente existe no projeto atual.
2. Separar o que deve ser replicado do que é dívida técnica específica desta base.
3. Servir como roteiro executável para construir um novo SaaS em qualquer domínio.

Antes de começar, substitua todos os termos entre `<...>` e preencha a ficha do produto. Palavras como `organizations`, `operators` e `domain_records` são marcadores de arquitetura. No projeto real, use os nomes do novo domínio. Por exemplo, `domain_records` pode se tornar `orders`, `cases`, `courses`, `properties`, `deliveries` ou `projects`.

Não crie tabelas permanentemente genéricas apenas para seguir este guia. A arquitetura é genérica; o vocabulário do código deve ser específico e compreensível.

---

## 2. Diagnóstico do projeto de origem

O MeAgende.Me não é apenas uma aplicação de agenda. Tecnicamente, ele é um SaaS multi-tenant com quatro superfícies de produto:

- site institucional e aquisição;
- experiência pública personalizada de cada tenant;
- painel operacional do tenant;
- painel global da empresa dona da plataforma.

Há ainda experiências móveis distintas, integrações externas, cobrança recorrente, permissões por papel e por plano, telemetria e automações serverless.

Na fotografia analisada, o repositório contém:

- 366 arquivos TypeScript/TSX em `src`;
- 81 arquivos sob `src/pages`;
- 171 arquivos sob `src/components`;
- 48 hooks;
- 55 arquivos de regras e utilidades em `src/lib`;
- 50 Supabase Edge Functions;
- 273 migrations SQL;
- 17 arquivos de teste.

O estilo arquitetural é uma **arquitetura pragmática em camadas**, não uma Clean Architecture formal:

```text
Rotas e páginas
    ↓
Componentes de área e componentes de UI
    ↓
Hooks de consulta, mutação e orquestração
    ↓
Cliente Supabase, RPCs e Edge Functions
    ↓
PostgreSQL, RLS, triggers, jobs e integrações externas
```

Regras puras e sensíveis são progressivamente extraídas dos componentes para `src/lib`, onde podem ser testadas sem React. Estado remoto fica no React Query; sessão e tema ficam em contexts; estado visual local permanece nos componentes; abas e filtros compartilháveis ficam na URL.

### 2.1 O que deve ser preservado

- TypeScript ponta a ponta.
- React + Vite como SPA.
- Supabase para PostgreSQL, Auth, Storage, Realtime, RPCs e Edge Functions.
- React Query como fonte do estado vindo do servidor.
- Tailwind + shadcn/ui + Radix como design system.
- Separação por superfície: público, tenant admin e platform admin.
- Multi-tenancy desde a primeira migration.
- RLS como fronteira real de segurança.
- Migrations SQL incrementais e tipos de banco gerados.
- Regras críticas no banco ou em funções server-side, nunca apenas na interface.
- Lazy loading de áreas pesadas.
- Feature gating por plano separado da autorização por papel.
- Testes unitários colocalizados para regras puras.
- PWA e Capacitor como extensões do mesmo frontend quando fizerem sentido.

### 2.2 O que não deve ser copiado literalmente

O projeto atual cresceu rápido e carrega decisões que não devem virar padrão inicial:

- `strict: false` e `noImplicitAny: false` no TypeScript da aplicação;
- componentes e hooks com mais de mil linhas;
- regras de domínio dentro de componentes de apresentação;
- excesso de casts `any` em áreas antigas;
- Edge Functions fora do lint principal;
- funções públicas com `verify_jwt = false` sem uma política uniforme;
- dois sistemas de toast globais;
- arquivos gerados ou artefatos móveis misturados ao código-fonte;
- carregamento de agregados muito grandes em um único hook;
- segurança pública corrigida tardiamente por várias migrations de endurecimento.

O novo projeto deve manter a mesma estrutura mental, mas começar com tipagem estrita, módulos menores, contratos claros e segurança fechada por padrão.

---

## 3. Ficha obrigatória do novo produto

Preencha antes de criar banco ou telas:

```md
# Ficha do produto

- Nome: <NOME_DO_PRODUTO>
- Nicho: <NICHO>
- Problema central: <PROBLEMA>
- Tenant principal: <EMPRESA | ESCOLA | CLÍNICA | LOJA | EQUIPE | OUTRO>
- Entidade operacional principal: <PEDIDO | CASO | CURSO | IMÓVEL | PROJETO | OUTRO>
- Usuário gestor: <PAPEL>
- Usuário operador: <PAPEL>
- Cliente final: <PAPEL ou NÃO EXISTE>
- Ação pública principal: <AÇÃO ou NÃO EXISTE>
- Evento de sucesso do produto: <EVENTO MENSURÁVEL>
- Modelo de receita: <ASSINATURA | USO | COMISSÃO | HÍBRIDO>
- Planos iniciais: <LISTA>
- Integrações obrigatórias no MVP: <LISTA>
- Web, PWA ou app nativo: <ESCOPO>
- Dados sensíveis: <LISTA>
- Regras que exigem consistência transacional: <LISTA>
```

### 3.1 Tradução neutra do domínio atual

| Conceito estrutural | Nome neutro no blueprint | Exemplos em outros nichos |
| --- | --- | --- |
| Unidade atendida pelo SaaS | `organization` | escola, imobiliária, oficina, agência |
| Administrador da unidade | `organization_member` com papel admin | diretor, gerente, proprietário |
| Profissional executor | `operator` | professor, técnico, corretor, analista |
| Serviço ou produto | `offering` / `catalog_item` | curso, reparo, imóvel, pacote |
| Cliente da unidade | `customer` | aluno, comprador, contratante, paciente |
| Agendamento | `<domain_record>` | matrícula, ordem, caso, reserva, projeto |
| Configuração da unidade | `organization_settings` | identidade, regras e preferências |
| Painel SaaS global | `platform-admin` | operação interna da startup |
| Plano e funcionalidades | `plans` + `plan_features` | limites e módulos contratados |
| Fatura SaaS | `subscriptions` + `invoices` | cobrança da organização |

---

## 4. Stack canônica

Use as mesmas famílias tecnológicas e mantenha as versões travadas em `package-lock.json`.

| Camada | Tecnologia de referência | Responsabilidade |
| --- | --- | --- |
| Linguagem | TypeScript 5.8 | frontend, regras, scripts e Edge Functions |
| UI core | React 18.3 | composição da aplicação |
| Build | Vite 5.4 + SWC | desenvolvimento e bundles |
| Rotas | React Router DOM 6.30 | rotas públicas e protegidas |
| Server state | TanStack React Query 5.83 | cache, queries, mutations e invalidação |
| Backend | Supabase JS 2.90 | Auth, Postgres, Storage, Realtime e Functions |
| Banco | PostgreSQL gerenciado pelo Supabase | dados, RLS, RPCs, triggers e jobs |
| CSS | Tailwind CSS 3.4 | estilos utilitários e tokens |
| Componentes | shadcn/ui + Radix UI | primitives acessíveis e customizáveis |
| Formulários | React Hook Form 7 + Zod 3 | formulários e validação |
| Tema | next-themes | claro, escuro e tema por tenant |
| Datas | date-fns 3 | datas, períodos e formatação |
| Gráficos | Recharts 2 | dashboards |
| Feedback | Sonner ou shadcn Toaster | escolher apenas um sistema principal |
| Testes | Vitest 4 + Testing Library + jsdom | regras, hooks e componentes |
| PWA | vite-plugin-pwa + Workbox | instalação, cache e service worker |
| Mobile opcional | Capacitor 8 | Android e iOS usando o bundle web |
| CI mobile opcional | Codemagic | build e publicação de apps |

Bibliotecas de pagamentos, mensagens, IA, geração de PDF, QR code ou push são módulos opcionais. Instale apenas quando uma vertical do produto exigir.

### 4.1 Requisitos de ambiente

- Node.js 20.19 ou versão LTS compatível definida pelo projeto.
- npm com lockfile versionado.
- Supabase CLI.
- Docker para Supabase local, se o fluxo local for adotado.
- Java/Android Studio e Xcode somente quando houver build nativo.

---

## 5. Princípios arquiteturais

### 5.1 Multi-tenant desde o primeiro dia

Toda tabela pertencente a um cliente empresarial recebe `organization_id NOT NULL`, chave estrangeira, índice e policy RLS. Não adicione multi-tenancy depois que o produto já contém dados.

### 5.2 Segurança em profundidade

A cadeia correta é:

```text
Route guard → feature gate visual → validação server-side → RLS → constraints do banco
```

Route guards e botões ocultos melhoram a experiência, mas não autorizam operações. A autorização real está no banco e nas Edge Functions.

### 5.3 Estado no lugar certo

- React Query: tudo que vem do servidor.
- URL: aba ativa, paginação, busca e filtros compartilháveis.
- Context: sessão, tema e seleção global do tenant.
- Estado local: modal, formulário, seleção temporária e UI efêmera.
- Banco: estado de negócio e invariantes duráveis.

Não adicione outra biblioteca global de estado até existir um problema concreto que essas quatro categorias não resolvam.

### 5.4 Regras puras fora da UI

Cálculos financeiros, transições de status, elegibilidade, limites, normalização e decisões de negócio ficam em `src/lib/<regra>.ts`, com teste ao lado. Componentes exibem resultado e disparam ações; não são a fonte da regra.

### 5.5 Operações críticas são atômicas

Uma ação que altera múltiplas tabelas, movimenta dinheiro, reserva estoque, consome limite ou dispara efeito externo deve usar uma RPC transacional ou Edge Function idempotente.

### 5.6 Público é uma API diferente

Fluxos anônimos não acessam tabelas sensíveis diretamente. Use views sanitizadas para leitura e RPCs estreitas para escrita. O cliente nunca escolhe status interno, total monetário, desconto, papel, tenant ou campos de auditoria.

---

## 6. Superfícies e rotas

Mantenha a divisão do produto em superfícies explícitas:

| Superfície | Rota sugerida | Acesso | Função |
| --- | --- | --- | --- |
| Institucional | `/` | público | aquisição, SEO e planos |
| Autenticação | `/login`, `/criar-conta` | público | entrada e onboarding |
| Experiência do tenant | `/:slug` | público ou cliente | vitrine/portal personalizado |
| Painel do tenant | `/admin` | autenticado | operação do cliente empresarial |
| Painel do operador | `/workspace` | autenticado + papel | experiência operacional simplificada |
| Painel da plataforma | `/platform-admin` | platform admin | gestão global do SaaS |
| Legal e suporte | `/termos`, `/privacidade`, `/ajuda` | público | conformidade e suporte |

Regras:

- painéis grandes são carregados com `React.lazy` e `Suspense`;
- o painel usa `?tab=<id>` para estado navegável e compartilhável;
- cada rota protegida aguarda sessão e papéis antes de decidir;
- páginas públicas dinâmicas por `slug` ficam depois das rotas institucionais específicas;
- cada superfície pode aplicar um tema por wrapper, sem duplicar os componentes base.

---

## 7. Estrutura de diretórios

```text
<novo-projeto>/
├── public/
│   ├── icons/
│   ├── images/
│   ├── manifest.webmanifest
│   └── robots.txt
├── src/
│   ├── assets/                     # assets importados pelo bundle
│   ├── components/
│   │   ├── ui/                     # primitives shadcn; sem regra de negócio
│   │   ├── auth/                   # componentes de autenticação
│   │   ├── public/                 # experiência pública do tenant
│   │   ├── admin/                  # painel operacional do tenant
│   │   │   └── <feature>/          # subpasta quando a feature crescer
│   │   ├── platform-admin/         # operação global do SaaS
│   │   │   ├── components/
│   │   │   └── sections/
│   │   └── shared/                 # componentes de negócio realmente comuns
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   ├── OrganizationContext.tsx
│   │   └── ThemeProvider.tsx
│   ├── data/                       # conteúdo estático tipado
│   ├── hooks/
│   │   ├── admin/
│   │   ├── platform-admin/
│   │   ├── public/
│   │   └── useUserRoles.ts
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts            # gerado; nunca editar manualmente
│   ├── lib/
│   │   ├── domain/                 # regras puras por domínio
│   │   ├── formatters.ts
│   │   ├── seo.ts
│   │   ├── queryKeys.ts
│   │   └── utils.ts
│   ├── pages/
│   │   ├── Index.tsx
│   │   ├── Login.tsx
│   │   ├── Admin.tsx
│   │   ├── PlatformAdmin.tsx
│   │   ├── PublicOrganization.tsx
│   │   └── NotFound.tsx
│   ├── test/
│   │   └── setup.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── sw.ts                       # somente se PWA estiver ativa
├── supabase/
│   ├── functions/
│   │   ├── _shared/
│   │   │   ├── auth.ts
│   │   │   ├── cors.ts
│   │   │   ├── http.ts
│   │   │   ├── idempotency.ts
│   │   │   └── rate-limit.ts
│   │   └── <verbo-entidade>/index.ts
│   ├── migrations/
│   ├── seed.sql
│   └── config.toml
├── scripts/                        # build, manutenção e geração
├── docs/
│   ├── architecture.md
│   ├── domain.md
│   ├── security.md
│   └── runbook.md
├── .env.example
├── components.json
├── eslint.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.app.json
├── vite.config.ts
└── vitest.config.ts
```

Se houver um app de cliente realmente diferente, crie `client-app-src` e um `vite.client.config.ts`. Se a diferença for apenas rota, tema ou permissões, mantenha uma única aplicação para evitar dois frontends divergentes.

### 7.1 Regra de dependência

```text
pages → components de área → hooks → integrations
                    ↘       ↘
                      lib/domain

components/ui não importa hooks de domínio.
lib/domain não importa React, DOM ou Supabase.
integrations não importa componentes.
```

### 7.2 Limites de tamanho

- Até 200 linhas: normal.
- Entre 200 e 400: revisar responsabilidade.
- Acima de 400: dividir, salvo arquivo declarativo ou gerado.
- Um hook não deve agregar uma área inteira se as queries possuem ciclos de vida diferentes.
- Um componente de tab coordena subcomponentes; não concentra todos os formulários e regras da feature.

---

## 8. Convenções de código

| Elemento | Convenção | Exemplo |
| --- | --- | --- |
| Componente | PascalCase | `OrganizationCard.tsx` |
| Hook | `use` + PascalCase | `useOrganizationOrders.ts` |
| Helper | camelCase | `calculateOrderTotal.ts` |
| Teste | ao lado do código | `calculateOrderTotal.test.ts` |
| Tabela | snake_case plural | `organization_members` |
| Coluna | snake_case | `organization_id` |
| Edge Function | kebab-case verbo-entidade | `create-order-checkout` |
| Query key | array estável | `['orders', organizationId, filters]` |
| Feature code | snake_case semântico | `unit_reports` |
| Migration | timestamp + descrição | `20260821120000_create_orders.sql` |

Regras adicionais:

- imports internos usam `@/`;
- componentes recebem IDs e contratos mínimos, não objetos globais desnecessários;
- dinheiro é armazenado em centavos inteiros;
- datas absolutas usam `timestamptz`; datas civis usam `date`; horários locais isolados usam `time` quando apropriado;
- status relevantes usam enum PostgreSQL ou `CHECK`, não texto livre;
- toda entidade mutável possui `created_at` e `updated_at`;
- logs usam contexto e nunca incluem tokens, chaves, payloads pessoais completos ou dados de cartão;
- comentários explicam o motivo da decisão, não repetem o código.

---

## 9. Bootstrap do projeto

### 9.1 Criação da aplicação

```bash
npm create vite@5 <nome-do-projeto> -- --template react-swc-ts
cd <nome-do-projeto>
npm install
```

Instale os grupos da stack, mantendo os mesmos majors do projeto de origem:

```bash
npm install react-router-dom@^6.30 @tanstack/react-query@^5.83 @supabase/supabase-js@^2.90
npm install react-hook-form@^7.61 @hookform/resolvers@^3.10 zod@^3.25
npm install tailwind-merge@^2.6 class-variance-authority@^0.7 clsx@^2.1
npm install next-themes@^0.3 sonner@^1.7 date-fns@^3.6 recharts@^2.15
npm install -D vite@^5.4 typescript@^5.8 @vitejs/plugin-react-swc@^4.2
npm install -D tailwindcss@^3.4 tailwindcss-animate@^1.0 postcss@^8.5 autoprefixer@^10.4
npm install -D vitest@^4 @testing-library/react@^16 @testing-library/jest-dom@^6 @testing-library/user-event@^14 jsdom@^29
```

Inicialize shadcn/ui e adicione primitives sob demanda. Não instale dezenas de componentes sem uso.

### 9.2 Scripts mínimos

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "typecheck": "tsc -b --noEmit",
    "lint": "eslint .",
    "test": "vitest",
    "test:run": "vitest run",
    "check": "npm run lint && npm run typecheck && npm run test:run && npm run build"
  }
}
```

Use `npm ci` em CI e deploy. Use `npm install` apenas para alterar dependências.

### 9.3 TypeScript obrigatório

O projeto novo começa com:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true,
    "isolatedModules": true,
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "noEmit": true,
    "paths": { "@/*": ["./src/*"] }
  }
}
```

Não enfraqueça a configuração para fazer uma feature compilar. Corrija o contrato.

---

## 10. Variáveis de ambiente e segredos

`.env.example` deve documentar nomes sem valores reais:

```dotenv
# Seguro para o bundle web
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_APP_URL=

# Opcional e público por natureza
VITE_PUSH_APP_ID=

# Somente scripts locais ou ambiente server-side
SUPABASE_SERVICE_ROLE_KEY=

# Somente Supabase Secrets / backend
PAYMENT_PROVIDER_ACCESS_TOKEN=
PAYMENT_WEBHOOK_SECRET=
MESSAGING_API_KEY=
AI_PROVIDER_API_KEY=
```

Política:

- qualquer variável `VITE_*` pode ser lida pelo usuário no navegador;
- service role nunca entra no frontend;
- integrações externas que exigem segredo passam por Edge Function;
- `.env`, keystores e certificados ficam ignorados pelo Git;
- ambientes local, staging e produção usam projetos Supabase separados.

---

## 11. Composição da aplicação React

Use uma única raiz de providers, nesta ordem conceitual:

```tsx
<QueryClientProvider client={queryClient}>
  <ThemeProvider>
    <AuthProvider>
      <OrganizationProvider>
        <BrowserRouter>
          <MonitoringProvider />
          <AppRoutes />
          <Toaster />
        </BrowserRouter>
      </OrganizationProvider>
    </AuthProvider>
  </ThemeProvider>
</QueryClientProvider>
```

O `App.tsx` deve fazer apenas:

- configurar providers;
- declarar rotas;
- aplicar guards;
- lazy-load de superfícies grandes;
- instalar error boundary e telemetria global.

Não coloque regras do domínio, chamadas de cobrança ou registro complexo de push diretamente em `App.tsx`; mova para providers ou hooks dedicados.

### 11.1 Guards

Cada guard segue a mesma sequência:

1. aguardar sessão;
2. se não autenticado, redirecionar para login;
3. aguardar papéis e tenant atual;
4. verificar papel necessário;
5. renderizar com `Suspense`.

Nunca interprete `loading` como ausência de permissão.

---

## 12. Acesso a dados com React Query

Um hook de feature encapsula query, mutation e invalidação:

```ts
export const organizationKeys = {
  all: ["organizations"] as const,
  detail: (id: string) => ["organizations", id] as const,
  records: (id: string, filters: Record<string, unknown>) =>
    ["organization-records", id, filters] as const,
};

export function useDomainRecords(organizationId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ["domain-records", organizationId] as const;

  const query = useQuery({
    queryKey,
    enabled: Boolean(organizationId),
    queryFn: async () => {
      if (!organizationId) return [];
      const { data, error } = await supabase
        .from("<domain_records>")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateDomainRecordInput) => {
      const { data, error } = await supabase
        .from("<domain_records>")
        .insert({ ...input, organization_id: organizationId! })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    records: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createRecord: createMutation.mutateAsync,
    isSaving: createMutation.isPending,
  };
}
```

Regras:

- query key sempre inclui `organizationId` e filtros que alteram o resultado;
- `enabled` impede consulta sem contexto;
- erros são lançados pelo hook e apresentados pela UI;
- mutações invalidam apenas as chaves afetadas;
- paginação é obrigatória em listas que podem crescer;
- não busque histórico ilimitado no carregamento inicial;
- chamadas independentes podem executar em paralelo;
- Realtime atualiza ou invalida caches específicos, nunca a aplicação inteira.

---

## 13. Formulários e validação

Use Zod como contrato de entrada e React Hook Form para estado do formulário:

```ts
const entitySchema = z.object({
  name: z.string().trim().min(2).max(120),
  status: z.enum(["draft", "active", "archived"]),
  amount_cents: z.number().int().nonnegative(),
});

type EntityFormValues = z.infer<typeof entitySchema>;
```

Validação no navegador melhora feedback. A mesma regra relevante deve existir no banco por `CHECK`, foreign key, unique index, RLS ou RPC. Nunca confie somente no schema do frontend.

---

## 14. Modelo de banco multi-tenant

### 14.1 Núcleo estrutural

```text
auth.users
    │
    ├── profiles
    ├── platform_user_roles
    └── organization_members ── organizations ── organization_settings
                                      │
                                      ├── <domain_records>
                                      ├── <catalog_items>
                                      ├── customers
                                      ├── audit_logs
                                      └── subscriptions ── invoices

plans ── plan_features
```

Tabelas mínimas:

- `profiles`: identidade pública do usuário;
- `organizations`: tenant;
- `organization_members`: vínculo usuário/tenant/papel;
- `platform_user_roles`: papéis globais raros;
- `organization_settings`: personalização e comportamento do tenant;
- entidades reais do novo nicho;
- `plans`, `plan_features`, `subscriptions`, `invoices`;
- `audit_logs`, `webhook_events` e `idempotency_keys` quando o produto exigir.

### 14.2 Exemplo de tabela

```sql
create table public.<domain_records> (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null
    references public.organizations(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  status public.<domain_record_status> not null default 'draft',
  amount_cents integer not null default 0 check (amount_cents >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index <domain_records>_organization_created_idx
  on public.<domain_records>(organization_id, created_at desc);

alter table public.<domain_records> enable row level security;
```

Use JSONB apenas para extensão ou snapshots; campos pesquisáveis, relacionais ou sujeitos a regra devem ser colunas normais.

### 14.3 RLS base

Crie helpers centrais e policies explícitas:

```sql
create or replace function public.is_organization_member(_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = _organization_id
      and m.user_id = auth.uid()
      and m.is_active = true
  );
$$;

revoke all on function public.is_organization_member(uuid) from public;
grant execute on function public.is_organization_member(uuid) to authenticated;

create policy "members_select_domain_records"
on public.<domain_records>
for select to authenticated
using (public.is_organization_member(organization_id));

create policy "members_insert_domain_records"
on public.<domain_records>
for insert to authenticated
with check (
  public.is_organization_member(organization_id)
  and created_by = auth.uid()
);
```

Para update e delete, verifique o papel necessário. Não use `USING (true)` em tabelas sensíveis.

### 14.4 Fluxos públicos

Leitura pública:

- exponha somente uma view com colunas sanitizadas;
- filtre tenants ativos;
- não inclua billing, segredos, configurações internas ou dados pessoais.

Escrita pública:

- revogue insert/update direto na tabela base;
- crie uma RPC específica;
- valide tenant, payload, estado e limite;
- recalcule totais e status no servidor;
- use unique index ou chave idempotente contra duplicidade;
- aplique rate limit.

### 14.5 Migrations

Cada mudança de banco cria uma nova migration. Nunca reescreva uma migration já aplicada em staging ou produção.

Uma migration completa deve considerar:

1. tipos/enums;
2. tabela e constraints;
3. índices;
4. trigger de `updated_at`;
5. RLS e policies;
6. grants e revokes;
7. funções/RPCs;
8. backfill compatível;
9. comentários ou documentação da decisão.

Após mudar o schema, regenere `src/integrations/supabase/types.ts` e execute typecheck.

---

## 15. Edge Functions

Use Edge Function quando houver:

- segredo externo;
- webhook;
- chamada privilegiada com service role;
- operação longa ou integração de terceiros;
- envio de mensagem/push/email;
- IA;
- cron/job;
- orquestração que não cabe em uma transação SQL.

Use RPC quando a ação for essencialmente uma transação de banco.

### 15.1 Estrutura de uma função

```text
supabase/functions/<verbo-entidade>/index.ts
```

Ordem interna:

1. CORS/OPTIONS;
2. validação de método;
3. parse e validação do payload;
4. autenticação;
5. autorização do tenant/papel;
6. rate limit e idempotência;
7. execução;
8. persistência do resultado;
9. resposta JSON estável;
10. log estruturado sem dados sensíveis.

Contrato de resposta:

```json
{
  "ok": true,
  "data": {},
  "requestId": "uuid"
}
```

Erro:

```json
{
  "ok": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Ação não permitida."
  },
  "requestId": "uuid"
}
```

### 15.2 Política de autenticação

- `verify_jwt = true` por padrão.
- Função pública só usa `false` com justificativa documentada e validações próprias.
- Webhook valida assinatura do provedor antes de processar.
- Cron aceita service role ou segredo dedicado.
- Função privilegiada nunca confia no `organization_id` do payload sem verificar vínculo.
- Helpers de auth, CORS, HTTP e rate limit ficam em `_shared`.

### 15.3 Idempotência

Pagamentos, provisionamento, mensagens e webhooks exigem uma chave única. Repetir a mesma requisição deve retornar o resultado anterior ou não produzir efeito duplicado.

---

## 16. Papéis, permissões e planos

Separe três conceitos:

1. **Autenticação:** quem é o usuário.
2. **Autorização:** o que o papel pode fazer.
3. **Entitlement:** o que o plano contratado libera.

Papéis neutros sugeridos:

- `platform_admin`: administra o SaaS inteiro;
- `organization_admin`: administra um tenant;
- `operator`: executa trabalho operacional limitado;
- `customer`: usa portal próprio;
- `reseller`: opcional, opera aquisição/comissão.

Um `organization_admin` pode ter permissão para relatórios, mas o plano pode não incluir o módulo. A interface verifica os dois; RLS/RPC verifica a autorização; cobrança e feature gate verificam o entitlement.

Estrutura sugerida:

```text
plans
plan_features
subscriptions
organization_members
platform_user_roles
```

Feature codes devem ser estáveis e descrever capacidade, como `unit_dashboard`, `unit_finance`, `unit_automation` e `unit_api_access`.

---

## 17. Design system e temas

Mantenha cores semânticas em CSS custom properties HSL:

```css
:root {
  --background: 0 0% 98%;
  --foreground: 222 47% 11%;
  --card: 0 0% 100%;
  --card-foreground: 222 47% 11%;
  --primary: 221 83% 53%;
  --primary-foreground: 0 0% 100%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 16% 47%;
  --destructive: 0 84% 60%;
  --border: 214 32% 91%;
  --radius: 0.75rem;
}
```

Regras:

- componentes usam `bg-primary`, `text-muted-foreground`, `border-border`;
- não espalhe hex hardcoded;
- identidade do tenant altera tokens no wrapper da superfície dele;
- plataforma e tenants podem ter temas diferentes sobre os mesmos primitives;
- componentes `ui` são genéricos; componentes de área conhecem o domínio;
- responsividade e acessibilidade fazem parte da definição de pronto.

---

## 18. PWA e mobile

Adicione somente depois da vertical web principal estar estável.

### 18.1 PWA

- `vite-plugin-pwa` com `injectManifest` quando houver service worker customizado;
- precache de assets versionados;
- fallback SPA apenas para navegações da própria origem;
- não interceptar POST/PUT/PATCH/DELETE;
- não cachear respostas privadas indiscriminadamente;
- atualização do service worker observável e testada.

### 18.2 Capacitor

- o build web continua sendo a fonte do app;
- configurações de app ID, nome e diretório de build ficam centralizadas;
- plugins nativos são carregados dinamicamente e apenas em plataforma nativa;
- permissões e deep links são tratados em hooks dedicados;
- certificados, keystores e arquivos de assinatura nunca são versionados.

Só crie segundo bundle `client-app-src` se houver navegação, sessão e ciclo de release realmente diferentes.

---

## 19. Observabilidade

O novo projeto deve registrar, no mínimo:

- erros React por rota;
- duração e falha de Edge Functions;
- duração de queries críticas;
- web vitals;
- falhas de webhook;
- jobs atrasados ou não executados;
- eventos de negócio essenciais.

Cada evento inclui `request_id`, rota/função, duração, status e `organization_id` quando permitido. Não grave conteúdo sensível apenas para facilitar debug.

Error boundaries devem oferecer fallback útil e enviar o erro para a telemetria. Falha de telemetria nunca pode quebrar o fluxo principal.

---

## 20. Estratégia de testes

### 20.1 Pirâmide mínima

1. **Regras puras:** cálculos, status, elegibilidade, normalização e limites.
2. **Componentes:** formulários, passos e estados relevantes.
3. **Hooks:** query keys, transformações e invalidações com Supabase mockado.
4. **Banco:** RLS, RPCs, constraints e idempotência em ambiente local/staging.
5. **Smoke:** login, onboarding e primeira ação central antes de cada release.

### 20.2 Casos obrigatórios

- usuário de um tenant não lê ou altera outro tenant;
- usuário autenticado sem vínculo recebe bloqueio;
- anônimo vê apenas campos públicos;
- reenvio não duplica operação crítica;
- valores monetários arredondam corretamente;
- transições de status inválidas são rejeitadas;
- webhook repetido não duplica pagamento;
- feature bloqueada pelo plano não executa server-side;
- loading não causa redirect indevido;
- listas grandes paginam.

### 20.3 Gate de qualidade

Antes de merge ou deploy:

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
```

O build não substitui typecheck. Edge Functions precisam de lint/typecheck próprio no CI.

---

## 21. Deploy e ambientes

### 21.1 Ordem segura

1. aplicar migrations compatíveis;
2. publicar Edge Functions;
3. configurar secrets;
4. publicar frontend;
5. executar smoke tests;
6. monitorar erros e webhooks.

Mudanças destrutivas usam estratégia expand/contract: primeiro adicionar o novo contrato, migrar consumidores e dados, e só depois remover o antigo.

### 21.2 Frontend

- build gera `dist`;
- servidor estático precisa de fallback para `index.html`;
- assets com hash podem ter cache imutável;
- HTML não deve usar cache longo;
- configure HSTS, CSP, `nosniff`, frame policy, referrer policy e permissions policy;
- variáveis de produção entram no build pelo provedor, nunca pelo Git.

### 21.3 Ambientes

```text
local → staging → production
```

Cada ambiente possui banco, Auth, Storage, secrets, webhooks e credenciais próprios. Não teste migrations ou webhooks destrutivos diretamente em produção.

---

## 22. Sequência de construção do zero

### Fase 0 — Domínio e contratos

- preencher a ficha do produto;
- definir vocabulário real;
- desenhar papéis, tenants e primeira jornada;
- identificar invariantes e dados sensíveis;
- escrever `docs/domain.md`.

**Saída:** modelo conceitual e primeira vertical escolhida.

### Fase 1 — Fundação

- Vite + React + TypeScript estrito;
- Tailwind, shadcn e tokens;
- Router, Query Client, Theme e Error Boundary;
- Supabase client e `.env.example`;
- ESLint, Vitest e scripts de check.

**Saída:** shell da aplicação compilando e testando.

### Fase 2 — Tenant e autenticação

- migrations de profiles, organizations e memberships;
- AuthContext;
- seleção do tenant atual;
- papéis e route guards;
- RLS e testes de isolamento;
- onboarding idempotente.

**Saída:** usuário cria/acessa tenant sem vazar dados.

### Fase 3 — Primeira vertical completa

Construa uma única jornada de ponta a ponta:

```text
Migration → RLS/RPC → tipos gerados → hook → tela → teste → telemetria
```

Exemplo: criar e listar a entidade central do novo nicho.

**Saída:** primeira entrega usável em staging.

### Fase 4 — Painéis

- painel do tenant com sidebar, topbar e tabs por URL;
- painel do operador, se necessário;
- experiência pública por slug, se existir;
- lazy loading e paginação.

**Saída:** superfícies separadas e coerentes.

### Fase 5 — SaaS comercial

- planos, features, subscriptions e invoices;
- feature gates;
- checkout e webhook idempotente;
- bloqueio/grace period definido no servidor;
- painel global da plataforma.

**Saída:** produto cobrando com rastreabilidade.

### Fase 6 — Integrações e automações

- Edge Functions com `_shared`;
- rate limit, logs e idempotência;
- mensagens, push, IA ou APIs externas;
- jobs e alertas operacionais.

**Saída:** integrações observáveis e recuperáveis.

### Fase 7 — PWA/mobile

- manifest e service worker;
- Capacitor quando houver justificativa de produto;
- permissões, deep links e CI mobile;
- smoke em dispositivos reais.

**Saída:** canal móvel sem bifurcar regras de negócio.

---

## 23. Checklist de uma nova feature

```md
## Feature: <NOME>

### Domínio
- [ ] Problema e regra documentados
- [ ] Estados e transições definidos
- [ ] Papéis autorizados definidos
- [ ] Feature de plano definida, se aplicável

### Banco
- [ ] Migration incremental
- [ ] organization_id + índice nas tabelas do tenant
- [ ] Constraints e foreign keys
- [ ] RLS para select/insert/update/delete
- [ ] Fluxo público sanitizado
- [ ] Idempotência para operação crítica
- [ ] Tipos Supabase regenerados

### Backend
- [ ] RPC para transação de banco, se necessária
- [ ] Edge Function apenas quando necessária
- [ ] Auth, autorização, rate limit e logs
- [ ] Segredos fora do frontend

### Frontend
- [ ] Query keys incluem tenant/filtros
- [ ] Loading, vazio, erro e sucesso
- [ ] Mutation invalida cache correto
- [ ] Formulário com Zod
- [ ] Responsivo e acessível
- [ ] Lazy loading se a área for pesada

### Qualidade
- [ ] Teste da regra pura
- [ ] Teste do componente/hook crítico
- [ ] Teste de isolamento RLS
- [ ] lint, typecheck, testes e build passam
- [ ] Telemetria e documentação atualizadas
```

---

## 24. Anti-padrões proibidos

- Colocar service role ou segredo em variável `VITE_*`.
- Consultar tabela multi-tenant sem filtrar tenant e sem RLS.
- Tratar usuário `authenticated` como autorizado globalmente.
- Aceitar total, status, papel ou `organization_id` sensível calculado pelo cliente.
- Usar `SECURITY DEFINER` sem `search_path`, grants mínimos e validação de `auth.uid()`.
- Abrir tabela sensível ao anônimo para resolver rapidamente uma tela pública.
- Editar migration que já foi aplicada.
- Usar `any` para contornar contrato de banco.
- Duplicar estado remoto em Context ou `useState`.
- Invalidar todas as queries após qualquer mutation.
- Carregar todo o histórico de uma entidade no primeiro render.
- Criar componente gigante para uma feature inteira.
- Misturar integração externa com componente visual.
- Logar tokens, headers de autorização ou dados pessoais completos.
- Considerar botão desabilitado como proteção contra duplicidade.
- Publicar porque `vite build` passou enquanto typecheck ou testes falham.

---

## 25. Definição de pronto do projeto-base

O template está pronto para ser reutilizado quando:

- o projeto sobe com um único comando;
- `strict` está ativo;
- lint, typecheck, testes e build passam;
- login, logout e recuperação de senha funcionam;
- um usuário pode pertencer a um ou mais tenants;
- isolamento entre tenants foi testado;
- platform admin e tenant admin possuem rotas separadas;
- a primeira entidade do domínio tem CRUD paginado;
- uma regra crítica está em `lib/domain` e possui teste;
- o banco foi criado apenas por migrations;
- os tipos Supabase são gerados;
- nenhuma chave secreta está no bundle;
- há `.env.example`, documentação de domínio, segurança e deploy;
- staging reproduz o fluxo principal;
- logs permitem localizar falhas sem expor dados sensíveis.

---

## 26. Prompt mestre para iniciar outro projeto

O bloco abaixo pode ser entregue a uma pessoa ou agente de código junto com este documento:

```text
Crie um SaaS multi-tenant para o nicho <NICHO>, chamado <NOME>.

Use obrigatoriamente TypeScript, React 18, Vite 5 com SWC, React Router,
TanStack React Query, Supabase (Postgres, Auth, Storage, Realtime, RPCs e
Edge Functions), Tailwind CSS, shadcn/ui, Radix UI, React Hook Form, Zod,
Vitest e Testing Library. PWA e Capacitor são opcionais e só entram quando
explicitamente solicitados.

Siga a arquitetura pragmática em camadas deste blueprint:
- pages para rotas e composição;
- components/ui para primitives sem domínio;
- components/public, components/admin e components/platform-admin para superfícies;
- hooks para queries, mutations e orquestração;
- lib/domain para regras puras testáveis;
- integrations/supabase para infraestrutura;
- migrations, RPCs, RLS e Edge Functions no diretório supabase.

O tenant é <TENANT>. A entidade central é <ENTIDADE>. Os papéis são <PAPÉIS>.
A primeira jornada vertical é <JORNADA>. O modelo de cobrança é <MODELO>.

Requisitos inegociáveis:
- TypeScript strict;
- multi-tenancy desde a primeira migration;
- RLS fechada por padrão;
- nenhuma service role no navegador;
- operações críticas atômicas e idempotentes;
- papéis separados de features do plano;
- estado remoto apenas no React Query;
- regras de domínio fora dos componentes;
- query keys contendo tenant e filtros;
- listas paginadas;
- migrations incrementais e tipos Supabase gerados;
- lint, typecheck, testes e build como gate;
- nenhuma tela nova sem estados de loading, vazio, erro e sucesso.

Implemente em verticais completas na ordem:
migration e segurança → tipos → regra de domínio → hook → UI → testes → telemetria.
Não crie módulos futuros antes de a primeira vertical funcionar em staging.
```

---

## 27. Fontes internas auditadas

Este blueprint foi derivado principalmente dos seguintes arquivos do repositório MeAgende.Me:

- `package.json`
- `README.md`
- `src/App.tsx`
- `src/pages/Admin.tsx`
- `src/pages/SaasAdmin.tsx`
- `src/hooks/admin/useAdminData.ts`
- `src/hooks/useUserRoles.tsx`
- `src/hooks/useSaasPlanFeatures.ts`
- `src/integrations/supabase/client.ts`
- `src/lib/cashflowValidation.ts`
- `vite.config.ts`
- `tailwind.config.ts`
- `vitest.config.ts`
- `supabase/config.toml`
- `supabase/functions/_shared/admin-auth.ts`
- `docs/auditorias/auditoria-tecnica-fase-0-2026-05-18.md`
- `docs/auditorias/auditoria-seguranca-rls-rpcs-storage-2026-05-24.md`

O resultado preserva o DNA técnico do MeAgende.Me, mas converte sua evolução histórica em um ponto de partida mais enxuto, estrito e seguro para o próximo produto.
