# Especificação de produto — Alumia

**ID:** `PROD`  
**Versão:** 0.1.0  
**Estado:** proposed

## 1. Visão

A Alumia é uma plataforma de cuidado e organização gentil com três superfícies conectadas:

- **Alumia B2C:** workspace privado de autocuidado;
- **Alumia Empresas:** benefício para funcionários e gestão multi-tenant de fatores de risco psicossociais relacionados ao trabalho;
- **Alumia Platform:** operação central de clientes, empresas, planos, licenças, conteúdo, privacidade e suporte.

O mesmo usuário pode ter um workspace pessoal, receber benefício de uma empresa e possuir papel profissional em uma ou mais organizações. Esses vínculos não ampliam o acesso aos dados pessoais.

## 2. Objetivos da primeira versão

### PROD-GOAL-001

Permitir que uma pessoa crie uma conta, escolha módulos e pratique autocuidado sem linguagem de pressão.

### PROD-GOAL-002

Permitir que uma empresa conceda o benefício Alumia a funcionários sem acessar o conteúdo pessoal deles.

### PROD-GOAL-003

Permitir que profissionais autorizados configurem e acompanhem um ciclo documentado de gestão de riscos psicossociais relacionado ao GRO/PGR.

### PROD-GOAL-004

Permitir que a equipe da Alumia administre clientes B2C, organizações, planos, licenças, conteúdo e suporte com menor privilégio e auditoria.

## 3. Fora do primeiro MVP

- comunidade, fórum e desabafos;
- Alum.IA e recomendações generativas;
- estudante, fitness, ciclo menstrual e wearables;
- insígnias, pontos, XP, streaks ou rankings;
- aplicativo nativo separado;
- white label completo;
- diagnóstico clínico, prontuário ou gestão de casos médicos;
- assinatura de laudo, garantia automática de conformidade ou integração com eSocial;
- SSO e SCIM;
- cobrança automática, caso atrase o piloto; o modelo de planos e entitlements permanece obrigatório.

## 4. Atores

| Ator | Identificador | Objetivo |
|---|---|---|
| Pessoa B2C | `personal_user` | Usar módulos privados de autocuidado |
| Beneficiário | `beneficiary` | Receber acesso pago da empresa mantendo privacidade pessoal |
| Administrador da empresa | `organization_admin` | Gerir empresa, membros, convites e licenças |
| Responsável SST | `sst_responsible` | Configurar ciclos, consolidar achados e gerir riscos |
| Responsável por ação | `action_owner` | Executar e evidenciar ações atribuídas |
| Visualizador corporativo | `organization_viewer` | Ler relatórios autorizados e agregados |
| Curador | `content_curator` | Criar e publicar conteúdo editorial |
| Operador de cobrança | `billing_operator` | Operar planos e cobranças sem dados de cuidado |
| Suporte | `support_agent` | Resolver problemas usando metadados mínimos |
| Administrador da plataforma | `platform_admin` | Operar tenants, segurança, planos e configurações globais |
| Participante convidado | `campaign_participant` | Responder a uma campanha por token limitado |

## 5. Jornadas principais

### PROD-JRN-001 — Primeira experiência B2C

```text
criar conta → aceitar termos → criar workspace → escolher módulos
→ realizar primeiro gesto de cuidado → receber resposta editorial → voltar à home
```

### PROD-JRN-002 — Benefício empresarial

```text
empresa provisionada → administrador convidado → assentos definidos
→ funcionário convidado → conta vinculada ou criada → entitlement efetivo
→ uso pessoal privado → término do vínculo → benefício removido e conta preservada
```

### PROD-JRN-003 — Ciclo de riscos psicossociais

```text
configurar organização e estabelecimentos → abrir ciclo → definir unidades e método
→ reunir evidências e participação → consolidar achados → classificar riscos
→ criar plano de ação → acompanhar eficácia → comunicar → exportar dossiê
```

### PROD-JRN-004 — Operação da plataforma

```text
criar ou localizar cliente/empresa → configurar plano e licença
→ acompanhar estado operacional → executar suporte permitido
→ registrar auditoria → tratar privacidade e incidentes
```

## 6. Requisitos funcionais globais

### Identidade e sessão

- `IDN-001`: uma pessoa deve criar conta por e-mail e senha.
- `IDN-002`: uma pessoa deve confirmar e recuperar o acesso sem intervenção administrativa.
- `IDN-003`: login com Google pode ser habilitado após o fluxo básico estar verificado.
- `IDN-004`: criação da conta deve provisionar exatamente um workspace pessoal, de forma idempotente.
- `IDN-005`: um usuário pode pertencer a várias organizações e escolher o contexto corporativo.
- `IDN-006`: logout deve encerrar a sessão local e invalidar dados privados em cache.

### Consentimento e dados

- `PRV-001`: termos, política e consentimentos devem guardar versão, data, finalidade e revogação quando aplicável.
- `PRV-002`: o usuário deve solicitar exportação e exclusão da conta.
- `PRV-003`: exclusão deve respeitar retenções legais documentadas e informar o que não pode ser removido imediatamente.
- `PRV-004`: analytics não recebe emoção, necessidade, nota, título de tarefa ou resposta ocupacional.

### Planos e acesso

- `ENT-001`: autorização por papel e liberação por plano são avaliadas separadamente.
- `ENT-002`: acesso efetivo B2C resulta da união do plano pessoal com benefícios empresariais ativos.
- `ENT-003`: perda do benefício não apaga dados pessoais.
- `ENT-004`: toda concessão manual de acesso deve registrar autor, motivo e vigência.

### Conteúdo

- `CNT-001`: conteúdo possui estado `draft`, `review`, `published` ou `archived`.
- `CNT-002`: conteúdo publicado possui versão imutável usada como referência histórica.
- `CNT-003`: somente curador ou platform admin publica conteúdo.

## 7. Requisitos não funcionais

- `NFR-001`: TypeScript estrito, sem enfraquecer `noImplicitAny` ou `noUncheckedIndexedAccess`.
- `NFR-002`: toda tabela pessoal ou empresarial sensível usa RLS.
- `NFR-003`: páginas iniciais devem carregar por lazy routes e consultas paginadas.
- `NFR-004`: fluxos essenciais atendem WCAG 2.2 AA.
- `NFR-005`: local, staging e produção usam bancos, Storage, Auth e secrets separados.
- `NFR-006`: migrations aplicadas não são reescritas.
- `NFR-007`: falhas exibem mensagem acionável e geram log sem payload sensível.
- `NFR-008`: operações críticas aceitam retry sem duplicar efeito.
- `NFR-009`: tempos e datas são armazenados de modo compatível com o fuso do usuário ou estabelecimento.
- `NFR-010`: listas que crescem usam paginação por cursor ou chave estável.

## 8. Métricas permitidas

- conclusão de onboarding;
- primeiro gesto de cuidado;
- retorno voluntário em 7 e 30 dias;
- erro e duração de fluxo;
- módulos ativados, de forma agregada;
- organizações em implantação e ativas;
- assentos contratados, alocados e disponíveis;
- tempo para configurar ciclo, inventário, ação e exportação;
- falhas de jobs, webhooks e funções.

Métricas proibidas:

- emoção ou necessidade individual em analytics;
- conteúdo de notas, tarefas ou conversas;
- ranking de pessoas ou setores por “saúde mental”;
- cruzamento entre uso B2C e desempenho corporativo.

## 9. Decisões abertas sem bloqueio para o incremento 001

| ID | Decisão | Momento limite |
|---|---|---|
| `OD-001` | Provedor de cobrança | antes do incremento comercial |
| `OD-002` | Provedor de push | antes de notificações |
| `OD-003` | Hospedagem do frontend | antes do primeiro staging público |
| `OD-004` | Limiar padrão de anonimato; proposta: 7, nunca menor que 5 | antes da campanha piloto B2B |
| `OD-005` | Dados legados que serão migrados do Firebase | antes do beta com usuários existentes |
| `OD-006` | Instrumentos e metodologia B2B revisados | antes de publicar campanhas ocupacionais |

