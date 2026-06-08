# Módulo Home (`src/components/shared/home/`)

Este diretório contém os blocos e cartões de controle exibidos na página inicial (Dashboard) do aplicativo Alumia.

## Estrutura de Componentes

O painel inicial é composto por pequenos widgets interativos focados no bem-estar diário do usuário:

```
src/components/shared/home/
├── MoodCard.tsx       # Check-in emocional diário ("Como você está se sentindo?")
├── InfoCard.tsx       # Cartão informativo e motivacional com mensagens curtas
├── CareList.tsx       # Lista de hábitos e rituais de autocuidado ("Meus autocuidados")
├── HydrationCard.tsx  # Marcador e controle rápido de ingestão de água diária
├── ModulesGrid.tsx    # Acesso rápido para os módulos ativos do aplicativo
└── index.ts           # Exportação consolidada dos componentes do Dashboard
```

---

## Fluxo de Estado

- **Check-in Emocional:** Registra de forma rápida o humor do usuário e salva em estado local (a ser persistido no Supabase na tabela de check-ins).
- **Controle de Hidratação:** Registra visualmente copos de água consumidos com botões de incremento e decremento.
- **Autocuidados (CareList):** Permite riscar ou marcar atividades de cuidado essenciais do dia como feitas (ex: meditar, alongar, tomar remédio).
