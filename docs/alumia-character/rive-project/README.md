# Alumia — estudo Rive com arte preservada

Fonte visual: `../reference-pack-v2/alumia-bust-master-v2.png`.

O arquivo atual é um estudo de busto que preserva a ilustração. Inclui movimento discreto de cabeça/busto e piscada com máscara dentro dos óculos. Não é ainda um rig completo de fala, olhos, cabelo e braços independentes.

## Abrir e reconstruir

```sh
rive .
```

Para reconstruir a cena a partir da autoria:

```sh
node author-reference-rig.mjs
rive . --verify
rive inspect . --summary
```

`scene.rml` é o arquivo nativo de cena. Exportações `.riv` e `.rev` ficam em `build/`. O `.rev` é editável no Rive; sua exportação usa a sessão `rive login`. O login do aplicativo desktop e o da CLI são separados.

`author-character.mjs` foi uma tentativa vetorial rejeitada. Não executar esse gerador, pois substituiria a cena atual por aquela versão.

## Integração atual no aplicativo

O aplicativo usa `build/alumia-bust-v2.riv` como a presença principal da Alumia. O
binário é servido em `public/alumia/alumia-rive-bust-v2.riv` e montado pelo
componente `src/components/shared/alumia-presence/RiveAlumia.tsx`.

- Artboard: `Alumia · busto fiel`.
- Máquina de estados: `AlumiaPresence`.
- Fallback: o PNG canônico continua atrás do canvas para que a presença não
  desapareça caso o runtime Rive demore a carregar ou esteja indisponível.
- O arquivo antigo `build/rive-project.riv` permanece preservado como estudo e
  não é o ativo usado pelo aplicativo.

O busto foi escolhido de propósito para o avatar flutuante: mantém rosto,
óculos, cabelo e flor legíveis em áreas pequenas, sem tentar exibir o corpo
inteiro em dispositivos móveis.

## Interação atual

- `AlumiaPresence`: máquina de estados.
- `AlumiaCharacter.isListening`: controla uma postura sutil de atenção. A aproximação do ponteiro também altera esse valor.
- `AlumiaCharacter.greet`: dispara uma reação curta ao toque.
- Respiração e piscada são camadas contínuas separadas.

Ainda não há áudio, captura de microfone ou sincronização labial. A integração
visual já está ativa; a próxima evolução pode ligar eventos do aplicativo a
`isListening` e `greet`, sem trocar a arte-base. As imagens são incorporadas no
`.riv`; o protótipo ainda precisa de otimização de tamanho para produção.
