# Componentes de Tarefas

As tarefas são lidas e persistidas pelo `tasksService`. A interface agrupa o trabalho em **Importa hoje**, **Marcado para hoje**, **Pode esperar** e **Em breve**.

- `TasksView.tsx`: estado, carregamento, erros, filtros, ordenação e criação;
- `TaskItem.tsx`: tarefa individual, conclusão, ações de edição/exclusão, recorrência e indicação de reagendamento; a cor identifica o módulo de origem sem repetir nome ou ícone;
- `AddTaskSheet.tsx`: criação e edição com título, descrição, data, horário, prioridade, lembrete e recorrência diária ou semanal;
- tarefas pendentes de dias anteriores são sincronizadas para o dia atual quando o app abre, volta ao primeiro plano ou atravessa a meia-noite;
- ao concluir uma tarefa recorrente, somente a próxima ocorrência é materializada, preservando o histórico sem gerar uma série infinita;
- tarefas avulsas concluídas recebem um breve feedback riscado e depois passam para a área compacta **Realizadas hoje**;
- `DatePickerSheet.tsx` e `DatePickerCalendar.tsx`: escolha acessível de data e horário;
- `PrioritySelector.tsx` e `ReminderSelector.tsx`: metadados opcionais.

O mobile usa um botão flutuante para criação. A recorrência é persistida em `task_recurrence_rules` e pode ser alterada ou removida durante a edição.
