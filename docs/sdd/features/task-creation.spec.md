# Feature specification — Criação e recorrência de tarefas

**ID:** `B2C-TSK`

**Versão:** `0.1.0`

**Estado:** `proposed`

## 1. Problema e resultado

A pessoa precisa registrar um cuidado rapidamente e configurar somente os detalhes que fizerem sentido. O fluxo deve aceitar tarefas sem data, tarefas agendadas, séries diárias ou semanais e alertas, sem criar antecipadamente uma quantidade ilimitada de registros.

## 2. Escopo

Incluído:

- criação com título e descrição opcional;
- data e horário opcionais;
- importância baixa, média ou alta;
- recorrência diária ou semanal;
- seleção de um ou mais dias na recorrência semanal;
- notificação padrão para tarefas com data e horário, quando o canal estiver autorizado;
- alarme opcional com antecedência configurável;
- identificação visual de tarefa originada no módulo Estudante;
- conclusão, reagendamento e desativação da recorrência.

Fora deste incremento:

- recorrência mensal ou anual;
- data automática de término da série;
- criação antecipada de todas as ocorrências futuras;
- ativação do módulo Estudante, que continua fora do primeiro MVP;
- garantia de alarme audível em clientes que não ofereçam essa capacidade.

## 3. Atores e permissões

| Ator | Pode | Não pode |
|---|---|---|
| Pessoa do workspace | criar e administrar suas tarefas, recorrências e alertas | acessar tarefas de outro workspace |
| Beneficiário empresarial | usar tarefas no workspace pessoal privado | compartilhar o conteúdo da tarefa com a empresa por consequência do benefício |
| Administradores e suporte | consultar somente metadados operacionais permitidos | ler título, descrição, agenda ou histórico pessoal |

## 4. Requisitos

- `B2C-TSK-001`: criar tarefa com título obrigatório e descrição, importância, data e horário opcionais.
- `B2C-TSK-002`: organizar tarefas entre “importa hoje”, “com horário”, “pode esperar” e “em breve”.
- `B2C-TSK-003`: concluir, reagendar, arquivar e desativar recorrência.
- `B2C-TSK-004`: permitir recorrência diária ou semanal no fuso IANA do workspace.
- `B2C-TSK-005`: na recorrência semanal, exigir a seleção de pelo menos um dia da semana e aceitar múltiplos dias; a quantidade semanal é derivada dessa seleção.
- `B2C-TSK-006`: manter a recorrência sem término predefinido até que a pessoa a desative ou arquive a tarefa.
- `B2C-TSK-007`: projetar ou materializar ocorrências em janela limitada, sem gravar uma série futura infinita.
- `B2C-TSK-008`: impedir ocorrências duplicadas mesmo quando geração, retry ou job forem executados mais de uma vez.
- `B2C-TSK-009`: criar uma notificação padrão no horário da tarefa quando houver data, horário, permissão do sistema e preferência do módulo ativa.
- `B2C-TSK-010`: permitir um alarme opcional na hora ou 5, 15 ou 30 minutos antes da tarefa.
- `B2C-TSK-011`: tratar alarme como alerta de maior atenção, distinto da notificação padrão, e oferecê-lo somente quando o cliente conseguir executar o comportamento informado.
- `B2C-TSK-012`: respeitar horário de silêncio, permissão do sistema e revogação do canal sem alterar o estado da tarefa.
- `B2C-TSK-013`: marcar visualmente uma tarefa com origem `student` usando o ícone de graduação; a origem vem do módulo e não é uma prioridade.
- `B2C-TSK-014`: registrar analytics técnicos sem título, descrição, data exata ou conteúdo pessoal.

## 5. Estados e transições

```text
rascunho → ativa → concluída
              ↘ arquivada

recorrência ativa → desativada
ocorrência planejada → concluída | ignorada | reagendada
aviso planejado → enviado | cancelado | falhou
```

- salvar no seletor de data aplica o agendamento ao rascunho; salvar no compositor cria a tarefa;
- cancelar o compositor descarta o rascunho completo;
- concluir uma ocorrência não encerra a regra recorrente;
- desativar a recorrência cancela avisos futuros ainda não enviados e preserva o histórico;
- ignorar uma notificação ou alarme não marca a tarefa como falha.

## 6. Dados

### `tasks`

- `workspace_id`, título, descrição opcional, importância, estado e timestamps;
- `source`: `manual`, `student` ou outra origem versionada no futuro;
- `scheduled_local_date` e `scheduled_local_time` para tarefa simples;
- `timezone` quando o agendamento depender da intenção local;
- `alarm_offset_minutes` nullable, limitado a `0`, `5`, `15` ou `30`.

### `task_recurrence_rules`

- `task_id` unique;
- `frequency`: `daily` ou `weekly`;
- `interval`: começa em `1`;
- `weekdays`: dias ISO de `1` a `7`, sem repetição; obrigatório para `weekly`;
- `starts_on` obrigatório;
- `local_time` nullable;
- `timezone` IANA obrigatório;
- `active`, `deactivated_at` nullable e timestamps.

### `task_occurrences`

- referência à tarefa e à regra;
- data civil e instante planejado quando houver horário;
- estado e `completed_at` nullable;
- unicidade por regra e data/horário planejados.

### `task_alert_deliveries`

- referência à ocorrência;
- tipo `standard_notification` ou `alarm`;
- instante planejado, canal, estado e chave idempotente;
- identificador opaco do provedor, sem conteúdo pessoal no log.

Título e descrição são dados pessoais privados. Entregas e analytics não copiam esses campos.

## 7. Contratos

```ts
type TaskRecurrenceInput =
  | { frequency: "daily"; startsOn: string; localTime?: string; timezone: string }
  | { frequency: "weekly"; startsOn: string; weekdays: number[]; localTime?: string; timezone: string };

type CreateTaskInput = {
  title: string;
  description?: string;
  importance?: "low" | "medium" | "high";
  date?: string;
  time?: string;
  recurrence?: TaskRecurrenceInput;
  alarmOffsetMinutes?: 0 | 5 | 15 | 30;
  source?: "manual" | "student";
  idempotencyKey: string;
};
```

Regras:

- recorrência exige data inicial;
- recorrência semanal exige `weekdays.length >= 1`;
- alarme exige data e horário;
- tarefa com data e sem horário aparece no dia escolhido, mas não possui instante para disparo individual;
- a geração usa uma janela operacional configurável ou cria somente a próxima ocorrência;
- retry com a mesma chave ou para a mesma ocorrência retorna o resultado existente.

## 8. Interface

O compositor é uma bottom sheet sobre a tela atual:

1. nome da tarefa com foco inicial e ação de entrada por voz quando suportada;
2. descrição opcional;
3. ações compactas “Quando?”, “Prioridade” e “Alarme”;
4. marcador com ícone de graduação quando a origem for `student`;
5. cancelar e salvar.

“Quando?” abre uma etapa sobreposta com:

- data inicial;
- controle “Repetir tarefa?”;
- frequência diária ou semanal;
- para semanal, sete controles de dia com seleção múltipla;
- horário opcional;
- ação para aplicar e voltar ao compositor.

O compositor deve permanecer acima do teclado, preservar o rascunho ao abrir seletores, impedir envio duplicado e mostrar erro sem fechar quando a persistência falhar.

O marcador Estudante é contextual. Uma tarefa criada dentro desse módulo recebe `source = student` automaticamente e exibe o ícone; o controle não funciona como alternância decorativa no compositor geral.

## 9. Critérios de aceitação

- `B2C-TSK-AC-01`: uma tarefa sem data é criada uma vez e aparece em “pode esperar”.
- `B2C-TSK-AC-02`: uma regra semanal com terça e quinta produz ocorrências somente nesses dias e representa duas vezes por semana.
- `B2C-TSK-AC-03`: uma regra semanal sem dia selecionado explica o erro e não é enviada.
- `B2C-TSK-AC-04`: uma regra continua ativa até ser desativada, sem criar quantidade ilimitada de linhas futuras.
- `B2C-TSK-AC-05`: repetir o job ou a requisição não duplica ocorrência nem entrega.
- `B2C-TSK-AC-06`: mudança de fuso mantém a intenção local conforme a política documentada e recalcula apenas ocorrências futuras.
- `B2C-TSK-AC-07`: tarefa com data e horário gera notificação padrão quando o canal está autorizado.
- `B2C-TSK-AC-08`: alarme de 15 minutos é planejado exatamente 15 minutos antes no fuso da regra.
- `B2C-TSK-AC-09`: cliente sem suporte a alarme informa a limitação antes da seleção e mantém a notificação padrão disponível.
- `B2C-TSK-AC-10`: cancelar o compositor e reabrir apresenta um novo rascunho vazio.
- `B2C-TSK-AC-11`: falha ao salvar mantém o conteúdo preenchido e permite tentar novamente.
- `B2C-TSK-AC-12`: tarefa criada pelo módulo Estudante persiste `source = student` e apresenta o ícone de graduação.
- `B2C-TSK-AC-13`: outro usuário, organização, suporte ou platform admin não consegue ler o conteúdo da tarefa.

## 10. Testes

- domínio: cálculo diário, múltiplos dias semanais, fuso e próxima ocorrência;
- banco: constraints, unicidade, RLS e retry idempotente;
- jobs e Edge Functions: janela de materialização, cancelamento e entregas;
- componentes: rascunho, seletores, teclado, erro, loading e origem Estudante;
- E2E: criar simples, criar recorrente, concluir uma ocorrência e desativar a série.

## 11. Telemetria

Permitido:

- `task_created` com presença de agenda, recorrência e origem em códigos fechados;
- `task_occurrence_completed`;
- `task_recurrence_disabled`;
- `task_alert_delivery_result` com tipo e resultado técnico.

Proibido: título, descrição, data exata, horário exato, texto de erro do provedor que contenha payload ou identificador pessoal.

## 12. Migração e rollback

- a migration é aditiva e não reescreve a migration inicial já aplicada;
- tarefas atuais entram como `source = manual`, sem recorrência e sem alarme;
- lembretes antigos são convertidos para `alarm_offset_minutes` apenas quando existe data e horário válidos;
- a entrega de alertas fica protegida por feature flag e pode ser desligada sem impedir criação e conclusão de tarefas;
- rollback desativa geração e entrega, preservando tarefas e histórico.

## 13. Decisões abertas

- definir em ADR quais clientes oferecem alarme real e qual experiência é apresentada nos demais;
- definir o tamanho da janela operacional de ocorrências após medir volume e custo;
- definir o horário e a política de resumo para tarefas que possuem data, mas não horário.

## 14. Definition of Done

- requisitos e critérios ligados a testes;
- migration, RLS e tipos gerados revisados;
- recorrência validada em mudança de mês, horário de verão e troca de fuso;
- notificação e alarme verificados por capacidade de cliente;
- interface verificada em 360 px, teclado aberto, teclado físico e leitor de tela;
- logs inspecionados sem conteúdo pessoal;
- evidências registradas na matriz de rastreabilidade.
