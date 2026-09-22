# Componentes de Tarefas

As tarefas são lidas e persistidas pelo `tasksService`. A interface agrupa o trabalho em **Importa hoje**, **Marcado para hoje**, **Pode esperar** e **Em breve**.

- `TasksView.tsx`: estado, carregamento, erros, filtros e criação;
- `TaskItem.tsx`: tarefa individual e conclusão;
- `AddTaskSheet.tsx`: criação com título, descrição, data, horário, prioridade e lembrete;
- `DatePickerSheet.tsx` e `DatePickerCalendar.tsx`: escolha acessível de data e horário;
- `PrioritySelector.tsx` e `ReminderSelector.tsx`: metadados opcionais.

O mobile usa um botão flutuante para criação; a partir do breakpoint `sm`, a ação aparece no cabeçalho. Recorrência não é exibida porque ainda não existe contrato de persistência para esse dado.
