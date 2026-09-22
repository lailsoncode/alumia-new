# Plano de desenvolvimento da Alumia

**Versão:** 1.4  
**Data:** 21 de setembro de 2026  
**Objetivo:** reconstruir a Alumia sobre o modelo técnico do blueprint SaaS do MeAgende.Me e desenvolver, no mesmo ciclo, a experiência B2C de autocuidado e a plataforma B2B de gestão de fatores de risco psicossociais relacionados ao trabalho, como apoio ao GRO/PGR da NR-1.

## 1. Decisão recomendada

A Alumia deve ser reconstruída como uma aplicação **web mobile-first e instalável (PWA)**, usando:

- TypeScript estrito;
- React + Vite;
- React Router;
- TanStack React Query;
- Supabase: PostgreSQL, Auth, Storage, RLS, RPCs e Edge Functions;
- Tailwind CSS + shadcn/ui + Radix UI;
- Hugeicons (`@hugeicons/react` + `@hugeicons/core-free-icons`) para a biblioteca de ícones;
- React Hook Form + Zod;
- Vitest + Testing Library;
- Capacitor somente depois que o MVP web estiver estável.

Essa escolha substitui o plano antigo baseado em FlutterFlow, Flutter e Firebase. Ela permite reutilizar o padrão que já amadureceu no MeAgende.Me, manter frontend e regras em TypeScript e trabalhar com banco relacional, migrations, segurança por RLS e testes automatizados.

A Alumia terá **um núcleo tecnológico e duas ofertas**:

- **Alumia B2C:** experiência privada de autocuidado, organização gentil, check-in emocional, mindfulness e hidratação;
- **Alumia Empresas:** plano pago que oferece a Alumia aos funcionários e uma plataforma multi-tenant para apoiar a gestão de fatores de risco psicossociais relacionados ao trabalho;
- **Alumia Platform:** painel master usado pela equipe da Alumia para operar clientes B2C, empresas, planos, licenças, cobrança, conteúdo e suporte.

As duas ofertas compartilham autenticação, design system, conteúdo, infraestrutura e módulos de cuidado. Dados pessoais de autocuidado permanecem separados dos registros ocupacionais. Gestores da empresa não acessam check-ins emocionais, notas pessoais, tarefas privadas ou histórico individual de bem-estar.

A Alumia Empresas não deve se apresentar como ferramenta que “garante conformidade com a NR-1”. A responsabilidade legal pelo GRO/PGR permanece com a organização, que deve designar pessoa ou equipe com conhecimento técnico adequado. O produto fornece fluxos, controles, evidências, rastreabilidade e colaboração para apoiar esse processo.

No design system, a Alumia usará inicialmente o conjunto gratuito **Stroke Rounded** da Hugeicons, coerente com a linguagem visual suave do produto. Os componentes devem importar apenas os ícones utilizados e renderizá-los por meio de um wrapper local, como `AlumiaIcon`, para centralizar tamanho, espessura, cor semântica e atributos de acessibilidade. Ícones decorativos ficam ocultos de leitores de tela; ações sem texto recebem um nome acessível. Não devem coexistir bibliotecas de ícones diferentes sem uma necessidade documentada.

## 2. Ficha do produto adaptada

| Campo | Definição para a Alumia |
|---|---|
| Nome | Alumia |
| Nicho | Autocuidado B2C e gestão de riscos psicossociais ocupacionais B2B |
| Problema central | Pessoas sofrem pressão de ferramentas punitivas; empresas precisam gerir riscos psicossociais como processo contínuo, documentado e integrado ao GRO/PGR |
| Tenant técnico | `workspace` pessoal para B2C e `organization` multi-estabelecimento para B2B |
| Entidades centrais | B2C: `care_checkins` e `tasks`; B2B: `risk_assessments`, `risk_inventory_items` e `action_plans` |
| Usuário principal | Pessoa usuária B2C ou trabalhador participante de uma avaliação |
| Usuário gestor | Profissional de SST, gestor autorizado da empresa, consultor vinculado, curador ou administrador da plataforma |
| Evento de sucesso | B2C: gesto de cuidado voluntário; B2B: ciclo de risco documentado da identificação ao acompanhamento de medidas |
| Receita inicial | Freemium B2C e assinatura/licença B2B por organização, estabelecimento e faixa de trabalhadores |
| Canais | PWA responsiva; Android/iOS via Capacitor após validação |
| Dados sensíveis | Emoções, notas pessoais, preferências de saúde, hidratação e padrões de uso |
| Regras críticas | Isolamento entre tenants, segregação B2C/B2B, confidencialidade, participação dos trabalhadores, versionamento de avaliações, rastreabilidade de ações e exportação de evidências |

## 3. Princípios de produto que viram regras técnicas

1. **Sem punição por ausência.** Não haverá streak, perda de sequência, ranking, mensagem de atraso ou estado visual de fracasso.
2. **Recomeçar deve ser barato.** Uma tarefa não concluída pode ser reagendada ou arquivada sem gerar débito emocional.
3. **Módulos são opt-in.** O usuário ativa ou desativa tarefas, check-in, mindfulness e hidratação.
4. **Notificações exigem consentimento granular.** Cada módulo tem preferência própria, janela de silêncio e desligamento simples.
5. **Dados emocionais são privados por desenho.** O cliente B2B não pode ler check-ins, notas, tarefas ou histórico individual de autocuidado.
6. **A aplicação não diagnostica.** Recomendações usam linguagem de apoio, não fazem afirmações clínicas e podem apresentar recursos de ajuda quando necessário.
7. **IA não decide o cuidado no MVP.** As sugestões iniciais são editoriais e determinísticas, fáceis de revisar, testar e explicar.
8. **Acessibilidade é requisito de entrega.** Contraste, leitor de tela, redução de movimento, tamanho de toque e linguagem clara entram na definição de pronto.
9. **Privacidade prevalece sobre métricas.** Telemetria registra eventos mínimos e técnicos, sem textos de diário, emoções específicas ou conteúdo pessoal.
10. **A NR-1 trata das condições de trabalho.** A avaliação B2B identifica perigos e riscos relacionados à organização e à execução do trabalho; não realiza diagnóstico clínico individual.
11. **Questionário é insumo, não entrega final.** Seus resultados precisam ser analisados tecnicamente e integrados à AEP e/ou ao inventário, ao plano de ação e ao acompanhamento.
12. **Participação precisa deixar evidência.** Consultas, escutas, comunicação, acompanhamento e contribuições dos trabalhadores devem ser registráveis sem quebrar anonimato e confidencialidade.

## 4. Escopo dos MVPs

### Núcleo compartilhado

- página institucional curta e páginas legais;
- cadastro, login, recuperação de senha e exclusão/exportação de conta;
- autenticação, papéis, feature gates, auditoria e multi-tenancy;
- design system acessível e responsivo;
- curadoria de conteúdo e notificações;
- painel master para administrar B2C, empresas, planos, licenças e suporte;
- observabilidade, backups, privacidade e suporte;
- PWA instalável.

### Alumia B2C

- onboarding com escolha dos módulos e preferências de acessibilidade;
- início personalizado com os módulos ativos;
- check-in emocional com emoção, necessidade e sugestão acolhedora;
- tarefas únicas e recorrentes, com conclusão e reagendamento gentil;
- biblioteca de práticas de mindfulness em texto e áudio;
- registro rápido de hidratação e preferência de lembretes;
- preferências de notificações e horário de silêncio;
- histórico privado, limitado e paginado por módulo;
- acessibilidade e responsividade validadas nos fluxos principais.

### Alumia Empresas — NR-1

- organizações com múltiplos estabelecimentos, setores, funções e unidades de avaliação;
- papéis de administrador da organização, responsável técnico/SST, gestor de plano de ação, consultor e visualizador;
- onboarding organizacional e definição dos responsáveis pelo processo;
- preparação do ciclo, escopo, metodologia, critérios, versões e anexos;
- registro de observações das condições de trabalho, entrevistas, reuniões e outras evidências;
- campanhas de escuta ou questionários configuráveis, com anonimato e corte mínimo de agregação;
- identificação de perigos e fatores de risco psicossociais relacionados ao trabalho;
- matriz configurável de probabilidade, severidade, nível de risco e critério de decisão;
- inventário de riscos com versionamento e trilha de auditoria;
- plano de ação com medida, prioridade, responsável, prazo, status e evidência de implementação;
- acompanhamento de eficácia e reavaliação;
- registro da participação e comunicação aos trabalhadores;
- dashboard por estabelecimento e unidade de avaliação, somente com dados agregados autorizados;
- exportação de dossiê técnico para subsidiar AEP, inventário e plano de ação;
- alertas de prazo e revisão, sem afirmar que o documento substitui análise profissional.

### Fora do MVP

- comunidade, fórum e espaço de desabafo;
- Alum.IA e recomendações generativas;
- equipes, fitness, estudante e ciclo menstrual;
- white label completo;
- marketplace de temas e doações B2C;
- pontuação, XP, badges ou streaks;
- integração com wearables;
- aplicativo nativo separado.

No B2B também ficam fora do primeiro ciclo: diagnóstico clínico, emissão automática de laudo, assinatura por responsável técnico dentro da plataforma, integração com eSocial, SSO corporativo, canal de denúncia, gestão de casos médicos, prontuário, absenteísmo individual e recomendação automática baseada em IA.

Esses cortes evitam confundir autocuidado, saúde clínica e gestão ocupacional, além de reduzir riscos de privacidade e promessas regulatórias inadequadas.

## 5. Superfícies e rotas

| Superfície | Rotas | Acesso | Responsabilidade |
|---|---|---|---|
| Institucional | `/`, `/manifesto`, `/privacidade`, `/termos`, `/ajuda` | Público | Apresentação, confiança e suporte |
| Autenticação | `/entrar`, `/criar-conta`, `/recuperar-senha` | Público | Acesso à conta |
| Experiência Alumia | `/app`, `/app/check-in`, `/app/tarefas`, `/app/mindfulness`, `/app/hidratacao` | Autenticado | Jornada pessoal de cuidado |
| Preferências | `/app/preferencias`, `/app/privacidade` | Autenticado | Módulos, acessibilidade, notificações e dados |
| Participação B2B | `/participar/:token` | Trabalhador convidado | Escuta, questionário, consulta e comunicação do processo |
| Alumia Empresas | `/empresa/:organizationSlug` | Membro autorizado | Visão geral da organização e seleção de estabelecimento |
| Gestão de riscos | `/empresa/:organizationSlug/riscos` | SST/gestor autorizado | Ciclos, unidades de avaliação, inventário e evidências |
| Planos de ação | `/empresa/:organizationSlug/acoes` | SST/gestor responsável | Medidas, responsáveis, prazos e eficácia |
| Relatórios | `/empresa/:organizationSlug/relatorios` | Papel autorizado | Indicadores agregados e exportação de dossiê |
| Curadoria | `/curadoria` | Papel `content_curator` ou `platform_admin` | Conteúdo editorial e publicação |
| Plataforma | `/platform-admin` | `platform_admin` | Operação central de B2C, empresas, comercial, conteúdo, suporte e segurança |

A área B2B é uma superfície separada dentro da mesma aplicação. Ela pode usar componentes compartilhados, mas possui navegação, permissões e contratos de dados próprios. A participação por link ou token expõe apenas a campanha correspondente e nunca concede acesso ao tenant.

### Painel master da Alumia

O painel master deve funcionar como console operacional do SaaS, com as seguintes áreas:

| Área | Capacidades |
|---|---|
| Visão geral | usuários ativos, empresas, licenças, conversões, receita, falhas e alertas operacionais |
| Clientes B2C | conta, plano, status, dispositivos, consentimentos, solicitações de privacidade e histórico de suporte |
| Empresas | tenant, CNPJ e dados contratuais, estabelecimentos, administradores, plano, vigência e situação operacional |
| Licenças | assentos contratados, convites, vínculos ativos, ocupação, expiração e concessões manuais auditadas |
| Planos e features | Freemium, PRO e Empresas; preços, limites, módulos e feature flags versionados |
| Assinaturas e cobrança | assinaturas pessoais e empresariais, invoices, pagamentos, inadimplência, período de graça e webhooks |
| Conteúdo | emoções, necessidades, sugestões, práticas, textos, notificações e versões publicadas |
| NR-1 | versões da metodologia, instrumentos, catálogos de fatores e templates de exportação |
| Suporte | busca por conta, reenvio de convite, revogação de sessões e ações de recuperação permitidas |
| Privacidade e segurança | pedidos de exportação/exclusão, incidentes, auditoria, acessos privilegiados e retenção |
| Sistema | saúde dos serviços, jobs, Edge Functions, integrações, uso e limites de infraestrutura |

O master admin não recebe uma permissão genérica para ler dados pessoais. Ações de suporte privilegiado exigem motivo, prazo, escopo mínimo e audit log. Check-ins, notas, tarefas e respostas individuais de trabalhadores permanecem inacessíveis ao painel master em fluxos normais.

### Papéis e fronteiras

| Papel | Escopo |
|---|---|
| `platform_admin` | operação global, tenants, planos, cobrança, segurança e suporte controlado |
| `content_curator` | conteúdo de autocuidado e notificações, sem acesso a usuários individuais |
| `billing_operator` | assinaturas, invoices e pagamentos, sem acesso a dados de cuidado ou avaliações |
| `support_agent` | metadados mínimos de conta e ações de suporte permitidas |
| `organization_admin` | contrato, membros, licenças e configurações da própria empresa |
| `sst_responsible` | ciclos, metodologia, inventário, plano de ação e relatórios da empresa |
| `action_owner` | consulta e atualização apenas das ações sob sua responsabilidade |
| `organization_viewer` | leitura dos relatórios e documentos autorizados |
| `beneficiary` | recebe o benefício corporativo e mantém a experiência pessoal privada |

Autorização por papel e liberação por plano são verificações diferentes. A interface verifica ambas; RLS e RPCs validam a autorização; o resolvedor de entitlements valida o plano ou a licença.

## 6. Arquitetura proposta

```text
Páginas e rotas
    ↓
Componentes de módulo e componentes de UI
    ↓
Hooks de consulta, mutação e orquestração
    ↓
Cliente Supabase, RPCs e Edge Functions
    ↓
PostgreSQL + RLS + Storage + jobs
```

Estrutura inicial:

```text
alumia/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   ├── auth/
│   │   ├── onboarding/
│   │   ├── check-in/
│   │   ├── tasks/
│   │   ├── mindfulness/
│   │   ├── hydration/
│   │   ├── companies/
│   │   │   ├── assessments/
│   │   │   ├── risks/
│   │   │   ├── action-plans/
│   │   │   ├── participation/
│   │   │   └── reports/
│   │   ├── platform-admin/
│   │   │   ├── customers/
│   │   │   ├── organizations/
│   │   │   ├── billing/
│   │   │   ├── content/
│   │   │   ├── support/
│   │   │   └── security/
│   │   ├── settings/
│   │   └── admin/
│   ├── contexts/
│   ├── hooks/
│   ├── integrations/supabase/
│   ├── lib/domain/
│   ├── pages/
│   ├── test/
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── functions/
│   ├── migrations/
│   ├── seed.sql
│   └── config.toml
├── docs/
│   ├── architecture.md
│   ├── domain.md
│   ├── privacy.md
│   ├── content-safety.md
│   └── runbook.md
└── package.json
```

As features devem ser implementadas como verticais completas:

```text
regra de produto → migration/RLS → tipos → regra de domínio → hook → interface → testes → telemetria
```

## 7. Modelo de dados inicial

### Identidade, espaços pessoais e organizações

- `profiles`: nome de exibição, avatar e metadados não sensíveis;
- `workspaces`: espaço pessoal da experiência B2C;
- `workspace_members`: vínculo do usuário com o espaço pessoal;
- `organizations`: empresa contratante;
- `organization_establishments`: estabelecimentos abrangidos pelo GRO/PGR;
- `organization_members`: usuários, papéis e escopos de acesso;
- `organization_invites`: convites idempotentes e expiráveis;
- `organization_beneficiaries`: vínculo que concede o benefício do aplicativo ao funcionário, sem transferir propriedade de seus dados pessoais;
- `organization_settings`: metodologia, privacidade, branding básico e retenção;
- `user_preferences`: idioma, fuso, acessibilidade e horário de silêncio;
- `user_modules`: módulos ativos e ordem escolhida;
- `user_consents`: versão dos termos e consentimentos concedidos ou revogados.

Cada pessoa mantém seu `workspace` pessoal. A participação em uma organização ocorre por `organization_members` ou token específico de campanha; isso não torna a organização proprietária do espaço pessoal.

Um funcionário pode usar a Alumia antes, durante e depois do vínculo empresarial. Enquanto a licença da empresa estiver ativa, um resolvedor de entitlements combina o plano pessoal e o benefício corporativo. Quando o vínculo termina, os recursos pagos são recalculados, mas a conta e os dados pessoais continuam com o usuário.

### Check-in emocional

- `emotions`: catálogo editorial;
- `needs`: catálogo editorial;
- `care_checkins`: emoção, necessidade, intensidade opcional e nota opcional;
- `care_suggestions`: conteúdo editorial versionado;
- `suggestion_rules`: associação revisável entre emoção, necessidade e sugestões;
- `checkin_suggestions`: snapshot do conteúdo mostrado ao usuário.

O texto livre deve ser opcional. A RLS exige que `user_id = auth.uid()`. Nem membros de organização nem curadores podem ler o histórico individual.

### NR-1 e riscos psicossociais

- `assessment_cycles`: ciclo, escopo, metodologia, responsáveis, critérios, estado e versão;
- `assessment_units`: estabelecimento, setor, função, atividade, posto ou grupo similar de exposição;
- `psychosocial_factors`: catálogo versionado de fatores e perigos;
- `assessment_methods`: métodos adotados, justificativa técnica e documentos anexos;
- `worker_consultations`: sessões de escuta, reuniões, entrevistas e evidências de participação;
- `survey_templates`: instrumentos versionados e aprovados para uso;
- `survey_campaigns`: público, período, regras de anonimato e estado;
- `survey_responses`: respostas protegidas e separadas da camada analítica;
- `assessment_findings`: achados tecnicamente consolidados por unidade de avaliação;
- `risk_inventory_items`: perigo, exposição, possíveis lesões/agravos, controles existentes, probabilidade, severidade e classificação;
- `action_plans`: plano associado a ciclo ou item de risco;
- `action_items`: medida, hierarquia de prevenção, responsável, prazo, estado e prioridade;
- `action_evidence`: documentos e registros de implementação;
- `effectiveness_reviews`: resultado, método, data e necessidade de nova ação;
- `worker_communications`: comunicação de riscos e medidas aos trabalhadores;
- `assessment_exports`: snapshot e hash dos dossiês exportados.

Respostas brutas ficam em uma área de acesso restrito. Dashboards consultam views ou funções agregadoras que aplicam limiar mínimo configurável e suprimem cortes capazes de reidentificar pessoas. O MVP não cruza resposta ocupacional com check-in B2C.

### Tarefas

- `tasks`: título, descrição opcional, estado, data/hora e origem;
- `task_recurrence_rules`: frequência, dias e fuso;
- `task_occurrences`: ocorrências materializadas quando necessário;
- `task_events`: conclusão, reagendamento e arquivamento para auditoria do comportamento da feature.

A regra de recorrência fica em `src/lib/domain/tasks` e é replicada ou protegida no servidor. Tarefas vencidas não recebem estado de “falha”.

### Mindfulness

- `mindfulness_practices`: título, descrição, duração, mídia, estado editorial e acessibilidade;
- `mindfulness_sessions`: início, conclusão opcional e prática utilizada.

Áudios ficam em bucket privado ou público controlado conforme licença. O MVP não exige marcar uma prática como concluída.

### Hidratação

- `hydration_preferences`: unidade, recipiente padrão e lembretes;
- `hydration_entries`: quantidade e momento do registro.

Qualquer recomendação de volume deve ser apresentada como referência configurável, não prescrição médica.

### Operação

- `push_subscriptions`: endpoint e chaves do dispositivo;
- `notification_preferences`: consentimento por módulo;
- `notification_deliveries`: status técnico, sem conteúdo sensível desnecessário;
- `feature_flags`: liberação gradual;
- `audit_logs`: apenas ações administrativas relevantes;
- `privacy_requests`: exportação e exclusão.
- `plans`, `plan_features`, `subscriptions` e `organization_entitlements`: licenciamento B2B e limites contratados;
- `billing_accounts`: titular da cobrança, pessoal ou empresarial;
- `subscription_items`: plano, quantidade de assentos e adicionais contratados;
- `invoices`, `payments` e `webhook_events`: cobrança e processamento idempotente;
- `license_allocations`: concessão, origem, vigência e revogação de benefícios;
- `support_cases` e `privileged_access_grants`: atendimento e acessos excepcionais auditados;
- `evidence_files`: metadados de arquivos, classificação, retenção e acesso;
- `methodology_versions`: versão publicada da metodologia usada em cada ciclo.

Cobrança automatizada pode ser adiada para o piloto, mas planos e entitlements entram no modelo inicial para evitar permissões comerciais espalhadas pela interface.

## 8. Segurança e privacidade

- RLS habilitada em todas as tabelas com dados do usuário;
- políticas de leitura e escrita baseadas em `auth.uid()` e, quando aplicável, no vínculo com `workspace`;
- toda tabela B2B inclui `organization_id`, índice e RLS; registros vinculados a estabelecimento também validam o escopo do membro;
- registros emocionais exigem propriedade individual além da associação ao workspace;
- papéis B2B separam administração, responsabilidade técnica, execução de ações, consulta e relatórios;
- respostas individuais de campanhas não aparecem em consultas comuns de gestores;
- relatórios agregados suprimem grupos abaixo do limiar de anonimato definido para o projeto;
- exportações registram versão, autor, data, filtros e hash para rastreabilidade;
- alterações no inventário, critérios e plano de ação geram histórico imutável de auditoria;
- `service_role` somente em funções server-side;
- Edge Functions autenticadas por padrão;
- exportação e exclusão de dados implementadas antes do beta público;
- logs não armazenam emoção, necessidade, nota pessoal, texto de tarefa ou conteúdo de diário;
- mídia enviada pelo usuário, se adicionada futuramente, usa bucket privado e URLs temporárias;
- staging e produção usam projetos Supabase separados;
- migrations são incrementais e nunca reescritas após aplicação;
- testes automatizados provam que um usuário não acessa os dados de outro;
- ações administrativas sensíveis ficam registradas em audit log.

Antes do lançamento, os documentos de privacidade devem dizer de forma direta quais dados são guardados, por quê, por quanto tempo e como apagá-los.

No B2B, o contrato e a configuração de cada implantação devem definir papéis de tratamento, finalidade, base legal, retenção, atendimento aos direitos dos titulares, resposta a incidentes e regras de compartilhamento. Essa definição precisa de revisão jurídica e de privacidade própria para o cliente e não pode ser inferida pelo software.

## 9. Estratégia de notificações

Notificações entram depois que os módulos funcionarem sem elas. O fluxo será:

1. o usuário ativa explicitamente um tipo de lembrete;
2. o aplicativo registra preferência, fuso e horário de silêncio;
3. um job seleciona apenas os lembretes elegíveis;
4. uma Edge Function envia a mensagem por provedor de push;
5. a entrega é registrada de modo idempotente;
6. ignorar a notificação não altera pontuação nem cria consequência negativa.

Mensagens ficam em catálogo editorial versionado. Personalização por estado emocional não entra no MVP para evitar exposição de dado sensível no push e interpretações inadequadas.

## 10. Posicionamento da Alumia Empresas diante da NR-1

A nova redação do capítulo 1.5 da NR-1 está em vigor desde **26 de maio de 2026** e inclui expressamente os fatores de risco psicossociais relacionados ao trabalho no GRO. Para orientar o produto, ficam estabelecidos estes limites:

### O que a plataforma apoia

- planejamento do processo e definição de unidades de avaliação;
- registro da metodologia e dos critérios adotados;
- instrumentos complementares de escuta e participação;
- consolidação técnica de achados por profissional autorizado;
- inventário de riscos e plano de ação versionados;
- responsáveis, prazos, acompanhamento e revisão da eficácia;
- comunicação aos trabalhadores e evidências de participação;
- organização de documentos e exportação de dossiê auditável;
- gestão contínua por estabelecimento.

### O que a plataforma não pode prometer

- substituir AEP, inventário de riscos ou PGR por um questionário;
- diagnosticar saúde mental ou realizar avaliação clínica individual;
- escolher automaticamente a metodologia adequada a qualquer empresa;
- assinar ou assumir responsabilidade técnica pelo processo;
- garantir conformidade ou ausência de autuação;
- transformar indicadores de uso do app B2C em avaliação ocupacional;
- permitir vigilância individual de trabalhadores.

O fluxo B2B deve refletir o ciclo real:

```text
Preparar escopo e responsáveis
        ↓
Identificar perigos nas condições e na organização do trabalho
        ↓
Ouvir trabalhadores e reunir evidências por métodos adequados
        ↓
Avaliar e classificar riscos com critérios documentados
        ↓
Integrar à AEP e/ou ao inventário do PGR
        ↓
Definir e implementar medidas de prevenção
        ↓
Acompanhar eficácia, comunicar e revisar
```

## 11. Plano de execução conjunto em 18 semanas

O cronograma considera uma pessoa desenvolvedora principal, apoio de UX e participação contínua de um profissional com conhecimento técnico em SST/ergonomia. Com equipe maior, as trilhas B2C e B2B podem avançar em paralelo depois da fundação. Sem apoio técnico de SST, a plataforma pode ser construída, mas a metodologia e os instrumentos B2B não devem ser publicados como prontos para uso.

### Fase 0 — Descoberta, metodologia e inventário, semanas 1 e 2

- localizar e auditar protótipos, repositórios, telas, conteúdos e assets;
- entrevistar usuários B2C e profissionais de SST/ergonomia;
- mapear o processo atual de AEP, inventário, plano de ação e evidências em empresas piloto;
- definir fatores, unidades de avaliação, critérios e métodos que o produto deve suportar;
- registrar limites entre autocuidado, avaliação ocupacional e atendimento clínico;
- escrever `domain.md`, `nr1-methodology.md`, `privacy.md` e ADRs principais;
- obter revisão técnica da metodologia B2B antes da implementação dos instrumentos.

**Saída:** escopo aprovado das duas ofertas, metodologia B2B revisada e backlog priorizado.

### Fase 1 — Fundação compartilhada, semanas 3 e 4

- criar Vite + React + TypeScript estrito;
- instalar Router, React Query, Tailwind, shadcn, Zod e testes;
- instalar Hugeicons, criar `AlumiaIcon` e definir usos semânticos;
- configurar design tokens, providers, error boundary, rotas lazy e acessibilidade;
- criar Supabase local e staging, CI e ambientes;
- implementar Auth, profiles, workspaces, organizations, memberships e papéis;
- configurar audit log, feature gates, armazenamento e testes-base de RLS.

**Saída:** shell multi-tenant seguro, disponível em staging.

### Fase 2 — Alumia B2C essencial, semanas 5 a 7

- onboarding, módulos opt-in e preferências de acessibilidade;
- check-in emocional privado com sugestões editoriais;
- tarefas gentis únicas e recorrentes;
- histórico paginado e exclusão/exportação de dados;
- testes de regras, componentes, jornadas e isolamento;
- primeira rodada de testes com 5 a 8 pessoas.

**Saída:** vertical B2C utilizável e validada em staging.

### Fase 3 — Estrutura organizacional e ciclo NR-1, semanas 8 e 9

- organizações, estabelecimentos, setores, funções e unidades de avaliação;
- papéis e escopos de acesso B2B;
- ciclo de avaliação, responsáveis, metodologia, critérios e versionamento;
- catálogos de fatores psicossociais e fontes de evidência;
- anexos com acesso privado e retenção configurável;
- testes de isolamento entre organizações e estabelecimentos.

**Saída:** profissional autorizado configura um ciclo real sem usar planilhas paralelas para a estrutura básica.

### Fase 4 — Escuta e participação dos trabalhadores, semanas 10 e 11

- campanhas e tokens expiráveis;
- questionários versionados como método complementar;
- registro de entrevistas, observações, reuniões e consultas;
- consentimento, comunicação de finalidade e canal de suporte;
- agregação com limiar mínimo e supressão de grupos pequenos;
- registro de participação sem expor identidade desnecessariamente;
- validação com um grupo controlado da empresa piloto.

**Saída:** coleta multimetodológica com confidencialidade e rastreabilidade.

### Fase 5 — Inventário e plano de ação, semanas 12 e 13

- consolidação técnica de achados por unidade de avaliação;
- matriz configurável e classificação de risco;
- inventário versionado;
- medidas de prevenção, responsáveis, prazos e estados;
- anexos e evidências de implementação;
- revisão de eficácia e abertura de ação adicional;
- comunicação de riscos e medidas aos trabalhadores;
- exportação de dossiê com snapshots e histórico.

**Saída:** ciclo B2B completo da identificação ao acompanhamento.

### Fase 6 — Painel master e operação comercial, semanas 14 e 15

- dashboard global e áreas de clientes B2C e empresas;
- planos Freemium, PRO e Empresas;
- assinaturas pessoais e empresariais, assentos, licenças e entitlements;
- gestão de invoices, webhooks e inadimplência;
- curadoria, versões de metodologia NR-1 e feature flags;
- suporte com ações mínimas e auditadas;
- solicitações de privacidade, auditoria e alertas operacionais;
- documentação operacional, privacidade e resposta a incidentes.

**Saída:** equipe da Alumia consegue provisionar, cobrar, apoiar e auditar clientes sem acesso indevido a dados privados.

### Fase 7 — Completar a experiência B2C, semana 16

- mindfulness e hidratação;
- PWA, notificações e horário de silêncio;
- integração dos benefícios da empresa ao plano pessoal;
- fluxo de entrada e saída da empresa sem perda dos dados pessoais;
- exportação e exclusão de dados.

**Saída:** B2C completo e benefício empresarial integrado na mesma conta.

### Fase 8 — Pilotos e endurecimento, semanas 17 e 18

- beta B2C com 20 a 40 participantes;
- piloto B2B com uma empresa, um estabelecimento e unidades de avaliação reais;
- revisão da metodologia e das exportações pelo responsável técnico do piloto;
- testes de RLS, anonimato, auditoria, rate limiting e recuperação;
- correção de bugs P0/P1 e problemas de acessibilidade;
- smoke test de produção, runbook, suporte, rollback e backup restaurável;
- decisão de lançamento separada para B2C e B2B.

**Saída:** MVP B2C liberável gradualmente e MVP B2B pronto para implantação acompanhada.

## 12. Backlog priorizado

### P0 — Fundação compartilhada

- autenticação, workspace pessoal e organizações;
- papéis, entitlements, RLS e testes de isolamento;
- auditoria, privacidade e armazenamento protegido;
- design system, acessibilidade e observabilidade;
- matriz de acesso que separe completamente B2C e B2B;
- painel master com gestão de clientes, empresas, planos, licenças e suporte.

### P0 — Alumia B2C

- onboarding e módulos opt-in;
- check-in emocional e sugestões editoriais;
- tarefas únicas e recorrentes;
- mindfulness e hidratação;
- preferências e acessibilidade;
- exportação e exclusão de dados;
- monitoramento de erros;
- PWA e páginas legais.

### P0 — Alumia Empresas

- estabelecimentos, setores, funções e unidades de avaliação;
- ciclos, metodologia, critérios e responsáveis;
- registro de observação, entrevistas, reuniões e documentos;
- campanhas de escuta com confidencialidade;
- consolidação de achados e matriz de riscos;
- inventário versionado e plano de ação;
- evidências de implementação e avaliação de eficácia;
- participação e comunicação aos trabalhadores;
- relatórios agregados e dossiê exportável;
- concessão e revogação de benefícios aos funcionários;
- contagem de assentos e entitlements por contrato;
- revisão técnica da metodologia e dos instrumentos.

### P1 — Pilotos e lançamento gradual

- push notifications;
- curadoria de conteúdo mais completa;
- feature flags;
- cobrança B2B e gestão contratual;
- templates de metodologia e relatórios;
- melhorias de offline para conteúdo editorial;
- recuperação de sessão e tratamento de falhas de rede.

### P2 — Depois da validação

- assinatura e doações;
- temas e personalização visual;
- Capacitor e publicação nas lojas;
- Alum.IA com avaliação de segurança;
- SSO, SCIM e integrações corporativas;
- integração com eSocial ou sistemas de SST após análise específica;
- white label avançado;
- comunidade com política e operação de moderação;
- novos módulos.

## 13. Critérios de aceitação

### Alumia B2C

- uma pessoa cria a conta e conclui o onboarding sem assistência;
- todos os módulos podem ser ativados e desativados;
- o check-in nunca expõe dados a outro usuário ou papel administrativo;
- tarefas recorrentes funcionam corretamente no fuso do usuário;
- nenhum fluxo usa culpa, streak, ranking ou perda de progresso;
- mindfulness funciona com teclado e leitor de tela;
- hidratação aceita unidade e recipiente configuráveis;
- notificações só são enviadas após consentimento e respeitam silêncio;
- exportação e exclusão funcionam ponta a ponta;
- a aplicação é instalável como PWA;
- lint, typecheck, testes e build passam no CI;
- testes de RLS cobrem leitura, criação, alteração e exclusão entre usuários;
- não há segredo no bundle nem dados sensíveis nos logs;
- bugs críticos e altos do beta estão resolvidos;
- ao menos 70% dos participantes do beta concluem o fluxo principal sem ajuda;
- a avaliação qualitativa não identifica linguagem de cobrança como problema recorrente.

### Alumia Empresas

- uma organização configura estabelecimento, unidades de avaliação, responsáveis e critérios;
- o sistema suporta mais de um método de identificação e avaliação, sem depender apenas de questionário;
- o responsável técnico consolida achados e produz inventário e plano de ação coerentes;
- ações possuem responsáveis, prazos, evidências, acompanhamento e revisão de eficácia;
- a participação dos trabalhadores pode ser demonstrada por registros auditáveis;
- respostas individuais não ficam visíveis para gestores comuns;
- grupos abaixo do limiar definido são suprimidos nos relatórios;
- nenhum usuário acessa outra organização, estabelecimento ou escopo sem autorização;
- o dossiê exportado registra metodologia, critérios, versões, responsáveis e histórico;
- o produto não apresenta diagnóstico clínico nem selo automático de conformidade;
- o profissional responsável pelo piloto aprova a utilidade e a fidelidade do fluxo;
- restauração de backup, auditoria e resposta a incidente são testadas;
- lint, typecheck, testes de unidade, testes de RLS e build passam no CI.

### Painel master

- master admin localiza e administra contas B2C e empresas por metadados autorizados;
- planos e features podem ser versionados sem alterar código de autorização;
- uma empresa recebe assentos, convida funcionários e acompanha ocupação de licenças;
- o funcionário recebe benefícios pagos na mesma conta pessoal;
- o desligamento revoga o benefício corporativo e preserva os dados pessoais;
- assinaturas, pagamentos e webhooks são idempotentes e conciliáveis;
- funções de suporte não exibem conteúdo de autocuidado nem respostas individuais;
- todo acesso privilegiado registra operador, motivo, escopo, tempo e resultado;
- papéis de cobrança, conteúdo, suporte e segurança respeitam menor privilégio;
- o painel mostra falhas operacionais sem expor payloads sensíveis.

## 14. Métricas para validar os produtos

### B2C

As métricas devem responder se a Alumia ajuda sem pressionar:

- ativação: porcentagem que conclui onboarding e primeiro gesto de cuidado;
- valor inicial: porcentagem que conclui check-in ou outra ação no primeiro acesso;
- retorno voluntário em 7 e 30 dias;
- módulos ativados e desativados, de forma agregada;
- taxa de conclusão dos fluxos e erros técnicos;
- notificações ativadas, silenciadas e desativadas;
- percepção qualitativa de acolhimento, autonomia e carga sensorial;
- quantidade de pedidos de exportação/exclusão e tempo de atendimento.

Não registrar em analytics qual emoção foi escolhida, conteúdo de notas, títulos de tarefas ou detalhes de saúde.

### B2B

- tempo para configurar o primeiro ciclo e as unidades de avaliação;
- adesão à escuta por unidade, exibida apenas quando preservar anonimato;
- porcentagem de unidades com evidências suficientes para análise técnica;
- riscos com medida definida, responsável e prazo;
- ações no prazo, atrasadas e com eficácia revisada;
- participação documentada dos trabalhadores;
- tempo para produzir e revisar o dossiê;
- quantidade de correções manuais fora da plataforma;
- satisfação do responsável técnico e dos participantes;
- incidentes de permissão, privacidade ou tentativa de reidentificação.

### Plataforma

- clientes B2C por plano e estado da assinatura;
- empresas ativas, em implantação, suspensas e canceladas;
- assentos contratados, alocados e disponíveis;
- conversão de Freemium para PRO e ativação por benefício empresarial;
- MRR B2C, MRR B2B, inadimplência e receita por plano;
- tempo de implantação de empresa e tempo de primeira licença ativa;
- volume e tempo de resolução de suporte e privacidade;
- falhas de webhook, jobs, notificações e exportações.

Métricas B2B de produto não devem virar pontuação de saúde mental, ranking de setores ou avaliação individual de desempenho.

## 15. Leitura do pitch deck atual

O pitch do Canva confirma algumas decisões anteriores e traz hipóteses a revisar:

- posiciona a Alumia em B2C e B2B;
- apresenta Freemium gratuito, Alumia PRO a **R$ 14,90/mês** e Empresas a partir de **R$ 2.500**;
- associa Empresas a módulos próprios, personalização e suporte dedicado;
- apresenta a adequação à NR-1 como oportunidade de mercado;
- registra duas empresas validando a solução;
- cita 150 usuários em testes e resultados;
- mostra oito módulos, embora o MVP técnico permaneça concentrado nos quatro módulos essenciais.

Preços, número de empresas e número de usuários são registros do momento em que o deck foi criado. Antes de entrarem em telas, projeções ou contratos, precisam ser confirmados. A proposta empresarial também deve ser atualizada: além de personalização e módulos, o plano pago passa a incluir licenciamento do aplicativo para funcionários e o fluxo documentado de gestão de riscos psicossociais.

## 16. Estratégia para os protótipos existentes

O primeiro protótipo FlutterFlow foi inspecionado no editor, na visualização do código gerado e em uma sessão autenticada da versão executável. A auditoria completa está em [Auditoria do protótipo FlutterFlow](../research/auditoria-prototipo-flutterflow-alumia.md).

O projeto contém 20 páginas e demonstra uma experiência B2C com onboarding, autenticação, home, tarefas, check-in emocional, mindfulness, hidratação, estudos, comunidade, perfil, insígnias e Alum.IA. O código gerado confirma Firebase Auth, backend/Firebase, Firebase Storage, API calls, Analytics e FlutterFlow AI Agents; a interface da Alum.IA identifica Gemini.

A conclusão é usar esse projeto como **referência funcional e fonte de conteúdo**, sem portar o código gerado. A voz da marca, os fluxos B2C, os catálogos editoriais e os assets licenciados têm valor. Autenticação, banco, regras, navegação, analytics, IA e notificações serão reimplementados na arquitetura React/Supabase.

A área B2B não está implementada. A página `teams` repete o conteúdo da área de estudos e não possui organizações, colaboradores, convites, licenças, papéis, indicadores ou NR-1. O painel master também não existe. Essas duas superfícies são desenvolvimento novo.

Os demais protótipos, quando encontrados, devem passar pela mesma auditoria curta:

| Dimensão | Pergunta | Possível resultado |
|---|---|---|
| Produto | O fluxo representa a Alumia atual? | preservar, redesenhar ou remover |
| Visual | Tokens, ícones e componentes são reutilizáveis? | extrair design system ou usar apenas como referência |
| Código | Está na stack escolhida e possui contratos claros? | portar componente, reescrever ou descartar |
| Dados | Há schema ou conteúdo que precisa migrar? | script de importação ou seed editorial |
| Legal | Assets, fontes e áudios têm licença comprovada? | reutilizar ou substituir |
| Segurança | Existem chaves, dados reais ou regras abertas? | revogar, limpar e não migrar |

Antes da migração, ainda é necessário exportar ou documentar o schema do Firestore, regras de segurança, índices, funções, integrações e volume de dados. Nenhum dado pessoal deve ser copiado para desenvolvimento sem inventário, necessidade definida e proteção adequada.

Foram observados problemas que devem virar critérios da reconstrução: botões de navegação sem nome acessível, cards não expostos como controles, inconsistência de rota ao trocar áreas pela navegação inferior, contraste suave, erros editoriais e falta de limites visíveis para IA e comunidade. O check-in menciona BRUMS e PANAS e precisa de revisão metodológica antes de ser apresentado como instrumento validado.

## 17. Decisões que devem permanecer registradas

- **ADR-001 — React/Vite/Supabase:** motivo da troca de FlutterFlow/Firebase;
- **ADR-002 — workspaces e organizations separados:** o espaço B2C não pertence ao tenant B2B;
- **ADR-003 — propriedade de dados sensíveis:** registros pessoais de autocuidado nunca são expostos à empresa;
- **ADR-004 — recomendações editoriais:** IA adiada até existir avaliação específica;
- **ADR-005 — PWA antes de Capacitor:** validar o produto antes de manter pipelines de lojas;
- **ADR-006 — ausência de gamificação punitiva:** XP e streaks não entram sem evidência de compatibilidade com a proposta;
- **ADR-007 — comunidade adiada:** depende de política, moderação, resposta a crise e operação contínua.
- **ADR-008 — Alumia como apoio à NR-1:** o software organiza o processo, mas não substitui responsabilidade ou competência técnica;
- **ADR-009 — instrumentos múltiplos:** questionários são complementares a observação, análise do trabalho, entrevistas e participação;
- **ADR-010 — anonimato B2B:** agregação com limiar mínimo e bloqueio de cortes reidentificáveis;
- **ADR-011 — versionamento regulatório:** metodologia, critérios, instrumentos e exports permanecem ligados à versão usada no ciclo.
- **ADR-012 — entitlement combinado:** o acesso efetivo resulta do plano pessoal e das licenças empresariais ativas;
- **ADR-013 — painel master com menor privilégio:** operação global sem leitura rotineira de dados sensíveis;
- **ADR-014 — continuidade da conta:** saída de uma empresa não apaga nem transfere o workspace pessoal.

## 18. Próximo passo executável

Este plano foi materializado no [pacote de Spec-Driven Development](../sdd/README.md). A constituição, as especificações de produto, arquitetura, dados, B2C, B2B e painel master passam a orientar a implementação. O incremento [INC-001 — Fundação e check-in privado](../sdd/increments/001-foundation-and-private-checkin.md) contém contratos, migrations, tarefas, testes e Definition of Done para o início do código.

O primeiro ciclo de trabalho deve produzir, nesta ordem:

1. revisar a constituição e aprovar o escopo do `INC-001`;
2. criar o repositório base, CI, Supabase local e ambiente de staging;
3. entregar autenticação, workspace e check-in privado conforme a primeira spec;
4. exportar tecnicamente FlutterFlow/Firebase e inventariar os demais assets;
5. entrevistar ao menos dois profissionais de SST/ergonomia e uma empresa piloto;
6. revisar e aprovar metodologia, instrumentos e limiar de anonimato B2B;
7. confirmar preços, empresas em validação e resultados citados no pitch;
8. detalhar o próximo incremento antes de alterar contratos compartilhados;
9. avançar pelas verticais definidas no [plano de entregas](../sdd/delivery-plan.md).

O primeiro marco técnico será alcançado quando a mesma base entregar duas verticais seguras: uma pessoa realiza um check-in privado no B2C, e um profissional autorizado configura um ciclo de avaliação B2B sem qualquer acesso ao dado pessoal de autocuidado.

## Fontes de contexto

- [Blueprint SaaS multi-tenant](../reference/blueprint-saas-multitenant-replicavel.md).
- Documento “Alumia — Ideação V2”, Google Drive.
- Documento “Plano de Execução de Desenvolvimento — Alumia”, Google Drive.
- Documento “Manifesto Alumia: O Cuidado é um Gesto Livre”, Google Drive.
- Pitch deck “Alumia - DLJ”, Canva: `https://canva.link/kjj0k743qytkjxj`.
- Protótipo FlutterFlow “Alumia” (`alumia-t108bs`), inspecionado em 21 de setembro de 2026.
- [Pacote de especificações SDD](../sdd/README.md), versão 0.1.0.
- Norma Regulamentadora nº 1 e materiais oficiais do Ministério do Trabalho e Emprego.
- Perguntas e Respostas sobre o Capítulo 1.5 da NR-1 — MTE, maio de 2026.
- Guia de informações sobre Fatores de Riscos Psicossociais Relacionados ao Trabalho — MTE, 2025.
- Manual de Interpretação e Aplicação do Capítulo 1.5 da NR-1 — MTE, 2026.
