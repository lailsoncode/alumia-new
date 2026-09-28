# Alumia — guia canônico da personagem

## Direção

A Alumia é uma personagem chibi 2D adulta, acolhedora e tranquila. Sua função é acompanhar e facilitar escolhas, nunca vigiar, cobrar ou representar fracasso.

Para o estudo atual de busto, `reference-pack-v2/alumia-bust-master-v2.png` é a referência direta de montagem, ainda sujeita à aprovação visual do usuário. `model-sheet-v1.png` continua como guia de identidade e corpo inteiro. Quando as pranchas v2 divergirem entre si, preservar o busto-base, sem combinar traços de desenhos diferentes.

## Elementos imutáveis

- Silhueta arredondada do cabelo cacheado castanho-escuro.
- Pele marrom de tom quente.
- Óculos grandes, redondos e dourado-amarronzados.
- Sobrancelhas escuras e expressivas.
- Camiseta coral, calça verde-petróleo e tênis creme.
- Proporção aproximada de três cabeças de altura.
- Formas arredondadas, contornos limpos e sombreamento suave.
- Flor amarela luminosa como símbolo de cuidado e presença.

## Linguagem emocional

Permitido: calma, curiosidade, escuta, acolhimento, orgulho gentil, celebração breve e preocupação serena.

Evitar: raiva, decepção, culpa, urgência artificial, tristeza usada como pressão, apontar erros ou exigir retorno.

## Movimento

- Repouso lento, com deslocamentos de poucos pixels.
- Entradas e reações entre 600 e 900 ms.
- Curvas suaves; sem pulos repetitivos ou tremores.
- Celebrações curtas e proporcionais à ação.
- Respeitar `prefers-reduced-motion` e oferecer controle em Ajustes.

## Produção

### Atualização: material Live2D v2 com repouso canônico

O conjunto `live2d-assets-v2/` substitui a estratégia visual da primeira separação. No estado de repouso, a camada visível é o próprio `reference-pack-v2/alumia-bust-master-v2.png`, sem redesenho ou recomposição. A verificação automatizada deve continuar retornando diferença zero entre a referência e o repouso.

Piscada e fala são sobreposições locais, limitadas ao interior das lentes e à região da boca. Imagens geradas podem preencher áreas que estavam escondidas, mas não têm autoridade para substituir cabelo, formato do rosto, óculos, corpo, perspectiva ou enquadramento. O material v1 permanece apenas como histórico técnico e não deve orientar a aparência final.

### Atualização: busto ilustrado v2

O conjunto `reference-pack-v2/` deriva da arte original e define as referências atuais de busto, vistas e expressões. O protótipo simplificado em formas geométricas foi rejeitado por perder a identidade. Consultar `reference-pack-v2/README.md` para regras de consistência e limitações.

O estudo em `rive-project/` preserva a ilustração como textura e usa recursos nativos do Rive para articulação. A versão ativa do aplicativo é `alumia-bust-v2.riv`, com o artboard `Alumia · busto fiel` e a máquina `AlumiaPresence`. A montagem deve separar as partes sem alterar o desenho; não redesenhar a personagem por aproximação. O arquivo antigo `rive-project.riv` e os materiais Live2D continuam preservados como estudos, mas não são o ativo padrão.

### Histórico da primeira etapa

O PNG transparente v1 foi o ativo inicial do aplicativo. A proposta original de redesenho vetorial foi substituída pela preservação da ilustração em camadas. A próxima montagem deve separar cabelo, rosto, olhos, boca, braços e corpo sem alterar a identidade. O aplicativo deverá consumir uma única máquina de estados, sem gerar a personagem em tempo de execução.

Estados planejados: `idle`, `wave`, `listen`, `think`, `care`, `celebrate`, `breathe`, `appear` e `hide`.
