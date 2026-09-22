# Documentação da Alumia

Esta pasta reúne a documentação de produto, arquitetura, pesquisa e planejamento da Alumia. O pacote de **Spec-Driven Development (SDD)** é a fonte normativa para o desenvolvimento novo.

## Comece por aqui

1. Leia a [constituição do produto](sdd/constitution.md).
2. Consulte a [especificação de produto](sdd/product-spec.md) e a [arquitetura](sdd/architecture-spec.md).
3. Use as especificações de [dados e acesso](sdd/data-and-access-spec.md) e [design system](sdd/design-system-spec.md) como contratos transversais.
4. Implemente a partir de um incremento versionado. O primeiro está em [Fundação e check-in privado](sdd/increments/001-foundation-and-private-checkin.md).
5. Atualize a [rastreabilidade](sdd/traceability.md) junto com código e testes.

## Mapa da documentação

### Especificações normativas

| Documento | Papel |
|---|---|
| [SDD da Alumia](sdd/README.md) | Índice, processo e hierarquia das especificações |
| [Constituição](sdd/constitution.md) | Princípios que nenhuma feature pode violar |
| [Produto](sdd/product-spec.md) | Escopo B2C, B2B e plataforma |
| [Arquitetura](sdd/architecture-spec.md) | Fronteiras, módulos, rotas e contratos técnicos |
| [Dados e acesso](sdd/data-and-access-spec.md) | Modelo, permissões, RLS e privacidade |
| [Design system](sdd/design-system-spec.md) | UI, acessibilidade e uso de Hugeicons |
| [B2C](sdd/features/b2c-core.spec.md) | Experiência pessoal de autocuidado |
| [B2B e NR-1](sdd/features/b2b-nr1.spec.md) | Alumia Empresas e gestão de riscos psicossociais |
| [Painel master](sdd/features/platform-admin.spec.md) | Operação central da plataforma |
| [Plano de entregas](sdd/delivery-plan.md) | Incrementos, dependências e gates |

### Planejamento

| Documento | Papel |
|---|---|
| [Plano de desenvolvimento v1.4](planning/plano-desenvolvimento-alumia.md) | Visão consolidada do produto e da execução |
| [Plano de correção do design](planning/plano-correcao-design.md) | Execução objetiva da repaginação B2C antes de novas features |
| [Resultado da repaginação](planning/resultado-repaginacao-design.md) | Mudanças realizadas e evidências da validação final |
| [Sprint de conforto visual](planning/sprint-conforto-visual.md) | Ajustes concentrados que recuperam o acolhimento da versão anterior sem perder a base atual |

### Pesquisa e auditorias

| Documento | Papel |
|---|---|
| [Auditoria do protótipo FlutterFlow](research/auditoria-prototipo-flutterflow-alumia.md) | Fluxos, conteúdo e ativos do primeiro protótipo |
| [Auditoria deste repositório](research/auditoria-repositorio-alumia-new.md) | Estado técnico, riscos e estratégia de reaproveitamento |
| [Auditoria do design atual](research/auditoria-design-atual.md) | Identidade, telas, responsividade, acessibilidade e direção da repaginação |

### Referências

| Documento | Papel |
|---|---|
| [Blueprint SaaS multi-tenant](reference/blueprint-saas-multitenant-replicavel.md) | Modelo técnico que orientou a arquitetura replicável |

### Documentos históricos

- [Changelog inicial](changelog.md): registro do protótipo React existente; descrições de funcionalidades ainda precisam ser verificadas contra o código.
- [Metodologia anterior](metodologia.md): processo original da Oxente Code. Em divergências sobre a Alumia, prevalecem a constituição e as especificações em `sdd/`.

## Hierarquia de autoridade

Quando houver divergência, use esta ordem:

1. `sdd/constitution.md`;
2. `sdd/product-spec.md`;
3. `sdd/data-and-access-spec.md` e contratos transversais;
4. especificação da feature;
5. especificação do incremento;
6. plano de desenvolvimento;
7. auditorias, protótipos e documentos históricos.

Decisões arquiteturais transversais devem ser registradas em ADR antes de alterar contratos compartilhados.
