# Alumia — material-base para Live2D

Este diretório contém a primeira separação técnica da Alumia para rig no Live2D Cubism. O objetivo desta versão é validar a construção por partes antes de investir no refinamento definitivo do desenho e das deformações.

## Arquivo principal

- `package/alumia-live2d-material-v1.psd`: PSD em RGB, 1312 × 1199 px, com grupos e transparência por peça.
- `package/alumia-live2d-material-v1.cmo3`: primeiro projeto Cubism importado e salvo no Live2D 5.3.
- `package/alumia-live2d-recomposed-preview.png`: recomposição automática das peças visíveis.
- `package/alumia-live2d-comparison.png`: referência canônica à esquerda e recomposição à direita.
- `package/live2d-import-validated.jpg`: registro visual da composição e da hierarquia reconhecidas pelo Cubism.
- `RIG.md`: hierarquia, parâmetros, estados e critérios de aprovação do primeiro rig funcional.
- `RIG-PARAMETERS.json`: contrato dos parâmetros que o aplicativo usará para controlar o modelo.

O PSD mantém a referência canônica como uma camada-guia oculta. As alternativas de olhos fechados e boca aberta/O também começam ocultas.

## Peças disponíveis

- cabelo traseiro e cabelo frontal;
- corpo, pescoço e camiseta;
- rosto-base sem feições;
- óculos;
- sobrancelhas independentes;
- olhos independentes, com branco, pupila, cílios, guia de olho aberto e pálpebra fechada;
- bocas de repouso/sorriso, aberta e formato O.

## Regenerar o pacote

```bash
npm ci
npm run package
```

Os PNGs originais ficam em `layers/`. O script normaliza posição e tamanho no canvas, recompõe a prévia e gera novamente o PSD. Os prompts usados na criação das peças estão versionados nos arquivos `prompts*.json`.

## Estado e limites desta versão

Este é um material de rig v1, não um modelo final. A personagem já é reconhecível e está tecnicamente separada, mas a recomposição ainda não é idêntica à referência: perspectiva do rosto, recorte do cabelo frontal, olhos e encaixe dos óculos precisam de uma rodada de acabamento artístico depois da validação dentro do Cubism.

O PSD já foi importado no Live2D 5.3, teve sua ordem de profundidade corrigida e foi salvo como `.cmo3`. O Cubism reconheceu as partes como ArtMeshes independentes e preservou os grupos. A próxima etapa é construir o rig conforme `RIG.md`: piscada e pupilas, boca/fala, inclinação do rosto, balanço de cabelo e respiração.
