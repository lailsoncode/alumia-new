# Plano objetivo de correção do design da Alumia

**Versão:** 1.1  
**Estado:** executado em 22 de setembro de 2026  
**Base:** [auditoria do design atual](../research/auditoria-design-atual.md) e [especificação do design system](../sdd/design-system-spec.md)

## Objetivo

Corrigir o design atual em uma única iniciativa de repaginação, preservando a identidade acolhedora da Alumia e deixando a experiência B2C consistente, acessível e responsiva antes do desenvolvimento de novas funcionalidades.

O trabalho será feito em **uma branch e uma entrega coesa**, com commits organizados por três marcos. Não haverá uma sequência de pequenas entregas por tela.

## Resultado esperado

Ao final, login, cadastro, recuperação de senha, conclusão de perfil, home, tarefas, hidratação, módulos e ajustes devem compartilhar:

- a mesma escala tipográfica e os mesmos tokens;
- navegação adequada para mobile e desktop;
- hierarquia visual clara;
- componentes e estados de interação consistentes;
- Hugeicons como biblioteca de ícones do produto;
- contraste WCAG 2.2 AA e navegação por teclado;
- temas claro e escuro desenhados como parte do mesmo sistema;
- conteúdo alinhado à proposta sem pressão da Alumia.

## Escopo fechado

### Incluído

- design system e tokens;
- shell responsivo B2C;
- telas B2C já existentes;
- navegação, formulários, cards, feedbacks, drawers e dialogs;
- estados loading, vazio, erro e sucesso;
- revisão de textos visíveis que conflitam com a proposta;
- correções técnicas necessárias para renderizar essas telas com segurança, incluindo o uso de `localStorage` na hidratação.

### Fora desta entrega

- painel master;
- Alumia Empresas e telas NR-1;
- novos módulos ou novas regras de negócio;
- comunidade, Alum.IA, estudante, badges e gamificação;
- alteração do schema multi-tenant;
- migração de dados;
- aplicativo nativo e publicação em lojas.

## Marco 1 — Sistema visual e shell

Construir a base e aplicá-la imediatamente à estrutura do aplicativo.

### Sistema visual

- consolidar tokens de cor, superfície, espaçamento, radius, sombra, tipografia e motion em `styles.css`;
- criar pares claros e escuros para todos os tokens, inclusive `tone-*`;
- retirar cores hexadecimais das páginas e componentes de produto;
- adotar escala tipográfica com 12 px apenas para legendas, 14 px para conteúdo compacto e 16 px para corpo e formulários;
- definir quatro níveis de ação: primária, secundária, discreta e destrutiva;
- garantir foco visível, estado desabilitado, hover e active em todos os controles;
- criar `AlumiaIcon` e migrar os ícones de produto para Hugeicons;
- reservar emojis para conteúdo editorial decorativo, sem função de navegação ou estado.

### Componentes que serão consolidados

- `Button` e `IconButton`;
- `FormField`, `Input`, `Textarea`, `Select` e `Switch`;
- `Card`, `SectionHeader`, `InlineFeedback`, `EmptyState` e `Skeleton`;
- `Dialog`, `Drawer` e `Sheet`;
- `ModuleCard` com estados ativo, disponível, em breve e restrito por plano;
- `AppShell`, `PageHeader`, `BottomNavigation` e `Sidebar`.

### Shell responsivo

- mobile: bottom navigation com ícone e rótulo, no máximo cinco destinos funcionais;
- desktop: sidebar compacta e área de conteúdo com até 1120 px;
- remover Comunidade da navegação enquanto a feature não existir;
- manter rotas e estado ativo claros;
- usar safe areas e alvos de toque mínimos de 44 × 44 px.

## Marco 2 — Repaginação completa das telas atuais

Migrar todas as telas na mesma passagem, usando a base do marco anterior.

### Autenticação e perfil

- usar layout dividido no desktop e hero compacto no mobile;
- adicionar labels persistentes e mensagens associadas aos campos;
- corrigir contraste, foco, erros e estados de envio;
- manter a personagem como elemento de marca;
- otimizar as imagens de autenticação;
- alinhar login, cadastro, recuperação e conclusão de perfil ao mesmo template.

### Home

- tornar check-in a ação principal da jornada;
- condensar tarefas em uma seção “Para hoje”;
- transformar hidratação em um resumo compacto;
- mostrar somente módulos realmente ativos e funcionais;
- retirar contagens e mensagens repetidas;
- usar duas colunas no desktop quando houver espaço.

### Tarefas

- reduzir o banner explicativo a uma ajuda contextual;
- deixar título, filtros e criação no cabeçalho;
- ampliar a área acionável dos controles de conclusão;
- melhorar legibilidade dos metadados;
- usar FAB no mobile e botão textual no desktop;
- manter as categorias gentis “importa hoje”, “marcou para hoje” e “pode esperar”.

### Hidratação

- colocar progresso e registro rápido no topo;
- condensar explicação e referência diária em um bloco secundário;
- usar uma única ilustração relacionada ao contexto;
- substituir “Out...” por “Outro valor”;
- retirar repetição de textos e mistura de emojis/Lucide;
- carregar preferências de browser sem quebrar SSR.

### Módulos

- eliminar a duplicação entre grade de ativos e lista de switches;
- exibir somente recursos existentes como ativos;
- representar claramente estados disponível, em breve e restrito;
- padronizar a marca como **Alumia** e reservar **Alum.IA** para a feature futura;
- retirar Estudante, Comunidade e Alum.IA do fluxo principal desta entrega.

### Ajustes

- mudar a estrutura para perfil, módulos, notificações, acessibilidade, aparência, privacidade, segurança e conta;
- retirar “desempenho”, badges e métricas simuladas;
- aumentar textos pequenos e simplificar os cards;
- tornar switches, idioma e tema acessíveis;
- dar destaque às opções de dados, privacidade e exclusão de conta previstas no SDD.

## Marco 3 — Validação e acabamento

Executar uma única rodada final de correção sobre o conjunto completo.

### Viewports obrigatórios

- 360 × 800;
- 390 × 844;
- 768 × 1024;
- 1024 × 768;
- 1440 × 900.

### Verificações

- contraste WCAG 2.2 AA;
- teclado e foco visível;
- leitor de tela nos fluxos principais;
- zoom a 200%;
- tema claro e escuro;
- redução de movimento;
- ausência de overflow horizontal;
- loading, vazio, erro e sucesso;
- textos e botões sem truncamento indevido;
- assets responsivos e sem layout shift relevante;
- lint, TypeScript e build de produção.

Testes automatizados devem cobrir somente os contratos críticos desta repaginação: navegação ativa, labels e erros de formulário, abertura/fechamento de overlays, troca de tema e estados dos módulos.

## Definition of Done

A correção visual estará concluída quando:

- todas as telas atuais usarem o novo shell e os componentes consolidados;
- não houver cor hexadecimal em páginas ou componentes de produto;
- Lucide não for usado na interface da Alumia;
- nenhuma informação simulada aparecer como dado real;
- somente funcionalidades existentes forem apresentadas como disponíveis;
- bottom navigation e sidebar funcionarem nos breakpoints definidos;
- textos recorrentes tiverem no mínimo 12 px e corpo tiver 14–16 px;
- todos os controles tiverem foco visível e alvo de toque adequado;
- os pares de cor definidos passarem AA;
- hidratação puder ser renderizada sem acesso inseguro a `localStorage` no servidor;
- lint, TypeScript e build passarem;
- a auditoria visual final não encontrar bloqueios P0 ou P1.

## Sequência de implementação

```text
tokens + componentes + shell
            ↓
autenticação + home + tarefas + hidratação + módulos + ajustes
            ↓
responsividade + acessibilidade + temas + acabamento
            ↓
validação final e merge da repaginação completa
```

O desenvolvimento de novas features será retomado depois desse Definition of Done.

## Resultado da execução

A repaginação foi concluída na branch `feat/design-refresh`. O registro de mudanças, decisões de escopo e evidências de validação está em [Resultado da repaginação](resultado-repaginacao-design.md).
