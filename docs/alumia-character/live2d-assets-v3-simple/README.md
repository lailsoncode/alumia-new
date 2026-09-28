# Alumia — Live2D v3 simples e funcional

Esta é a montagem reduzida para validar comportamento antes de construir um rig facial grande.

## O que fica fixo

- dorso, camiseta, cabelo, óculos, nariz, orelhas e contorno do rosto;
- a arte de repouso inteira é o PNG canônico, sem redesenho;
- o movimento do corpo não faz parte desta etapa.

## O que pode animar

- piscada independente dos olhos;
- sobrancelhas elevadas para escuta;
- boca aberta para fala;
- boca O para fonemas;
- inclinação curta da cabeça para esquerda/direita, feita na malha da camada canônica. O dorso permanece ancorado.

O PSD não tenta separar cabelo, armação, nariz ou pescoço. A camada `Base canônica · repouso exato · dorso fixo` deve receber uma malha com a linha inferior ancorada; somente a região da cabeça recebe o deformer de inclinação. As sobreposições ficam ocultas no repouso e são ativadas por parâmetros simples.

## Arquivos

- `package/alumia-live2d-material-v3-simple.psd`: material para importar no Cubism.
- `package/alumia-live2d-v3-simple-states.png`: repouso, piscada, fala aberta, fala O e escuta.
- `package/alumia-live2d-v3-simple-identity-check.png`: comparação da referência com o repouso.
- `package/identity-report.json`: o repouso deve continuar com diferença zero.

## Parâmetros mínimos

| Parâmetro | Uso |
| --- | --- |
| `ParamAngleX` | cabeça poucos graus para esquerda/direita; dorso ancorado |
| `ParamEyeLOpen` / `ParamEyeROpen` | mostrar ou ocultar cada piscada |
| `ParamBrowY` | ativar a sobreposição de escuta |
| `ParamMouthOpenY` | alternar repouso, boca aberta e O |

Não há fala sincronizada nem física de cabelo nesta versão. Essas extensões só entram depois que esta leitura simples for aprovada visualmente.

## Regenerar

```bash
npm ci
npm run package
```

