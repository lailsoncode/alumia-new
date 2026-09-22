# Matriz de rastreabilidade

**ID:** `TRACE`  
**Estado:** active

Esta matriz liga intenção de produto, especificação, entrega e evidência. Ela deve ser atualizada quando uma spec ou incremento mudar de estado.

## 1. Objetivos e entregas

| Objetivo | Requisitos principais | Incrementos | Evidência esperada |
|---|---|---|---|
| Experiência B2C privada | `IDN-*`, `B2C-ONB-*`, `B2C-CHK-*`, `B2C-TSK-*`, `B2C-MND-*`, `B2C-HYD-*` | 001, 002, 005 | testes RLS, component tests e smoke B2C |
| Benefício empresarial privado | `ENT-*`, `B2B-BEN-*` | 003 | testes de assento, vínculo, revogação e isolamento |
| Gestão NR-1 | `B2B-ORG-*`, `B2B-CYC-*`, `B2B-MTH-*`, `B2B-PAR-*`, `B2B-RSK-*`, `B2B-ACT-*`, `B2B-EXP-*` | 004, 006, 007 | revisão técnica, RLS, supressão, snapshots e export |
| Operação master | `ADM-*` | 003, 008 | testes de papéis, auditoria e operação em staging |
| Acessibilidade | `CONST-07`, `DS-AC-*`, requisitos de cada feature | todos | axe, teclado, leitor de tela e revisão manual |
| Privacidade | `CONST-02`, `CONST-03`, `PRV-*`, `SEC-RLS-*` | todos | testes negativos, inventário de dados e logs revisados |

## 2. Fontes e decisões absorvidas

| Fonte | Decisão incorporada |
|---|---|
| Manifesto e ideação | cuidado voluntário, linguagem gentil e autonomia |
| Protótipo FlutterFlow | onboarding, home, modelo de tarefas, check-in, mindfulness e hidratação como referências |
| Auditoria do protótipo | reescrever stack; adiar comunidade, IA, estudante e insígnias; corrigir acessibilidade e roteamento |
| Pitch deck | ofertas Freemium, PRO e Empresas como hipóteses comerciais |
| Blueprint MeAgende.Me | React/Vite/Supabase, multi-tenancy, RLS, platform admin e verticais completas |
| Materiais NR-1 | foco em condições de trabalho, métodos múltiplos, participação, inventário, ações e eficácia |

## 3. Controles transversais

| Controle | Spec | Verificação mínima |
|---|---|---|
| Workspace pessoal não pertence à empresa | `CONST-02`, `DATA-SEC` | `SEC-RLS-001`, `002`, `010` |
| Dados B2C não alimentam B2B | `CONST-03` | revisão de queries e teste de integração |
| Papel não equivale a plano | `ENT-001` | teste server-side com combinações papel/entitlement |
| Conteúdo é versionado | `CONST-08`, `CNT-*` | constraint, fluxo de publicação e snapshot |
| Sem diagnóstico | `CONST-04`, `B2B` | revisão editorial e técnica |
| Sem gamificação punitiva | `CONST-01` | revisão de UX e testes de conteúdo |
| IA fora do MVP | `CONST-09` | ausência de provider/secret/bundle no MVP |
| Rota reflete a tela | `ARCH-ROUTE-002` | E2E de navegação, reload e deep link |

## 4. Estado dos incrementos

| Incremento | Spec detalhada | Implementação | Verificação |
|---|---|---|---|
| `INC-001` | ready | não iniciada | pendente |
| `INC-002` | backlog | não iniciada | pendente |
| `INC-003` | backlog | não iniciada | pendente |
| `INC-004` | backlog | não iniciada | pendente |
| `INC-005` | backlog | não iniciada | pendente |
| `INC-006` | backlog | não iniciada | pendente |
| `INC-007` | backlog | não iniciada | pendente |
| `INC-008` | backlog | não iniciada | pendente |
| `INC-009` | backlog | não iniciada | pendente |

## 5. Evidência de verificação

Ao concluir um requisito, registrar:

- ID do requisito e critério;
- teste automatizado ou roteiro manual;
- commit ou pull request;
- ambiente e data;
- resultado;
- risco residual;
- pessoa revisora quando o requisito exigir revisão técnica, editorial, jurídica ou de privacidade.

