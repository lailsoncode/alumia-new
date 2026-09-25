# Alumia — Spec-Driven Development

**Versão do pacote:** 0.2.0

**Data:** 25 de setembro de 2026

**Status:** proposto para revisão e início da implementação

Este diretório é a fonte de verdade para desenvolver a nova Alumia. As especificações traduzem o plano do produto, o blueprint SaaS, os materiais do Google Drive, o pitch e a auditoria do FlutterFlow em contratos verificáveis.

## Como trabalhar com este pacote

Toda mudança funcional segue este fluxo:

```text
necessidade → especificação → critérios de aceitação → plano técnico
           → tarefas → código → testes → verificação → atualização da especificação
```

Estados permitidos para uma especificação:

1. `proposed`: escrita, ainda sujeita a ajustes;
2. `approved`: escopo e critérios aceitos;
3. `implementing`: há trabalho em andamento;
4. `verified`: critérios demonstrados por testes e revisão;
5. `deprecated`: substituída, com referência para a sucessora.

Regras do processo:

- código novo precisa atender a um requisito identificado;
- requisitos usam IDs estáveis, como `B2C-CHK-001` ou `SEC-RLS-004`;
- testes relevantes citam o ID do critério que comprovam;
- mudança de comportamento começa pela atualização da especificação;
- detalhes de implementação podem mudar sem alterar o requisito, desde que o contrato permaneça verdadeiro;
- decisões arquiteturais irreversíveis ou transversais recebem um ADR;
- nenhum protótipo visual substitui critérios de aceitação e regras de segurança.

## Mapa das especificações

| Arquivo | Finalidade | Estado |
|---|---|---|
| [`constitution.md`](constitution.md) | Princípios que nenhuma feature pode violar | proposed |
| [`product-spec.md`](product-spec.md) | Escopo, atores, jornadas e requisitos globais | proposed |
| [`architecture-spec.md`](architecture-spec.md) | Arquitetura, módulos, rotas e contratos técnicos | proposed |
| [`data-and-access-spec.md`](data-and-access-spec.md) | Dados, estados, permissões e RLS | proposed |
| [`design-system-spec.md`](design-system-spec.md) | Interface, Hugeicons e acessibilidade | proposed |
| [`features/b2c-core.spec.md`](features/b2c-core.spec.md) | Experiência pessoal B2C | proposed |
| [`features/task-creation.spec.md`](features/task-creation.spec.md) | Criação, recorrência, avisos e origem das tarefas | proposed |
| [`features/b2b-nr1.spec.md`](features/b2b-nr1.spec.md) | Alumia Empresas e fluxo NR-1 | proposed |
| [`features/platform-admin.spec.md`](features/platform-admin.spec.md) | Painel master da Alumia | proposed |
| [`increments/001-foundation-and-private-checkin.md`](increments/001-foundation-and-private-checkin.md) | Primeiro incremento pronto para implementação | ready |
| [`delivery-plan.md`](delivery-plan.md) | Ordem, dependências e gates de entrega | proposed |
| [`traceability.md`](traceability.md) | Relação entre objetivos, requisitos, incrementos e evidências | active |
| [`templates/feature-spec-template.md`](templates/feature-spec-template.md) | Modelo para novas especificações | active |

## Hierarquia de autoridade

Quando dois documentos divergirem, use esta ordem:

1. constituição;
2. especificação de produto;
3. especificações de segurança e dados;
4. especificação da feature;
5. especificação do incremento;
6. plano de desenvolvimento anterior e protótipos.

Uma divergência deve ser resolvida no documento de maior autoridade antes de programar.

## Fontes consolidadas

- [plano de desenvolvimento da Alumia, versão 1.4](../planning/plano-desenvolvimento-alumia.md);
- [auditoria do protótipo FlutterFlow `alumia-t108bs`](../research/auditoria-prototipo-flutterflow-alumia.md);
- [auditoria técnica do repositório React/Supabase](../research/auditoria-repositorio-alumia-new.md);
- [blueprint SaaS multi-tenant do MeAgende.Me](../reference/blueprint-saas-multitenant-replicavel.md);
- documentos de ideação, execução e manifesto localizados no Google Drive;
- pitch deck da Alumia;
- referências oficiais já registradas sobre NR-1 e fatores de risco psicossociais.

## Marco para começar a programar

O incremento `001-foundation-and-private-checkin` está definido como a primeira entrega. Ele cria a base React/Supabase, autenticação, workspace pessoal e um check-in privado completo. Depois dele, o desenvolvimento alterna verticais B2C, plataforma e B2B para que as três superfícies evoluam sobre a mesma fundação.
