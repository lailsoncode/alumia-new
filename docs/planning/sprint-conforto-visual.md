# Sprint de conforto visual B2C

**Data:** 22 de setembro de 2026

**Branch:** `feat/design-comfort-sprint`

**Estado:** concluído e validado

## Objetivo

Recuperar a sensação acolhedora percebida na versão anterior da Alumia sem desfazer a repaginação atual. O sprint mantém as funções reais, a acessibilidade e o uso de Hugeicons, enquanto torna a interface mais leve, humana e previsível.

## Entrega concentrada

- fundo frio mais presente, cartões claros, cantos amplos e sombras difusas;
- mais espaço entre cabeçalhos, seções e ações;
- saudação com acento visual, avatar e troca de tema sempre acessível;
- navegação inferior em cápsula flutuante no mobile e sidebar preservada no desktop;
- textos de cuidado mais humanos, com “gestos”, “no seu ritmo” e “sem cobrança”;
- ajuda de organização sempre visível na tela de tarefas;
- grupos “Importa hoje”, “Marcado para hoje” e “Pode esperar” mantidos mesmo quando vazios;
- estados vazios próprios para cada grupo, sem transformar ausência de tarefas em erro;
- hierarquia e acentos cromáticos consistentes em home, tarefas, hidratação, módulos e ajustes;
- hidratação apresentada como acompanhamento pessoal, sem alegação clínica;
- módulos futuros continuam identificados como “Em breve” e não ganham ações falsas.

## Decisões preservadas

- Hugeicons permanece como a única biblioteca de ícones do produto;
- as rotas, integrações e regras de negócio não foram alteradas;
- Comunidade, Alum.IA, Estudante e outros módulos incompletos não foram reintroduzidos;
- o tema escuro recebeu a mesma hierarquia do tema claro;
- alvos de toque, foco visível, safe areas e redução de movimento continuam obrigatórios.

## Evidências

| Verificação | Resultado |
|---|---|
| `npm test` | 11 testes aprovados |
| `npm run typecheck` | aprovado |
| `npm run lint` | 0 erros; 7 avisos legados de Fast Refresh |
| `npm run build` | cliente e SSR aprovados |
| 360 × 800 | sem overflow horizontal; navegação inferior ativa |
| 390 × 844 | home, tarefas, hidratação e módulos inspecionados |
| 768 × 1024 | sem overflow horizontal; navegação inferior ativa |
| 1024 × 768 | sem overflow horizontal; sidebar ativa |
| 1440 × 900 | tarefas inspecionadas em duas colunas |
| temas claro e escuro | inspecionados visualmente |
| console da prévia | sem erros ou avisos |
| contraste dos pares recorrentes | mínimo medido de 5,82:1 no claro e 6,92:1 no escuro |

## Resultado

A versão atual conserva sua organização e maturidade técnica, mas agora usa os elementos que tornavam o protótipo anterior mais confortável: fundo respirável, superfícies macias, orientação explícita, cor em pequenas doses e linguagem que acompanha sem pressionar.
