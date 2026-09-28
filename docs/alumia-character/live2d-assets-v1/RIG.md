# Rig Live2D da Alumia

Este documento define o primeiro rig funcional da Alumia como um busto vivo para dispositivos móveis. A prioridade é transmitir presença e afeto com movimentos pequenos, sem transformar a personagem em um elemento inquieto ou invasivo.

## Resultado da primeira versão

A primeira versão deve entregar:

- piscada natural e independente;
- olhar acompanhando suavemente o ponto de atenção;
- boca preparada para fala e futura sincronização com voz;
- leve inclinação da cabeça;
- respiração discreta no busto;
- reação secundária do cabelo;
- seis estados emocionais reutilizáveis pelo aplicativo.

Pernas e corpo inteiro ficam fora deste rig. O enquadramento oficial é busto, com margem suficiente para o cabelo não ser cortado durante as inclinações.

## Hierarquia de deformadores

```text
AlumiaRoot
└── Bust
    ├── Body
    └── Head
        ├── HairBack
        ├── Face
        │   ├── BrowLeft
        │   ├── BrowRight
        │   ├── EyeLeft
        │   │   ├── EyeWhiteLeft
        │   │   ├── PupilLeft
        │   │   ├── LashLeft
        │   │   └── ClosedLidLeft
        │   ├── EyeRight
        │   │   ├── EyeWhiteRight
        │   │   ├── PupilRight
        │   │   ├── LashRight
        │   │   └── ClosedLidRight
        │   ├── Mouth
        │   └── Glasses
        └── HairFront
```

Os óculos acompanham o rosto como um objeto rígido. Eles não devem ondular, esticar ou mudar a espessura da armação.

## Parâmetros

| Parâmetro | Intervalo | Função |
| --- | ---: | --- |
| `ParamAngleX` | -30 a 30 | rotação horizontal da cabeça |
| `ParamAngleY` | -20 a 20 | inclinação vertical da cabeça |
| `ParamAngleZ` | -10 a 10 | inclinação lateral da cabeça |
| `ParamEyeLOpen` | 0 a 1 | abertura do olho esquerdo |
| `ParamEyeROpen` | 0 a 1 | abertura do olho direito |
| `ParamEyeBallX` | -1 a 1 | direção horizontal das pupilas |
| `ParamEyeBallY` | -1 a 1 | direção vertical das pupilas |
| `ParamBrowLY` | -1 a 1 | expressão da sobrancelha esquerda |
| `ParamBrowRY` | -1 a 1 | expressão da sobrancelha direita |
| `ParamMouthForm` | -1 a 1 | expressão da boca: calma a sorriso |
| `ParamMouthOpenY` | 0 a 1 | abertura da boca e sincronização de fala |
| `ParamBodyAngleX` | -10 a 10 | balanço horizontal do busto |
| `ParamBodyAngleZ` | -5 a 5 | inclinação lateral do busto |
| `ParamBreath` | 0 a 1 | respiração sutil |
| `ParamHairFront` | -1 a 1 | atraso do cabelo frontal |
| `ParamHairSide` | -1 a 1 | atraso dos cachos laterais |
| `ParamHairBack` | -1 a 1 | atraso da massa traseira do cabelo |

## Ordem de construção

1. Gerar malhas apenas nas áreas visíveis de cada recorte, sem usar a camada-guia como ArtMesh final.
2. Montar os deformadores de busto, cabeça e rosto.
3. Fazer a piscada com três formas: aberta, intermediária e fechada.
4. Limitar as pupilas ao interior dos olhos com clipping, evitando que escapem pelo contorno.
5. Construir a boca com repouso, sorriso, aberta e formato O.
6. Ligar cabeça, óculos, sobrancelhas e boca aos ângulos X, Y e Z.
7. Adicionar respiração e pequeno balanço do busto.
8. Configurar física leve nos cachos, sem aspecto elástico.
9. Criar expressões e animações ociosas.
10. Exportar e validar no tamanho real usado pelo aplicativo.

## Estados da Alumia

| Estado | Movimento | Uso no aplicativo |
| --- | --- | --- |
| `idle` | respira, pisca e olha com calma | presença padrão |
| `attentive` | olhar focado e leve inclinação | quando há uma ação possível |
| `listening` | boca fechada e olhar receptivo | futura conversa por voz |
| `speaking` | boca sincronizada e cabeça suave | respostas em voz |
| `celebrate` | sorriso, olhos alegres e pequeno impulso | conquistas não punitivas |
| `calm` | olhos semicerrados e respiração mais lenta | pausas, meditação e acolhimento |

Não haverá estado de punição, tristeza acusatória ou cobrança por sequência quebrada. A personagem pode acolher uma ausência, mas nunca demonstrar decepção com a pessoa.

## Comportamento no aplicativo

- A animação ociosa deve durar de 6 a 10 segundos e ter pausas reais entre movimentos.
- A piscada deve variar entre 2,5 e 6 segundos para não parecer mecânica.
- O olhar segue o toque ou cursor com atraso e alcance reduzidos.
- A intensidade geral deve cair quando a tela contém formulários, textos longos ou práticas de concentração.
- O usuário poderá reduzir movimento; nesse modo, ficam apenas piscada lenta e respiração quase imperceptível.
- O modelo não deve cobrir botões, campos ou a navegação inferior.

## Preparação para voz

O rig de boca usa `ParamMouthOpenY` desde a primeira versão. No futuro, o aplicativo poderá alimentar esse parâmetro com a amplitude do áudio e combinar `ParamMouthForm` com fonemas simples. Os estados `listening` e `speaking` já deixam reservado o comportamento visual da conversa.

## Critérios de aprovação

- a silhueta continua reconhecível em 96 px, 144 px e 220 px de largura;
- óculos, olhos e cabelo permanecem coerentes com a referência canônica;
- nenhum recorte transparente aparece como retângulo durante o movimento;
- a piscada não desloca os óculos nem deforma o rosto;
- a boca não desliza pela face ao mover a cabeça;
- cabelo e busto retornam ao repouso sem efeito de mola exagerado;
- em modo reduzido, a Alumia continua viva sem chamar atenção excessiva;
- o modelo mantém 60 fps em um aparelho móvel intermediário.

