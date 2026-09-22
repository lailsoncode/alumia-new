# Auditoria do design atual da Alumia

**Data:** 21 de setembro de 2026  
**Escopo:** autenticação, home, tarefas, módulos, hidratação, ajustes, navegação, tokens, responsividade e acessibilidade visual  
**Método:** inspeção do código e dos assets, renderização local com dados fictícios e avaliação em viewports de 390 × 844 e 1440 × 900. Nenhum código da aplicação foi alterado.

## Parecer

A Alumia já possui uma identidade reconhecível. A combinação de ilustrações, paleta pastel, tipografia arredondada, cantos suaves e linguagem acolhedora comunica cuidado melhor do que um produto genérico de produtividade. O mobile é a parte mais madura do protótipo.

A próxima versão precisa trocar **suavidade excessiva por clareza gentil**. Hoje quase todos os elementos recebem o mesmo peso: cards brancos, contornos claros, pills e textos pequenos. Isso deixa as telas agradáveis à primeira vista, mas enfraquece hierarquia, ação principal, leitura rápida e escala para desktop. Algumas decisões visuais também contradizem o produto definido no SDD, principalmente desempenho, badges, métricas simuladas e módulos ainda indisponíveis apresentados como ativos.

A repaginação deve preservar a personalidade da marca e reconstruir o sistema visual antes de redesenhar telas isoladas.

## Evidências observadas

| Área | Estado atual | Impacto |
|---|---|---|
| Identidade | Kodchasan + Montserrat, pastéis, ilustrações e linguagem própria | base forte para preservar |
| Tokens | boa estrutura semântica em OKLCH, mas autenticação e ajustes ainda usam hex direto | telas parecem pertencer a sistemas diferentes |
| Tipografia | predomínio de `text-sm` e `text-xs`, com textos de 9, 10 e 11 px | leitura cansativa e risco de acessibilidade |
| Componentes | muitos cards, pills e bordas com aparência semelhante | ação principal e conteúdo secundário competem |
| Mobile | composição consistente em 390 px | boa base, com excesso de conteúdo vertical |
| Desktop | coluna de 640 px e bottom navigation centralizada | grande área vazia e experiência com aparência de emulador móvel |
| Ícones | Hugeicons na maior parte do produto, Lucide e emojis em alguns fluxos | linguagem visual fragmentada |
| Dark mode | base escura genérica; tokens `tone-*` não têm pares escuros | contraste e atmosfera não foram desenhados como um conjunto |
| Assets | imagens fortes, mas estilos e usos variam; duas PNGs de autenticação somam cerca de 1,1 MB | custo de carregamento e inconsistência editorial |

### Contraste medido

Os pares principais do sistema em OKLCH estão adequados: `background/foreground` chega a aproximadamente **12,37:1**, `background/muted-foreground` a **4,72:1** e os pares de tons pastéis ficam acima de **7:1**.

O problema está nas cores codificadas diretamente nas telas de autenticação:

| Par | Contraste aproximado | Resultado para texto normal |
|---|---:|---|
| `#8a99a8` sobre `#ebf4f8` | 2,61:1 | reprova AA |
| `#5d85a6` sobre `#ebf4f8` | 3,51:1 | reprova AA |
| `#8a99a8` sobre branco | 2,92:1 | reprova AA |
| `#2a405a` sobre `#cde2f2` | 7,96:1 | passa AAA |

O caminho é usar tokens semânticos também na autenticação, com `muted-foreground` próprio para superfícies azuladas e foco visível mais forte.

## O que deve ser preservado

- a sensação acolhedora, calma e humana;
- Kodchasan para títulos e Montserrat para leitura;
- a família de pastéis como cores de apoio;
- ilustrações da personagem quando tiverem relação direta com o contexto;
- Hugeicons Stroke Rounded como linguagem iconográfica;
- cantos arredondados moderados;
- textos como “no seu tempo” e “pode esperar”;
- organização mobile-first da experiência pessoal.

## Problemas transversais

### Hierarquia muito uniforme

Cards, itens de lista, botões e mensagens usam borda clara, fundo branco e radius semelhante. O usuário precisa ler para descobrir o que é conteúdo, ação, aviso ou navegação. A nova escala deve distinguir:

1. canvas da página;
2. seções sem contêiner quando a separação por espaço for suficiente;
3. superfícies elevadas para conteúdo realmente agrupado;
4. ações primária, secundária, discreta e destrutiva;
5. feedbacks de informação, sucesso, atenção e erro.

### Tipografia pequena demais

Foram encontradas 41 ocorrências de `text-xs`, além de textos explícitos de 9, 10 e 11 px. O mínimo recomendado para conteúdo recorrente é 12 px em legendas curtas; corpo e controles devem começar em 14 px, preferencialmente 16 px em formulários e texto principal.

### Navegação mobile incompleta

A barra inferior depende somente de ícones. Os nomes existem para leitores de tela, mas não ficam visíveis. “Comunidade” aparece desabilitada no meio da navegação e ainda aponta para a home. Destinos primários devem exibir ícone e rótulo; recursos futuros não entram na navegação até existirem.

### Desktop ainda não foi desenhado

Home, tarefas e módulos permanecem em uma coluna estreita, com a bottom bar fixa no centro da tela. Para B2C, o desktop deve usar um shell de 960–1120 px, navegação lateral compacta e uma grade que permita conteúdo principal e contexto secundário. Empresa e painel master precisam de um shell próprio com sidebar, cabeçalho e densidade maior.

### Estados de interação inconsistentes

Há 72 ocorrências de controles e links nas áreas avaliadas, mas poucos estilos explícitos de foco. Alguns controles removem `outline` sem colocar um substituto suficiente. Círculos de conclusão de tarefa têm 20 × 20 px, abaixo do alvo de toque de 44 × 44 px, ainda que a área visual possa permanecer menor.

### Linguagem visual fragmentada

Emojis exercem papel de ícone em banners e títulos, enquanto Hugeicons e Lucide aparecem no mesmo fluxo. As grafias `Alumia`, `Alumía`, `ALUM.iA` e `Alum.IA` também coexistem. A interface deve adotar Alumia como marca e reservar Alum.IA para a feature futura aprovada.

## Avaliação por tela

### Autenticação

**Forças:** a personagem cria reconhecimento imediato; a mensagem é acolhedora; o mobile tem composição clara e botão de ação evidente.

**Revisar:** textos secundários têm contraste baixo; campos dependem de placeholder; no desktop a arte ocupa uma faixa grande e o formulário permanece estreito abaixo dela; no mobile, a soma de hero, formulário, Google e links quase ocupa toda a altura antes da abertura do teclado.

**Direção:** mobile com hero entre 28% e 34% da altura e formulário em superfície contínua; desktop em composição dividida, com narrativa/arte em um lado e formulário no outro. Labels devem permanecer visíveis acima dos campos.

### Home

**Forças:** saudação, check-in, tarefas, hidratação e módulos formam uma boa visão do dia; a linguagem reduz cobrança.

**Revisar:** as duas faixas iniciais têm peso parecido; o card de tarefas repete a contagem; hidratação repete a ação da página completa; seis módulos ativos sugerem recursos que ainda não existem. A sequência exige bastante rolagem em telas menores.

**Direção:** cabeçalho compacto; check-in como ação principal; uma seção “Para hoje” com até três itens; hidratação em componente compacto; dois ou três atalhos de módulos realmente ativos. Informações repetidas devem sair.

### Tarefas

**Forças:** as categorias “importa hoje”, “marcou para hoje” e “pode esperar” traduzem bem a proposta da Alumia; os itens têm boa leitura.

**Revisar:** o banner explicativo domina o topo em todas as visitas; tabs e seções competem; metadados ficam pequenos; o FAB não se adapta ao desktop; emoji de lâmpada foge do sistema.

**Direção:** transformar a explicação em ajuda contextual dispensável; manter título, filtros e criação no cabeçalho; ampliar a área acionável do checkbox; usar botão textual no desktop e FAB somente no mobile.

### Módulos

**Forças:** a grade pastel é a expressão mais clara do universo visual da Alumia; cada módulo é fácil de reconhecer.

**Revisar:** “Módulos ativos” e “Módulos disponíveis” duplicam o mesmo catálogo; todos parecem utilizáveis; PRO e WIP aparecem como produto pronto; seis cores e vários switches aumentam ruído.

**Direção:** separar “Seus cuidados” de “Descobrir módulos”. Mostrar no primeiro grupo somente módulos ativos e funcionais. O catálogo usa estados claros: disponível, em breve e incluído em outro plano. Configuração opt-in deve acontecer no detalhe ou por uma única ação explícita.

### Hidratação

**Forças:** tom gentil, imagens e histórico criam contexto; progresso e registro rápido são compreensíveis.

**Revisar:** duas grandes introduções aparecem antes do tracker; o essencial fica abaixo da dobra; a personagem acenando é usada com texto alternativo de pessoa bebendo água; o texto repete “carinho” muitas vezes; três botões lado a lado deixam “Out...” truncado; emojis, Hugeicons e Lucide coexistem.

A rota também lê `localStorage` durante a inicialização do componente e falha na renderização SSR. A preferência precisa ser carregada após a montagem ou por uma abstração segura para browser/servidor.

**Direção:** colocar progresso e registro rápido imediatamente após o cabeçalho. Condensar orientação e meta em uma única faixa expansível. Usar opções de 200 ml, 500 ml e “Outro valor” com labels completos. Manter apenas uma ilustração contextual.

### Ajustes

**Forças:** agrupamento por perfil, preferências e conta; estrutura simples de percorrer.

**Revisar:** “Confira todo seu desempenho”, badges e contagens entram em conflito com a proposta sem pressão; existem métricas fictícias; textos de badge chegam a 9 px; o perfil ocupa muito espaço no topo; privacidade e segurança não têm destaque.

**Direção:** renomear para “Sua conta” ou “Preferências”; priorizar perfil, módulos, notificações, acessibilidade, privacidade, segurança e dados. Retirar desempenho, insígnias e números simulados. Mostrar informações de conta em linhas editáveis, com detalhe sob demanda.

## Norte visual da repaginação

O conceito recomendado é **clareza gentil**:

- acolhedora sem parecer infantil;
- calma sem perder contraste;
- leve sem esconder hierarquia;
- pessoal no B2C e profissional no B2B;
- expressiva por conteúdo, ilustração e tipografia, evitando decorar cada bloco.

### Sistema de superfícies

| Nível | Uso |
|---|---|
| Canvas | fundo principal, quase branco com leve tom lavanda |
| Surface | grupos de conteúdo que precisam de contorno |
| Subtle | mensagens e agrupamentos discretos |
| Elevated | sheets, dialogs, menus e ações flutuantes |
| Brand tone | destaques de módulo, nunca como substituto de estado semântico |

### Escala tipográfica inicial

| Papel | Tamanho sugerido |
|---|---:|
| Display de autenticação | 32–40 px desktop, 28–32 px mobile |
| Título de página | 28–32 px desktop, 24–28 px mobile |
| Título de seção | 18–20 px |
| Corpo | 16 px |
| Corpo compacto/controle | 14 px |
| Legenda | 12 px, apenas para conteúdo secundário |

### Responsividade

- **360–639 px:** bottom navigation com ícone e rótulo, conteúdo de uma coluna.
- **640–959 px:** conteúdo de uma ou duas colunas conforme a feature, largura confortável.
- **960 px ou mais:** sidebar B2C compacta e canvas de até 1120 px.
- **B2B/admin:** sidebar persistente a partir de desktop, tabelas e filtros próprios, sem reutilizar a bottom bar.

## Componentes a consolidar primeiro

1. `AlumiaIcon`, removendo Lucide do produto.
2. `AppShell`, `PageHeader`, `BottomNavigation` e `Sidebar`.
3. `Button`, `IconButton` e links com quatro níveis de ênfase.
4. `FormField`, labels, ajuda, erro e estados de foco.
5. `Card` com variantes `surface`, `subtle`, `interactive` e `elevated`.
6. `SectionHeader`, `EmptyState`, `InlineFeedback` e `Skeleton`.
7. `ModuleCard` com estados funcional, inativo, em breve e restrito por plano.

## Ordem recomendada

### Etapa 1 — fundação visual

- completar tokens claro/escuro;
- retirar hexadecimais das features;
- fixar escala de tipografia, espaçamento, radius e sombra;
- criar `AlumiaIcon` e estados de foco;
- documentar exemplos dos componentes base.

### Etapa 2 — shell e autenticação

- redesenhar navegação mobile e desktop;
- criar shells separados para B2C e áreas operacionais;
- revisar login, cadastro, recuperação e perfil.

### Etapa 3 — vertical B2C principal

- repaginar home;
- consolidar tarefas e seu fluxo de criação;
- trazer o tracker de hidratação para o topo e reduzir texto repetido.

### Etapa 4 — catálogo e preferências

- unificar módulos ativos e catálogo;
- reconstruir ajustes em torno de conta, acessibilidade, privacidade e segurança;
- remover recursos simulados e módulos fora do MVP.

## Critério para começar a implementação

A primeira mudança visual deve ser uma pequena fundação reutilizável, não a edição isolada de uma página. Um incremento de repaginação está pronto para começar quando definir tokens finais, escala tipográfica, shell responsivo, navegação, componentes de formulário, cards e estados de módulo. Depois disso, autenticação e home podem servir como prova do novo sistema antes de migrar as demais telas.
