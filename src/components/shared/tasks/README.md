# Módulo de Tarefas (`src/components/shared/tasks/`)

Este diretório contém os componentes relacionados à visualização e edição de tarefas dentro do aplicativo Alumia.

## Fluxo de Organização

A Alumia possui um foco específico no bem-estar e no ritmo do usuário. Por conta disso, as tarefas de hoje são agrupadas de forma distinta:

1. **O que você disse que importa hoje:** Tarefas que possuem uma etiqueta especial ou foram marcadas como importantes.
2. **O que você marcou pra hoje:** Tarefas com horários definidos ou datas para o dia atual.
3. **Pode esperar:** Tarefas no backlog sem prazo crítico, permitindo que o usuário as conclua em seu próprio tempo.
4. **Em Breve (Aba secundária):** Tarefas com prazos futuros.

---

## Estrutura de Componentes

Para obedecer à regra de modularização da metodologia Oxente Code (arquivos com menos de 150 linhas), a tela de tarefas foi dividida da seguinte forma:

```
src/components/shared/tasks/
├── AddTaskSheet.tsx        # Bottom sheet para criação rápida de novas tarefas
├── PrioritySelector.tsx    # Subcomponente para selecionar o nível de prioridade (Alta/Média/Baixa)
├── ReminderSelector.tsx    # Subcomponente para configurar os lembretes temporais
├── DatePickerSheet.tsx     # Bottom sheet para escolher data e recorrência
├── DatePickerCalendar.tsx  # Subcomponente de calendário mensal para seleção de data
├── DatePickerRecurrence.tsx# Subcomponente para controle de dias de repetição da tarefa
├── TaskItem.tsx            # Componente de linha individual para renderização de cada tarefa
└── TasksView.tsx           # Container principal que gerencia o estado da aba de tarefas
```

---

## Fluxo de Dados

1. **Leitura de Dados:** O componente `TasksView` consome os dados do banco de dados (inicialmente mockados em `src/lib/mockData.ts`) e realiza a ordenação/filtro baseada no status `done` e na prioridade temporal.
2. **Abertura do Sheet de Adicionar:** O FAB (Floating Action Button) abre o modal `AddTaskSheet`, que por sua vez utiliza as sub-opções do `PrioritySelector` e `ReminderSelector`.
3. **Seleção de Data:** O link "Quando?" abre o sub-sheet `DatePickerSheet` para configuração avançada de calendário (`DatePickerCalendar`) e repetição da rotina (`DatePickerRecurrence`).
