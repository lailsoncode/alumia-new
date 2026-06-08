# Definições de Tipos (`src/types/`)

Este diretório armazena todas as declarações de tipo (`.ts`) compartilhadas no aplicativo Alumia, garantindo consistência visual e segurança de tipos em todo o projeto.

## Diretrizes de Tipagem (Metodologia Oxente)

1. **Tipos Globais e Módulos:** Cada módulo principal do sistema (ex: `tasks`, `modules`, `auth`, `checkin`) deve ter seu próprio arquivo de tipos dedicado (ex: `tasks.ts`, `modules.ts`).
2. **Exportação Centralizada:** O arquivo `src/types/index.ts` deve re-exportar todas as definições dos subarquivos para que as importações possam ser simplificadas em `import type { Task } from "@/types"`.
3. **Padrão de Nomenclatura:**
   - Tipos e Interfaces devem usar `PascalCase` (ex: `Task`, `ModuleCardData`).
   - Propriedades de objetos devem usar `camelCase` (ex: `hasBell`, `highlighted`).
   - Tipos de enums ou uniões devem usar `camelCase` ou `kebab-case` string literals se apropriado (ex: `TaskPriority = "alta" | "media" | "baixa" | null`).

---

## Arquivos Atuais

- `tasks.ts` → Interfaces e enums relacionados ao gerenciador de tarefas (prioridades, lembretes, dados de criação de tarefas).
- `modules.ts` → Tipagens para os cards de catálogo e módulos de recursos ativos.
- `index.ts` → Arquivo de exportação centralizado.
