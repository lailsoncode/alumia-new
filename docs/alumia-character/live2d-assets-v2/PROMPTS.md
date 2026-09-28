# Registro das edições de imagem — Live2D v2

As três edições foram feitas com a ferramenta integrada de geração de imagens. Todas usam `source/00-canonical-idle.png` como única referência visual. Os textos abaixo registram a intenção completa dos prompts; o empacotamento posterior restringe as variações por máscaras locais.

## Rosto limpo

Editar o busto canônico como uma placa de preenchimento de produção, sem redesenhar. Preservar canvas 1312 × 1199, transparência, identidade, perspectiva, inclinação, silhueta e cachos do cabelo, orelhas, contorno do rosto, nariz, pescoço, camiseta, luz, cores e textura. Remover somente armação e hastes dos óculos, sobrancelhas, olhos completos e linha da boca; preencher as áreas removidas com pele e sombreamento vizinhos. Não reenquadrar, girar, espelhar, redimensionar, simplificar ou repintar outras áreas.

## Boca aberta

Editar somente o sorriso pequeno para uma boca de fala discretamente aberta, no mesmo centro e aproximadamente na mesma largura. Preservar integralmente todo o restante da imagem, incluindo olhos, óculos, cabelo e perspectiva. Usar interior escuro, língua sutil e nenhum dente. Não alterar o entorno dos olhos nem qualquer outra área.

## Boca O

Editar somente o sorriso pequeno para um fonema O sutil, centralizado na mesma posição e mais estreito que o sorriso. Preservar integralmente todo o restante da imagem. Usar abertura interna escura, sem dentes e sem exagero de expressão.

## Regra de uso

Os resultados completos não são usados como novos mestres. O script extrai somente regiões locais e mantém `source/00-canonical-idle.png` como repouso visível exato. O rosto limpo fica oculto e serve apenas como preenchimento sob deformações.
