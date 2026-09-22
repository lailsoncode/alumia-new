# Plano de entrega orientado por especificações

**ID:** `DELIVERY`  
**Versão:** 0.1.0  
**Estado:** proposed

## 1. Estratégia

O desenvolvimento alterna verticais completas. Cada incremento deve atravessar banco, RLS, tipos, domínio, hooks, interface, testes e telemetria. Nenhuma superfície será construída inteira como mock antes das regras de dados.

## 2. Sequência

| Incremento | Entrega | Dependência | Gate |
|---|---|---|---|
| `INC-001` | Fundação, Auth, workspace e check-in privado | nenhuma | RLS pessoal e smoke B2C |
| `INC-002` | Tarefas gentis | INC-001 | recorrência, fuso e histórico testados |
| `INC-003` | Platform admin mínimo, organizações e benefícios | INC-001 | provisionamento e revogação idempotentes |
| `INC-004` | Estrutura B2B e configuração de ciclo | INC-003 | isolamento entre tenants e estados do ciclo |
| `INC-005` | Mindfulness, hidratação e preferências | INC-001 | acessibilidade e dados pessoais privados |
| `INC-006` | Participação e campanhas B2B | INC-004 | metodologia revisada, supressão testada |
| `INC-007` | Achados, inventário, plano de ação e export | INC-006 | snapshot, auditoria e dossiê verificados |
| `INC-008` | Painel master completo, conteúdo, privacidade e comercial | INC-003/007 | menor privilégio e operação auditável |
| `INC-009` | PWA, notificações, pilotos e endurecimento | anteriores | backup, restore, segurança e smoke |

## 3. Relação com as 18 semanas

| Semanas | Foco |
|---|---|
| 1–2 | INC-001 e revisão editorial do check-in |
| 3–4 | INC-002 e desenho validado do painel master |
| 5–6 | INC-003 |
| 7–8 | INC-004 e revisão técnica B2B |
| 9 | INC-005 |
| 10–11 | INC-006 |
| 12–13 | INC-007 |
| 14–15 | INC-008 |
| 16–18 | INC-009, beta B2C e piloto B2B |

É uma referência de sequência. Escopo só avança quando o gate anterior estiver comprovado.

## 4. Artefatos por incremento

Antes do código:

- feature spec aprovada;
- wireflow quando houver interface nova;
- modelo e migrações planejadas;
- matriz de permissão;
- critérios de aceitação;
- riscos e itens fora do escopo.

Durante o código:

- tasks rastreadas aos requisitos;
- migrations e tipos gerados;
- testes por camada;
- decisões registradas em ADR.

Ao concluir:

- checklist de critérios com evidência;
- changelog da especificação;
- smoke em staging;
- riscos residuais e rollback;
- estado da spec alterado para `verified`.

## 5. Gates globais

### Gate A — Fundação segura

- Auth, workspace e RLS pessoal verificados;
- CI completo;
- logs sem conteúdo sensível;
- design system base acessível.

### Gate B — Multi-tenancy

- organizações, membros, escopos e entitlements;
- testes cruzados entre pelo menos duas organizações;
- platform admin separado do tenant admin.

### Gate C — Metodologia B2B

- revisão por profissional competente;
- instrumentos e matriz versionados;
- limiar de anonimato definido;
- linguagem e exportação revisadas.

### Gate D — Pilotos

- beta B2C com fluxo principal estável;
- piloto B2B acompanhado;
- restauração de backup testada;
- resposta a incidentes documentada;
- bugs P0/P1 resolvidos.

## 6. Primeiro comando de implementação

Depois de aprovar `INC-001`, criar o repositório e executar somente o bootstrap e o ambiente local. O primeiro PR deve conter:

- Vite + React + TypeScript strict;
- scripts e CI;
- design tokens mínimos e `AlumiaIcon`;
- Supabase local e `.env.example`;
- shell de rotas e providers;
- nenhum fluxo de negócio incompleto.

O segundo PR inicia as migrations de identidade e workspace. O terceiro entrega a vertical de check-in completa.

## 7. Critério para começar o próximo incremento

Um incremento seguinte pode ser detalhado enquanto o atual está em implementação, mas não pode depender de contrato ainda não verificado. Mudanças de schema compartilhado devem ser resolvidas antes de paralelizar.

