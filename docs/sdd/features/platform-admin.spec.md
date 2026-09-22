# Feature specification — Alumia Platform Admin

**ID:** `ADM`  
**Versão:** 0.1.0  
**Estado:** proposed

## 1. Resultado esperado

A equipe da Alumia consegue operar o SaaS sem consultar conteúdo pessoal ou respostas ocupacionais individuais. Toda ação privilegiada é limitada e auditável.

## 2. Visão geral

- `ADM-DASH-001`: exibir clientes, organizações, assinaturas, licenças e alertas operacionais.
- `ADM-DASH-002`: métricas são agregadas e não incluem conteúdo sensível.
- `ADM-DASH-003`: falhas mostram request ID, serviço, horário e estado, sem payload privado.

## 3. Clientes B2C

- `ADM-CUS-001`: buscar por ID, e-mail normalizado ou estado da conta.
- `ADM-CUS-002`: mostrar perfil mínimo, plano, consentimentos, sessões e pedidos de privacidade.
- `ADM-CUS-003`: não mostrar check-ins, tarefas, hidratação, sessões ou notas.
- `ADM-CUS-004`: permitir reenviar e-mail e revogar sessões por ação server-side auditada.

## 4. Organizações

- `ADM-ORG-001`: criar organização com slug, nome, plano e administrador inicial.
- `ADM-ORG-002`: operação é idempotente e transacional.
- `ADM-ORG-003`: listar estabelecimentos, membros, assentos, vigência e estado.
- `ADM-ORG-004`: suspender acesso empresarial sem apagar dados.
- `ADM-ORG-005`: reativação respeita contrato, papel e auditoria.

Critérios:

- `ADM-ORG-AC-01`: falha no convite não deixa organização parcialmente provisionada sem estado recuperável.
- `ADM-ORG-AC-02`: repetir a criação com mesma chave retorna o mesmo resultado.
- `ADM-ORG-AC-03`: administrador convidado não recebe papel de plataforma.

## 5. Planos, features e licenças

- `ADM-ENT-001`: criar e versionar planos Freemium, PRO e Empresas.
- `ADM-ENT-002`: configurar features e limites por vigência.
- `ADM-ENT-003`: atribuir assentos e benefícios.
- `ADM-ENT-004`: concessão manual exige motivo e término.
- `ADM-ENT-005`: alteração de plano não muda autorização por papel.

## 6. Cobrança

- `ADM-BIL-001`: mostrar assinatura, invoices, pagamentos, inadimplência e período de graça.
- `ADM-BIL-002`: webhook é verificado e idempotente.
- `ADM-BIL-003`: valores usam centavos inteiros e snapshot de preço.
- `ADM-BIL-004`: billing operator não acessa dados de cuidado ou avaliações.

O provedor será especificado em documento próprio quando escolhido.

## 7. Conteúdo e metodologia

- `ADM-CNT-001`: curador cria, revisa, publica e arquiva versões.
- `ADM-CNT-002`: publicação exige revisão por usuário diferente quando configurado.
- `ADM-CNT-003`: conteúdo em uso histórico permanece consultável por referência.
- `ADM-CNT-004`: metodologia, questionários, fatores e templates têm versão e autoria.
- `ADM-CNT-005`: somente conteúdo `published` aparece para usuários finais.

## 8. Suporte privilegiado

- `ADM-SUP-001`: suporte opera por ações predefinidas.
- `ADM-SUP-002`: acesso excepcional exige grant com motivo, escopo e expiração.
- `ADM-SUP-003`: o sistema registra operador, alvo, ação, horário, resultado e request ID.
- `ADM-SUP-004`: não existe botão genérico “entrar como usuário” no MVP.
- `ADM-SUP-005`: conteúdo pessoal não aparece em busca, logs ou tickets.

## 9. Privacidade e segurança

- `ADM-PRV-001`: listar e processar solicitações de exportação e exclusão.
- `ADM-PRV-002`: mostrar prazos e bloqueios de retenção documentados.
- `ADM-PRV-003`: revogar sessões e benefícios de forma independente.
- `ADM-PRV-004`: consultar auditoria por ator, organização, ação e período.
- `ADM-PRV-005`: security auditor possui leitura de logs, sem mutações administrativas.

## 10. Sistema

- `ADM-SYS-001`: mostrar saúde de Edge Functions, jobs, webhooks e exports.
- `ADM-SYS-002`: permitir retry somente em operações idempotentes e autorizadas.
- `ADM-SYS-003`: feature flags possuem escopo, vigência e rollout.
- `ADM-SYS-004`: mudanças críticas exigem confirmação contextual e audit log.

## 11. Matriz resumida

| Capacidade | Platform admin | Curador | Billing | Suporte | Auditor |
|---|---:|---:|---:|---:|---:|
| Organizações | gerir | — | leitura mínima | leitura mínima | leitura |
| Planos/features | gerir | — | leitura | — | leitura |
| Conteúdo | gerir | gerir | — | — | leitura |
| Cobrança | gerir | — | gerir | — | leitura |
| Suporte | gerir | — | — | ações permitidas | leitura |
| Privacidade | gerir | — | — | triagem | leitura |
| Audit logs | leitura | própria atividade | própria atividade | própria atividade | leitura |
| Dados pessoais de cuidado | — | — | — | — | — |
| Respostas ocupacionais individuais | — | — | — | — | — |

## 12. Critérios globais

- `ADM-AC-001`: toda página exige papel global explícito.
- `ADM-AC-002`: ocultar botão não substitui verificação server-side.
- `ADM-AC-003`: ações destrutivas ou de acesso elevado exibem impacto e geram auditoria.
- `ADM-AC-004`: busca não retorna texto sensível.
- `ADM-AC-005`: troca de papel entra em vigor após revalidação de sessão/permissões.
- `ADM-AC-006`: páginas usam paginação e filtros na URL.

