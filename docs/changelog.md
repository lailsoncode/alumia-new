# Changelog

## [0.1.0-pre] - 2026-06-08

### Estado Atual do Projeto (Pre-release 0.1)
O projeto **Alumia** é um aplicativo cross-platform (Web e Mobile) focado em organização e produtividade, estruturado com base nos padrões da startup **Oxente Code**.

#### Funcionalidades Prontas / Páginas Principais:
- **Autenticação (Supabase):**
  - Cadastro de novos usuários (`RegisterPage`).
  - Login tradicional e login social com conta Google (`LoginPage`).
  - Recuperação e redefinição de senha (`ResetPasswordPage`).
  - Tela dedicada a completar informações do perfil (`CompleteProfilePage`).
- **Gerenciamento de Hábitos e Tarefas (`TasksPage`):**
  - Criação de tarefas com data, nível de prioridade e recorrência.
  - Seleção de lembretes e definição de hábitos diários.
- **Painel Inicial (`HomePage`):**
  - Saudação personalizada ao usuário e rastreador de humor diário.
  - Card interativo de controle de hidratação.
  - Grade de módulos de desenvolvimento pessoal e autocuidado.
- **Módulos (`ModulesPage`):**
  - Listagem de conteúdos educativos, meditação e tarefas de desenvolvimento pessoal.
- **Configurações (`SettingsPage`):**
  - Ajustes de conta, perfil e preferências gerais do usuário.
- **Navegação (`BottomNav`):**
  - Barra de navegação inferior fluida, focada em UX móvel.

#### Infraestrutura e Tecnologias:
- **Frontend:** React, TypeScript, Tailwind CSS v4, shadcn/ui (Radix UI).
- **Roteamento:** TanStack Start (SSR / Client Routing) e TanStack Router.
- **PWA/Mobile:** Configuração base de **Capacitor** para geração de builds nativas Android e iOS.
- **Backend:** Supabase BaaS integrado para controle de banco de dados e autenticação.