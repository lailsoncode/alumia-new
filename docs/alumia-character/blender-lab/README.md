# Alumia — laboratório 3D separado

## Status e limites

Estudo técnico de volume criado no Blender 5.2.2. **Não é a versão artística final, nem uma conversão automática dos PNGs.** A geometria foi construída programaticamente usando as referências como direção. A comparação revela diferenças relevantes de cachos, olhos, ombros, pele e proporções. Não aprovar este estudo como identidade oficial.

O Rive e o avatar do aplicativo não foram substituídos ou alterados. Este laboratório tem dependências próprias e servidor restrito a `127.0.0.1`. Não usa Firebase, credenciais, câmera, áudio ou serviço externo de geração 3D.

## Entregáveis

- `build/alumia-volume-study.blend`: cena editável, materiais, geometria e referências empacotadas.
- `build/alumia-volume-study.glb`: exportação para o navegador; cerca de 1,72 MB, 50 malhas, nenhuma imagem incorporada.
- `build/front.png`, `build/three-quarter.png`, `build/profile.png`: conferência dos ângulos.
- Visualizador com comparação lado a lado, rotação, zoom, pausa, vistas, gesto de cabeça e modo malha.

O arquivo contém uma animação `Idle` com quatro canais: cabeça, respiração e dois grupos de olhos. A piscada é um achatamento provisório dos olhos, **não pálpebras articuladas**. O gesto adicional é controlado pelo visualizador. Não há esqueleto deformável, sincronização labial ou fala.

## Reproduzir

```sh
blender --background --python build-character.py
npm ci
npm run check
npm run dev
```

Abrir `http://127.0.0.1:8093/`. Para gerar o visualizador estático: `npm run build`.

O gerador recria somente os artefatos deste laboratório. Se editar manualmente o `.blend`, salvar uma cópia com outro nome antes de executar o gerador novamente. A pasta `build/` é ignorada pelo Git: preservar uma cópia dos artefatos ao mover o projeto.

## Verificações

- Compilação do visualizador e inspeção estrutural do GLB.
- GLB com malhas reais, sem imagens e com animação exportada.
- Renderizações de frente, três quartos e perfil conferidas.
- Carregamento e troca de ângulo no navegador conferidos.
- Dependências isoladas verificadas com `npm audit`.

O visualizador respeita a preferência de movimento reduzido na inicialização; não houve teste em celular físico. O modelo possui aproximadamente 89 mil triângulos e 50 malhas: ainda precisa de otimização e medição antes de entrar no aplicativo.

## Próximo marco: fidelidade, antes de integrar

1. Esculpir uma cabeça fiel e comparar com as referências em três ângulos; acertar olhos, bochechas, mandíbula e nariz.
2. Refazer cachos como mechas contínuas com boa silhueta, em vez de segmentos repetidos. Ajustar ombros e mangas.
3. Revisar materiais sob iluminação equivalente ao aplicativo; não confundir ajustes de luz com mudanças na cor de pele.
4. Aprovar o busto estático antes do rig facial. Preparar pálpebras e formas de boca independentes.
5. Testar memória, tempo de carregamento e renderização em celular real; reduzir polígonos e chamadas de desenho.
6. Só então integrar opcionalmente ao aplicativo, preservando alternativa 2D e preferência por movimento reduzido.

O trabalho artístico acima requer modelagem e revisão dedicadas. O sucesso da exportação não equivale a fidelidade visual.
