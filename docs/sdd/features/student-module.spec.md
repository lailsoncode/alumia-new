# Feature specification — Módulo Estudante

**ID:** `B2C-STU`

**Versão:** 0.1.0

**Estado:** implemented, verification pending

## 1. Resultado esperado

A pessoa organiza compromissos acadêmicos, inicia uma sessão de foco com duração escolhida e agenda uma revisão sem ranking, streak, pontuação ou mensagem de fracasso.

## 2. Escopo desta entrega

- matérias privadas;
- compromissos do tipo prova, trabalho, leitura ou revisão;
- duração estimada e lembrete opcional;
- agenda acadêmica integrada à tabela `tasks` pela origem `student`;
- sessão de foco pausável;
- reflexão opcional ao encerrar;
- criação de um novo compromisso de revisão para amanhã, três dias ou uma semana.

Ficam fora desta entrega: flashcards, recomendação generativa, importação de calendário, anexos, trilhas editoriais, benefícios estudantis, ranking e gamificação.

## 3. Requisitos

- `B2C-STU-001`: criar matéria privada, normalizada por nome e reutilizável pelo usuário.
- `B2C-STU-002`: criar compromisso acadêmico com título e matéria obrigatórios; tipo, duração, descrição, data, horário e lembrete seguem os contratos de tarefas.
- `B2C-STU-003`: persistir o compromisso em `tasks` com `module_key = student` e os campos acadêmicos em relação 1:1.
- `B2C-STU-004`: listar o próximo compromisso e até três compromissos futuros sem classificar ausência ou atraso como falha.
- `B2C-STU-005`: iniciar sessão com 10, 15, 25 minutos ou a duração estimada do compromisso.
- `B2C-STU-006`: permitir pausar, continuar e encerrar uma sessão antes do tempo sem punição.
- `B2C-STU-007`: registrar apenas duração planejada, duração realizada, referência opcional à matéria/tarefa e reflexão opcional.
- `B2C-STU-008`: permitir agendar revisão em uma nova tarefa com origem `student`.
- `B2C-STU-009`: direcionar a ação de uma notificação acadêmica para `/estudante`.
- `B2C-STU-010`: impedir por RLS leitura ou mutação de matérias, detalhes e sessões de outra pessoa.

## 4. Estados

```text
agenda → novo compromisso → agenda
agenda → foco ↔ pausa → reflexão → agenda
                              ↘ revisão criada → agenda
```

## 5. Critérios de aceitação

- `B2C-STU-AC-01`: título ou matéria ausente produz erro acessível e não cria registros.
- `B2C-STU-AC-02`: lembrete sem data e horário é rejeitado na interface e no RPC.
- `B2C-STU-AC-03`: a criação gera exatamente uma tarefa e um detalhe acadêmico na mesma transação.
- `B2C-STU-AC-04`: fechar ou pausar o timer não marca a sessão como falha.
- `B2C-STU-AC-05`: o contador compensa throttling do navegador usando um instante-alvo, em vez de somar ticks.
- `B2C-STU-AC-06`: uma revisão criada aparece na agenda acadêmica e na lista geral de tarefas com identidade Estudante.
- `B2C-STU-AC-07`: outro usuário não consegue referenciar tarefa ou matéria privada na própria sessão.
- `B2C-STU-AC-08`: o fluxo principal funciona a partir de 320 px, com controles de pelo menos 44 px e nomes acessíveis.

## 6. Evidências atuais

- migration `20260926120000_create_student_module.sql` com RLS e RPC atômico;
- tipos e regras em `src/types/student.ts` e `src/lib/student.ts`;
- serviço em `src/services/studentService.ts`;
- rota `/estudante` e componentes em `src/components/shared/student`;
- testes de ordenação, datas, temporizador, módulos e rota de notificação.

Permanecem pendentes: teste negativo de RLS com dois usuários, smoke conectado ao Supabase e auditoria manual por teclado/leitor de tela.
