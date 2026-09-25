# Especificação do design system

**ID:** `DS`

**Versão:** 0.2.0

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
- cabeçalho pessoal como faixa estrutural da página, sem aparência flutuante, reunindo saudação, contexto e avatar;
- orientação visível quando a organização de uma tela não for autoevidente;
- estados vazios que preservem a estrutura da jornada e usem linguagem acolhedora.
- módulos ativos da home agrupados em uma única superfície, com opções compactas em duas colunas, edição no rodapé e raios contidos de 20 px no bloco e 14 px nas opções.

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

## 3. Hugeicons

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

## 4. Componentes base

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

## 5. Responsividade

- B2C: projetado primeiro para 360 px, com conteúdo confortável até desktop;
- empresa e platform admin: sidebar em desktop e drawer em telas menores;
- formulários nunca dependem de hover;
- tabelas críticas oferecem alternativa responsiva por cartões ou rolagem com cabeçalho contextual;
- navegação inferior B2C mostra no máximo cinco destinos primários.
- navegação inferior B2C usa uma superfície flutuante com safe area e não encobre o fim do conteúdo;
- a partir do breakpoint desktop, a navegação inferior dá lugar à sidebar.
- páginas B2C usam 16–24 px entre blocos relacionados e 20–32 px nas margens estruturais;
- cartões usam normalmente 16–24 px de padding, mantendo alvos de toque com pelo menos 44 × 44 px;
- a largura útil cresce no desktop até 1280 px para evitar grandes áreas laterais vazias.

## 6. Acessibilidade

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

## 7. Linguagem

Nome oficial: **Alumia**.  
Nome do recurso futuro de IA: **Alum.IA**, somente quando a feature for aprovada.

Glossário inicial:

- “gesto de cuidado”, não “meta obrigatória”;
- “pode esperar”, não “atrasada” no contexto B2C;
- “check-in emocional”, não “diagnóstico”;
- “fator de risco psicossocial relacionado ao trabalho”, não “perfil psicológico do funcionário”;
- “participante”, não “paciente” no fluxo ocupacional;
- “apoio ao processo”, não “conformidade garantida”.

## 8. Critérios de aceitação do design system

- `DS-AC-001`: todos os ícones acionáveis têm nome acessível;
- `DS-AC-002`: navegação atual é exposta semanticamente e pela URL;
- `DS-AC-003`: tokens passam por verificação automatizada de contraste nos pares definidos;
- `DS-AC-004`: componentes de formulário funcionam apenas com teclado;
- `DS-AC-005`: os quatro estados de dados existem: loading, vazio, erro e sucesso;
- `DS-AC-006`: não há strings “Adcionar”, “Modulos”, “crecer” ou variações do nome oficial no produto novo.
- `DS-AC-007`: telas de cuidado mantêm orientação e estados vazios compreensíveis sem ocultar a estrutura principal.
- `DS-AC-008`: pares de texto recorrente e tons editoriais atingem contraste AA nos temas claro e escuro.
