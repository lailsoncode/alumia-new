# Alumia — material Live2D v2 com identidade preservada

Esta versão corrige o principal problema visual da v1: a personagem não é mais recomposta a partir de partes redesenhadas. O estado de repouso usa diretamente todos os pixels do busto canônico.

## Regra de identidade

- `source/00-canonical-idle.png` é a autoridade visual.
- A camada visível de repouso no PSD é uma cópia exata dessa imagem.
- Piscada e fala são pequenas sobreposições registradas; cabelo, rosto, óculos, corpo e enquadramento não são substituídos.
- `source/01-clean-face-underlay.png` existe somente para preencher áreas escondidas durante deformações futuras. Ela começa oculta e não participa do repouso.
- A v1 permanece preservada em `../live2d-assets-v1/` para comparação e histórico.

## Arquivo principal

- `package/alumia-live2d-material-v2.psd`: material híbrido pronto para importar no Cubism.
- `package/alumia-live2d-v2-idle.png`: repouso recomposto.
- `package/alumia-live2d-v2-identity-check.png`: referência à esquerda e repouso v2 à direita.
- `package/alumia-live2d-v2-states.png`: repouso, piscada, boca aberta e boca O.
- `package/identity-report.json`: verificação objetiva da igualdade do repouso com a referência.

## Ordem de rig recomendada

1. Importar o PSD e gerar a malha da camada `Base canônica · repouso exato`.
2. Criar respiração e inclinação suaves nessa camada, sem alterar a silhueta em repouso.
3. Usar `ParamEyeLOpen` e `ParamEyeROpen` para controlar as duas sobreposições de piscada.
4. Usar `ParamMouthOpenY` para alternar entre repouso, boca aberta e boca O.
5. Manter o preenchimento limpo oculto até a etapa de separação avançada.

Essa arquitetura prioriza a identidade agora e permite evoluir o rig sem aceitar um redesenho da Alumia como custo técnico.

## Regenerar

```bash
npm ci
npm run package
```

