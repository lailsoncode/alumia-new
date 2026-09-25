# Especificação do design system

**ID:** `DS`

**Versão:** 0.3.0

**Estado:** proposed

## 1. Direção visual

O sistema preserva do protótipo FlutterFlow:

- sensação acolhedora e leve;
- paleta clara com azul suave;
- ilustração amigável;
- textos curtos e gentis;
- módulos apresentados como escolhas, sem cobrança.

A implementação deve corrigir contraste baixo, controles sem rótulo, inconsistências de nome e navegação sem URL própria.

A camada de conforto B2C deve usar:

- fundo muito claro com o viés lavanda da paleta original, superfícies claras e separação suave;
- cartões amplos, cantos generosos e sombras discretas, apoiadas por bordas suaves;
- respiro entre blocos para que a tela não pareça uma sequência de cobranças;
- pequenos acentos em amarelo, ciano, menta, pêssego e lavanda para orientar seções;
- saudação personalizada e navegação inferior flutuante no mobile;
- cabeçalho pessoal como faixa estrutural da página, sem aparência flutuante, reunindo saudação, contexto da tela e avatar; a biografia ou frase livre do usuário aparece apenas no perfil;
- saudação e contexto aparecem no mesmo bloco, sem divisória interna; na Home, o contexto é uma mensagem fixa de acolhimento, sem cobrança ou linguagem de produtividade;
- orientação visível quando a organização de uma tela não for autoevidente;
- estados vazios que preservem a estrutura da jornada e usem linguagem acolhedora.
- ícones decorativos dos blocos B2C apresentados diretamente, sem círculos ou quadrados coloridos ao redor;
- títulos dos blocos B2C alinhados visualmente com seus ícones na primeira linha, independentemente da presença de descrição;
- tela de tarefas inicia a jornada com uma orientação ilustrada usando `tasks.webp`, seguida da navegação sublinhada entre “Hoje” e “Em breve”, e mantém a criação de tarefa em uma ação flutuante em todas as larguras;
- módulos ativos da home agrupados em uma única superfície, com opções compactas em duas colunas, edição no rodapé e raios contidos de 20 px no bloco e 14 px nas opções.
- página de módulos organizada em grade colorida para os módulos funcionais e catálogo em linhas para comunicar estados “Ativo” e “Em breve”; somente módulos funcionais oferecem a ação “Acessar”.

Essas escolhas não autorizam dados simulados, módulos incompletos apresentados como ativos ou perda de contraste para obter uma aparência mais suave.

## 2. Tokens

Tokens semânticos obrigatórios:

- `background`, `foreground`;
- `surface`, `surface-subtle`, `surface-elevated`;
- `primary`, `primary-foreground`;
- `secondary`, `secondary-foreground`;
- `muted`, `muted-foreground`;
- `success`, `warning`, `danger`, `info`;
- `border`, `focus-ring`;
- `care-positive`, `care-difficult`, `care-neutral`;
- escala de radius, shadow, spacing, typography e motion.

`DS-TOK-001`: componentes não usam cores hexadecimais diretamente.  
`DS-TOK-002`: tokens possuem pares claro e escuro.  
`DS-TOK-003`: estado nunca é comunicado somente por cor.  
`DS-TOK-004`: tema empresarial pode alterar marca, sem alterar semântica de segurança.

## 3. Identidade visual por módulo

A Alumia funciona como um ecossistema de módulos com linguagem e navegação compartilhadas. Cada módulo possui uma identidade cromática própria que acompanha a pessoa dentro da experiência e também identifica conteúdos originados nele quando aparecem em superfícies compartilhadas.

| Chave | Identidade | Uso principal |
|---|---|---|
| `alumia_ai` | turquesa | conversa e automações futuras da Alum.IA |
| `tasks` | azul | organização e tarefas manuais |
| `checkin` | lilás | check-in emocional |
| `mindfulness` | menta | práticas de mindfulness |
| `hydration` | ciano | hidratação, progresso e registros de água |
| `student` | índigo | atividades e tarefas do módulo Estudante |

Cada entrada do registro de módulos fornece ao menos:

- `moduleKey`, nome e ícone Hugeicons;
- `soft`, para fundos suaves;
- `accent`, para bordas, ícones, controles e progresso;
- `strong`, para texto ou ênfase com contraste;
- `onAccent`, para conteúdo sobre o acento;
- equivalentes válidos nos temas claro e escuro.

A implementação expõe esses valores por variáveis semânticas locais, como `--module-soft`, `--module-accent`, `--module-strong`, `--module-border` e `--module-on-accent`. Páginas e componentes consomem o tema pelo `moduleKey`; não escolhem classes de cor isoladamente.

- `DS-MOD-001`: ao entrar em um módulo, bordas, botões, ícones, seleção, foco, progresso, gráficos e superfícies de destaque herdam seu tema.
- `DS-MOD-002`: o shell comum continua reconhecível; o estado ativo da navegação pode herdar o módulo atual.
- `DS-MOD-003`: conteúdo exibido fora de seu módulo mantém a identidade da origem. Uma tarefa de hidratação mantém borda, controles, ícone e marcador cianos na Home e na lista geral, sobre fundo claro neutro.
- `DS-MOD-004`: a identidade vem de `moduleKey` persistido ou fornecido pelo contexto. Texto como “beber água” não é analisado para escolher cor.
- `DS-MOD-005`: tarefa criada manualmente no gerenciador geral usa `moduleKey = tasks`.
- `DS-MOD-006`: cores semânticas de erro, alerta, sucesso, prioridade e acessibilidade não são substituídas pela cor do módulo.
- `DS-MOD-007`: cor nunca é o único sinal da origem; ícone e nome acessível acompanham o tema quando a origem for relevante.
- `DS-MOD-008`: módulos futuros podem ter tokens reservados sem serem apresentados como disponíveis.
- `DS-MOD-009`: superfícies grandes usam apenas um véu pastel do módulo; superfícies repetidas, como tarefas e linhas do catálogo, usam um tingimento quase branco. A cor mais concentrada fica restrita a elementos pequenos de orientação e ação.
- `DS-MOD-010`: no catálogo, módulos inativos mantêm borda, ícone e tingimento suave de identidade, mas o toggle desligado permanece neutro para não sugerir ativação.

## 4. Hugeicons

A biblioteca padrão é Hugeicons, conjunto gratuito **Stroke Rounded**.

Criar wrapper:

```tsx
<AlumiaIcon icon={Home01Icon} size="md" label="Início" />
```

Contrato:

- tamanhos `xs`, `sm`, `md`, `lg` e `xl`;
- stroke centralizado no wrapper;
- `label` obrigatório para ação sem texto;
- ícone decorativo usa `aria-hidden`;
- imports são individuais para permitir tree-shaking;
- uma nova biblioteca de ícones exige ADR.

## 5. Componentes base

P0:

- Button, IconButton, LinkButton;
- Input, Textarea, Select, Checkbox, RadioGroup, Switch;
- FormField, FieldError;
- Card, ModuleCard, EmptyState;
- Dialog, Drawer, Sheet;
- Tabs com URL quando representam navegação;
- Toast;
- Skeleton, Spinner e InlineError;
- AppHeader, BottomNavigation e Sidebar;
- DataTable, Pagination e FilterBar para painéis;
- StatusBadge;
- SensitiveDataNotice;
- ConfirmActionDialog.

## 6. Responsividade

- B2C: projetado primeiro para 360 px, com conteúdo confortável até desktop;
- empresa e platform admin: sidebar em desktop e drawer em telas menores;
- formulários nunca dependem de hover;
- tabelas críticas oferecem alternativa responsiva por cartões ou rolagem com cabeçalho contextual;
- navegação inferior B2C mostra no máximo cinco destinos primários.
- navegação inferior B2C usa uma superfície flutuante com safe area e não encobre o fim do conteúdo;
- a partir do breakpoint desktop, a navegação inferior dá lugar à sidebar.
- páginas B2C usam normalmente 8–16 px entre blocos relacionados e 16–24 px nas margens estruturais;
- cartões usam normalmente 14–20 px de padding, mantendo alvos de toque com pelo menos 44 × 44 px;
- a largura útil cresce no desktop até 1280 px para evitar grandes áreas laterais vazias.

## 7. Acessibilidade

Critérios obrigatórios:

- WCAG 2.2 AA nos fluxos essenciais;
- foco visível com contraste suficiente;
- `aria-live` para confirmações e erros assíncronos relevantes;
- heading hierarchy sem saltos estruturais;
- mensagens de erro ligadas ao campo;
- labels persistentes, sem depender apenas de placeholder;
- alvo de toque mínimo de 44 × 44 CSS px;
- zoom a 200% sem perda do fluxo;
- redução de movimento;
- áudio com alternativa textual;
- gráfico B2B acompanhado de tabela ou descrição equivalente.

## 8. Linguagem

Nome oficial: **Alumia**.  
Nome do recurso futuro de IA: **Alum.IA**, somente quando a feature for aprovada.

Glossário inicial:

- “gesto de cuidado”, não “meta obrigatória”;
- “pode esperar”, não “atrasada” no contexto B2C;
- “check-in emocional”, não “diagnóstico”;
- “fator de risco psicossocial relacionado ao trabalho”, não “perfil psicológico do funcionário”;
- “participante”, não “paciente” no fluxo ocupacional;
- “apoio ao processo”, não “conformidade garantida”.

## 9. Critérios de aceitação do design system

- `DS-AC-001`: todos os ícones acionáveis têm nome acessível;
- `DS-AC-002`: navegação atual é exposta semanticamente e pela URL;
- `DS-AC-003`: tokens passam por verificação automatizada de contraste nos pares definidos;
- `DS-AC-004`: componentes de formulário funcionam apenas com teclado;
- `DS-AC-005`: os quatro estados de dados existem: loading, vazio, erro e sucesso;
- `DS-AC-006`: não há strings “Adcionar”, “Modulos”, “crecer” ou variações do nome oficial no produto novo.
- `DS-AC-007`: telas de cuidado mantêm orientação e estados vazios compreensíveis sem ocultar a estrutura principal.
- `DS-AC-008`: pares de texto recorrente e tons editoriais atingem contraste AA nos temas claro e escuro.
- `DS-AC-009`: cada rota de módulo aplica o conjunto correto de tokens sem classes de cor duplicadas na página.
- `DS-AC-010`: um item com `moduleKey = hydration` mantém cor e ícone de Hidratação na Home e em Tarefas.
- `DS-AC-011`: remover a cor ainda permite identificar a origem do conteúdo por texto acessível ou ícone nomeado.
