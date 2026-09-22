# Especificação de dados e controle de acesso

**ID:** `DATA-SEC`  
**Versão:** 0.1.0  
**Estado:** proposed

## 1. Regras estruturais

- `DATA-001`: chaves primárias usam UUID.
- `DATA-002`: entidades mutáveis possuem `created_at` e `updated_at`.
- `DATA-003`: tabelas pessoais possuem `workspace_id` ou `user_id` com ownership verificável.
- `DATA-004`: tabelas empresariais possuem `organization_id NOT NULL`, foreign key e índice.
- `DATA-005`: datas absolutas usam `timestamptz`; datas civis usam `date`; fuso é guardado separadamente quando afeta regra.
- `DATA-006`: status usa enum PostgreSQL ou `CHECK`, nunca texto livre.
- `DATA-007`: JSONB é permitido para snapshots e extensão; campos consultáveis ou regulados são colunas.
- `DATA-008`: exclusão em cascata só é usada quando a relação de propriedade é inequívoca.
- `DATA-009`: conteúdo histórico relevante usa versionamento ou snapshot.
- `DATA-010`: migrations são incrementais e imutáveis depois de aplicadas.

## 2. Identidade e espaços

### `profiles`

| Coluna | Tipo | Regra |
|---|---|---|
| `id` | uuid | PK e FK para `auth.users` |
| `display_name` | text | 2–120 caracteres |
| `avatar_path` | text nullable | caminho no Storage, não URL assinada |
| `locale` | text | padrão `pt-BR` |
| `timezone` | text | IANA timezone |
| `created_at` | timestamptz | obrigatório |
| `updated_at` | timestamptz | obrigatório |

O perfil não contém emoção, saúde, cargo ou informação ocupacional sensível.

### `workspaces`

| Coluna | Tipo | Regra |
|---|---|---|
| `id` | uuid | PK |
| `owner_user_id` | uuid | unique, FK `auth.users` |
| `status` | enum | `active`, `pending_deletion`, `deleted` |
| `created_at` | timestamptz | obrigatório |
| `updated_at` | timestamptz | obrigatório |

### `workspace_members`

Preparada para extensibilidade, mas no MVP somente o proprietário existe.

| Coluna | Tipo | Regra |
|---|---|---|
| `workspace_id` | uuid | FK |
| `user_id` | uuid | FK |
| `role` | enum | inicialmente apenas `owner` |
| `created_at` | timestamptz | obrigatório |

Unique em `(workspace_id, user_id)`.

### Preferências

- `user_preferences`: workspace, tema, idioma, fuso, redução de movimento e preferências gerais;
- `user_modules`: workspace, module code, enabled, position e timestamps;
- `user_consents`: user, purpose code, document version, granted_at, revoked_at e source;
- `notification_preferences`: workspace, channel, module code, enabled, quiet_start, quiet_end e timezone.

## 3. Catálogo editorial

Todas as entidades editoriais usam:

- `id`;
- `code` estável e único;
- `version` inteira;
- `status`: `draft`, `review`, `published`, `archived`;
- `title` e conteúdo estruturado;
- `created_by`, `reviewed_by`, `published_by`;
- timestamps de criação, revisão e publicação.

Tabelas:

- `emotions`;
- `needs`;
- `care_suggestions`;
- `suggestion_rules`;
- `mindfulness_practices`;
- `notification_templates`;
- `psychosocial_factors`;
- `survey_templates`;
- `methodology_versions`;
- `report_templates`.

Conteúdo publicado não é atualizado no lugar. Uma alteração cria versão nova.

## 4. Dados B2C

### `care_checkins`

| Coluna | Tipo | Regra |
|---|---|---|
| `id` | uuid | PK |
| `workspace_id` | uuid | obrigatório e indexado |
| `primary_emotion_id` | uuid nullable | catálogo publicado |
| `need_id` | uuid nullable | catálogo publicado |
| `intensity` | smallint nullable | 1–5 |
| `idempotency_key` | uuid | unique por workspace |
| `note_ciphertext` | text nullable | reservado para estratégia de proteção; texto livre não entra no incremento 001 |
| `occurred_at` | timestamptz | padrão `now()` |
| `created_at` | timestamptz | obrigatório |
| `deleted_at` | timestamptz nullable | soft delete inicial |

Uma tabela de ligação `care_checkin_emotions` permite até três emoções positivas e três difíceis, se esse formato for aprovado. O incremento 001 começa com uma emoção e uma necessidade para reduzir complexidade e validar o valor central.

### `checkin_suggestions`

Guarda o snapshot mostrado:

- `checkin_id` unique;
- `suggestion_id`;
- `suggestion_version`;
- `title_snapshot`;
- `body_snapshot`;
- `rule_code`;
- `created_at`.

### Tarefas

- `tasks`: workspace, title, optional description, importance, scheduled_at, due_date, status, source e timestamps;
- `task_recurrence_rules`: task, frequency, interval, weekdays, local_time, timezone, starts_on, ends_on;
- `task_occurrences`: task, planned_for, status e completed_at;
- `task_events`: task, event type, actor e timestamp.

Estados: `active`, `completed`, `archived`. “Atrasada” não é um estado persistido; é uma condição de apresentação que não usa linguagem punitiva.

### Mindfulness

- `mindfulness_sessions`: workspace, practice/version, started_at, completed_at nullable, duration_seconds nullable;
- mídia em bucket controlado, com texto alternativo/transcrição.

### Hidratação

- `hydration_preferences`: workspace, unit, default_container_ml, reference_ml nullable e reminder settings;
- `hydration_entries`: workspace, amount_ml, occurred_at, source e timestamps.

`amount_ml` deve ser maior que zero e possuir limite técnico defensivo por registro. Referência diária não é prescrição médica.

## 5. Organizações, membros e benefícios

### `organizations`

- `id`, `slug`, `legal_name`, `display_name`;
- `registration_number_ciphertext` nullable;
- `status`: `prospect`, `onboarding`, `active`, `suspended`, `cancelled`;
- `timezone`, `created_at`, `updated_at`.

### Estrutura

- `organization_establishments`: organization, code, name, timezone, status;
- `organization_sectors`: organization, establishment, code, name, status;
- `organization_roles`: organization, sector nullable, code, name, status;
- `organization_settings`: organization, methodology version, minimum group size, retention settings e branding básico.

### Acesso

- `organization_members`: organization, user, role, establishment scope nullable, status, invited_by, timestamps;
- `organization_invites`: organization, email normalizado, role, token hash, expires_at, accepted_at e revoked_at;
- `organization_beneficiaries`: organization, user nullable, email hash, employee reference opcional, status, starts_at, ends_at;
- `license_allocations`: organization, beneficiary, entitlement source, starts_at, ends_at, revoked_at, reason;

Convites guardam apenas hash do token. Aceite é transacional e idempotente.

## 6. Ciclo B2B de riscos psicossociais

### `assessment_cycles`

- organization e establishment;
- title, period_start, period_end;
- methodology_version_id;
- status: `draft`, `prepared`, `collecting`, `analysis`, `action_planning`, `monitoring`, `closed`, `cancelled`;
- responsible_member_id;
- scope_summary e criteria_snapshot;
- version, created_by, timestamps.

### `assessment_units`

- organization, cycle, establishment;
- sector e role opcionais;
- code, name, description;
- estimated_population;
- active.

### Métodos e evidências

- `assessment_methods`: cycle, method type, methodology/version, justification, status;
- `worker_consultations`: cycle, unit, type, occurred_at, facilitator, participant_count, summary protegido e evidence references;
- `evidence_files`: organization, cycle nullable, classification, storage path, hash, retention_until, uploaded_by.

### Campanhas

- `survey_campaigns`: cycle, template/version, audience rules, start/end, min_group_size, status;
- `campaign_tokens`: campaign, token hash, scope, expires_at, use count e revoked_at;
- `survey_responses`: campaign, response pseudonym, unit, encrypted payload or normalized answers, submitted_at;
- `survey_answers`: response, question/version, option/value; acesso direto restrito;
- `campaign_aggregates`: campaign, unit, metric, value, respondent_count, suppression status e calculated_at.

Regras:

- gestores não recebem `SELECT` direto em respostas e respostas individuais;
- agregação usa função controlada;
- cortes abaixo do limite retornam `suppressed`, sem valor;
- tokens não concedem acesso ao tenant;
- respostas não são ligadas ao workspace B2C.

### Achados e inventário

- `assessment_findings`: cycle, unit, factor/version, evidence summary, status, consolidated_by;
- `risk_inventory_items`: cycle, finding, hazard, exposure, possible_harm, existing_controls, probability, severity, level, decision, version, status;
- `risk_inventory_versions`: cycle, version, status, snapshot hash, published_by, published_at.

### Plano de ação

- `action_plans`: organization, cycle, title, status e owner;
- `action_items`: plan, risk item, measure, prevention hierarchy, priority, responsible member, due_date, status;
- `action_evidence`: item, storage path, description, submitted_by, submitted_at;
- `effectiveness_reviews`: item, method, conclusion, reviewed_by, reviewed_at, next_review_at;
- `worker_communications`: cycle, audience, channel, message version, sent_at, evidence;
- `assessment_exports`: cycle, version, requested_by, status, storage path, hash, generated_at.

Estados de ação: `planned`, `in_progress`, `blocked`, `implemented`, `under_review`, `effective`, `ineffective`, `cancelled`.

Transições inválidas são rejeitadas por função de domínio e RPC.

## 7. Plataforma e comercial

- `platform_user_roles`: user, role, status e timestamps;
- `plans`: code, audience, status, currency e billing interval;
- `plan_features`: plan, feature code, enabled, limit value e effective dates;
- `billing_accounts`: owner type e owner id;
- `subscriptions`: billing account, plan, status, period e provider references;
- `subscription_items`: subscription, feature/seat type, quantity e price snapshot;
- `invoices` e `payments`: valores em centavos e referências do provedor;
- `webhook_events`: provider event id unique, type, payload hash, status e attempts;
- `feature_flags`: code, audience rules, enabled e rollout;
- `privacy_requests`: user, type, status, deadlines e resolution;
- `support_cases`: subject user/organization, category, status, assigned operator e metadados mínimos;
- `privileged_access_grants`: operator, subject, reason, scope, starts_at, expires_at e revoked_at;
- `audit_logs`: actor, action, subject, organization nullable, request id, metadata sanitizado e timestamp.

## 8. Papéis

Papéis de plataforma:

- `platform_admin`;
- `content_curator`;
- `billing_operator`;
- `support_agent`;
- `security_auditor`.

Papéis de organização:

- `organization_admin`;
- `sst_responsible`;
- `consultant`;
- `action_owner`;
- `organization_viewer`.

`beneficiary` é vínculo de benefício, não papel administrativo.

## 9. Matriz de acesso

Legenda: `O` proprietário, `R` papel autorizado, `A` agregado, `S` ação server-side, `—` sem acesso.

| Grupo de dados | Pessoa | Empresa admin | SST | Platform admin | Suporte | Função server-side |
|---|---:|---:|---:|---:|---:|---:|
| Perfil básico próprio | O | — | — | metadados mínimos | metadados mínimos | S |
| Check-ins/tarefas/hidratação | O | — | — | — | — | S para exportação/exclusão |
| Preferências pessoais | O | — | — | — | — | S |
| Organização e licenças | vínculo próprio | R | R leitura | R | escopo mínimo | S |
| Ciclos, achados e inventário | — | R | R | metadados operacionais | — | S |
| Respostas individuais | participante: própria submissão | — | — | — | — | S |
| Agregados não suprimidos | — | R | R | metadados | — | S |
| Conteúdo editorial | publicado | publicado | publicado | R | — | S |
| Cobrança | própria quando aplicável | própria organização | — | por papel | — | S |
| Auditoria | própria ação quando necessário | escopo da organização | escopo da organização | R | própria atividade | S |

## 10. Helpers RLS obrigatórios

- `owns_workspace(workspace_id)`;
- `is_platform_role(role)`;
- `is_organization_member(organization_id)`;
- `has_organization_role(organization_id, roles[])`;
- `member_has_establishment_scope(establishment_id)`;
- `has_active_entitlement(feature_code, organization_id nullable)`;
- `can_manage_action_item(action_item_id)`.

Funções `SECURITY DEFINER`:

- definem `search_path` explícito;
- validam `auth.uid()`;
- possuem grants mínimos;
- não aceitam user/organization sensível sem verificar vínculo;
- possuem testes positivos e negativos.

## 11. Padrões de policies

### Dados pessoais

- select/insert/update/delete somente quando `owns_workspace(workspace_id)`;
- `workspace_id` do insert deve pertencer a `auth.uid()`;
- catálogo publicado pode ser lido por autenticados;
- nenhum papel empresarial herda acesso.

### Dados empresariais

- select exige vínculo ativo e escopo;
- insert/update exige papel explícito;
- delete físico é raro; preferir archive/cancel e trilha;
- platform admin acessa operação conforme papel, não por bypass genérico.

### Respostas ocupacionais

- participante insere por RPC/token estreito;
- authenticated comum não seleciona tabela base;
- agregados saem por RPC/view que aplica supressão;
- service role processa somente em função controlada.

## 12. Storage

Buckets:

- `avatars`: privado, acesso do proprietário;
- `mindfulness-media`: conteúdo publicado, leitura conforme plano;
- `organization-evidence`: privado por organização e escopo;
- `assessment-exports`: privado, URL assinada curta;
- `privacy-exports`: privado, proprietário e prazo de expiração.

Path sempre inclui o identificador de ownership. Upload valida tamanho, MIME, extensão, malware quando disponível e autorização antes da emissão da URL.

## 13. Retenção e exclusão

- dados pessoais seguem política configurada e solicitação do titular;
- soft delete não substitui exclusão definitiva;
- artefatos ocupacionais seguem contrato e obrigação aplicável definidos por implantação;
- logs usam retenção curta e metadados mínimos;
- exports expiram e são removidos por job;
- backups possuem ciclo documentado e restauração testada.

## 14. Testes obrigatórios

- `SEC-RLS-001`: usuário A não lê nem altera workspace B;
- `SEC-RLS-002`: organization admin não lê check-ins de beneficiário;
- `SEC-RLS-003`: membro da organização A não acessa organização B;
- `SEC-RLS-004`: SST sem escopo não acessa estabelecimento;
- `SEC-RLS-005`: respostas individuais não são selecionáveis por gestor;
- `SEC-RLS-006`: agregado abaixo do limiar é suprimido;
- `SEC-RLS-007`: platform admin sem grant específico não lê dado pessoal;
- `SEC-RLS-008`: token expirado ou revogado não aceita resposta;
- `SEC-RLS-009`: aceite repetido de convite não duplica membro;
- `SEC-RLS-010`: revogação de benefício preserva workspace e remove entitlement.
