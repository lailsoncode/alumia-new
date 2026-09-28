# Alumia — referências do busto v2

Conjunto produzido em 27/09/2026 com a ferramenta integrada de geração de imagens. As fontes de identidade foram `../alumia-chibi-idle-master-v1.png` e `../model-sheet-v1.png`. A primeira imagem abaixo passou a ser a referência direta das demais; os desenhos geométricos anteriores foram rejeitados e não devem orientar novas versões.

## Arquivos

- `alumia-bust-master-v2.png`: busto-base transparente, 1312 × 1199. Arte usada no estudo animado.
- `alumia-bust-turnaround-v2.png`: frente, três quartos e perfil. Guia de proporções; não é uma folha de peças recortáveis.
- `alumia-bust-expressions-v2.png`: repouso, escuta, piscada, pensamento, acolhimento e alegria. Guia de expressões; não é uma sequência de quadros.
- `alumia-bust-blink-v2.png`: variação transparente de olhos fechados, no mesmo enquadramento da base. O estudo Rive usa apenas o interior das lentes dessa imagem.

## Consistência

Manter a identidade da base: formato da face, proporção e posição dos óculos, sobrancelhas, pele, divisão e volume dos cachos e camiseta coral. O cabelo fica atrás da cabeça e ao lado do pescoço, sem cobrir a gola e o centro do peito. Enquadramento somente de busto para o avatar móvel.

As pranchas são referências geradas, sujeitas a pequenas diferenças entre vistas. Elas não substituem o alinhamento e a revisão de cada peça durante a montagem. Usar o busto-base como autoridade quando houver divergência.

## Estudo Rive atual

O projeto em `../rive-project` incorpora a ilustração original, uma malha com 754 vértices, ossos de cabeça e busto, respiração suave e uma sobreposição mascarada para a piscada. O cabelo, os óculos e o rosto não foram redesenhados em formas simplificadas. Uma deformação de olhos que afetava a armação foi removida.

É uma prova de consistência e movimento, não o rig facial completo. Ainda faltam camadas independentes de boca, pupilas, sobrancelhas, cabelo frontal/traseiro, braços/mãos e flor. As reações de aproximação e toque atuais são discretas; não representam reconhecimento de voz ou compreensão emocional.

## Próxima montagem completa

1. Preservar o busto-base e sua escala como guia de registro.
2. Preparar rosto com áreas escondidas preenchidas, pescoço e tronco; separar cabelo traseiro e frontal.
3. Separar armação, sobrancelhas, pálpebras, brancos dos olhos e pupilas, mantendo todos no mesmo sistema de coordenadas.
4. Criar formas de boca a partir da mesma face. Preparar fala em etapa própria; uma boca abrindo por volume não equivale a sincronização labial.
5. Conferir o encaixe parado contra a base antes de criar movimentos amplos.
6. Testar a silhueta, os olhos e a leitura de expressão em 64, 96 e 128 pixels, respeitando movimento reduzido.

Os prompts usados estão em `PROMPTS.md`.
