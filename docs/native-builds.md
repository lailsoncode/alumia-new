# Builds nativos da Alumia

A Alumia mantém uma única interface React/Vite e usa Capacitor para gerar os aplicativos Android e iOS.

O identificador nativo é `br.com.oxentecode.alumia`, preservando os aplicativos Android e iOS já registrados no projeto Firebase original.

Os projetos nativos usam como ícone e tela de abertura a mesma personagem oficial disponível em `public/icons/alumia-icon-512.png`. O desenho não é recriado nem alterado: os arquivos específicos de Android e iOS são derivados dessa imagem por redimensionamento e enquadramento.

## Integrações incluídas

- `@capacitor/app`: ciclo de vida e retorno por deep link;
- `@capacitor/browser`: login Google no navegador seguro do sistema;
- `@capacitor/local-notifications`: lembretes de tarefas agendados no próprio dispositivo;
- `onesignal-cordova-plugin`: push remoto nativo do OneSignal;
- OneSignal Web SDK: continua atendendo navegador e PWA.

O esquema de retorno da autenticação é `alumia://auth/callback`.

## Estado das integrações externas

- Supabase: o retorno `alumia://auth/**` está permitido.
- Firebase: as assinaturas da Play Store, da chave de upload e de desenvolvimento estão registradas; o `google-services.json` do projeto contém os clientes OAuth correspondentes.
- Google Cloud: a chave Android criada pelo Firebase está limitada ao pacote `br.com.oxentecode.alumia` e às assinaturas Android registradas.
- OneSignal: Android está ativo com FCM v1 e o SDK Capacitor está selecionado.
- Play Console: a Assinatura de Apps do Google Play está ativa e a redefinição para a nova chave de upload foi solicitada. O primeiro AAB assinado com a nova chave só deve ser enviado após a aprovação do Google.
- iOS: o projeto e o App ID já estão preparados. APNs, equipe de assinatura e publicação dependem de uma conta Apple Developer.

O App ID pode ser compartilhado entre Web, Android e iOS. Se for necessário usar aplicativos separados no OneSignal, definir `VITE_ONESIGNAL_NATIVE_APP_ID` no ambiente de build.

## Comandos

```bash
# Compila a aplicação Web e sincroniza Android/iOS
npm run native:sync

# Abre o Android Studio
npm run native:android

# Gera um APK de depuração
npm run native:android:debug

# Gera o AAB assinado para a Play Console
npm run native:android:bundle

# Gera um APK de release assinado para testes diretos
npm run native:android:apk

# Abre o Xcode
npm run native:ios

# Confere o ambiente Capacitor
npm run native:doctor
```

O APK de depuração é criado em `android/app/build/outputs/apk/debug/app-debug.apk`.

O AAB assinado é criado em `android/app/build/outputs/bundle/release/app-release.aab`. A versão Android atual é `1.3.0` (`versionCode` 46), imediatamente posterior ao bundle 45 publicado no Play Console.

## Assinatura Android

O Gradle procura as credenciais nesta ordem:

1. variáveis `ALUMIA_ANDROID_KEYSTORE_PATH`, `ALUMIA_ANDROID_KEYSTORE_PASSWORD`, `ALUMIA_ANDROID_KEY_ALIAS` e `ALUMIA_ANDROID_KEY_PASSWORD`;
2. arquivo indicado por `ALUMIA_ANDROID_KEYSTORE_PROPERTIES`;
3. `android/keystore.properties`;
4. `~/.config/alumia/android/keystore.properties`.

Os arquivos de assinatura e propriedades ficam fora do Git. Neste computador, a chave de upload está em `~/.config/alumia/android/alumia-upload.jks`, com permissão somente para o usuário. Mantenha um backup criptografado do `.jks` e das senhas: perder a chave exige outra redefinição da chave de upload no Play Console.

O certificado público usado para registrar ou redefinir a chave de upload fica em `~/.config/alumia/android/alumia-upload-certificate.pem`.

## Comportamento dos lembretes

Toda tarefa com data e horário recebe uma notificação local no momento marcado quando a permissão já está ativa. Se o usuário escolher um lembrete, o aplicativo pede a permissão do sistema e cria também um aviso antecipado de 5, 15 ou 30 minutos; a opção **Na hora** reaproveita a notificação do próprio horário. Os lembretes usam o som próprio `alumia_alarm.wav`, vibração e o canal Android de importância máxima `alumia_alarms_v2`. Concluir, editar ou excluir a tarefa atualiza ou remove os avisos correspondentes. Ao tocar na notificação, o aplicativo abre a página de tarefas.

No Android 12 ou superior, o sistema pode pedir também a permissão de alarmes exatos. Se ela não for concedida, o Capacitor agenda o lembrete de forma aproximada. O som, a vibração, o modo Não Perturbe e a exibição na tela continuam sujeitos às preferências do canal definidas pela pessoa no Android.

No iOS, a entrega depende da permissão de notificações concedida ao aplicativo. O lembrete apresenta banner, som e vibração quando permitidos pelo sistema, mas respeita o modo silencioso e os modos Foco. Romper essas barreiras como um despertador exige o entitlement **Critical Alerts**, concedido pela Apple apenas a categorias elegíveis; a Alumia não declara essa capacidade.

## Push remoto

O switch em **Ajustes → Notificações** usa o SDK adequado para cada ambiente. Na Web ele controla o OneSignal Web Push; nos aplicativos instalados controla a inscrição nativa vinculada ao mesmo usuário do Supabase.

No Android, o aplicativo cria o canal `alumia_alarms_v2` com importância alta, som próprio, vibração e exibição na tela. O novo ID evita herdar configurações congeladas do canal anterior. Em instalações novas ele também cria com importância alta o fallback usado pelos pushes sem categoria. O painel do OneSignal possui ainda o canal **Alertas e lembretes**, com ID `93edee85-4570-407c-ab7d-b70cfe353291`, importância **Urgent**, som e vibração padrão. Para garantir a correção em aparelhos onde o canal antigo já foi congelado pelo Android, configure o envio de uma destas formas:

- no compositor do Dashboard, em **Android → Category**, selecione **Alertas e lembretes**;
- pela API, envie `android_channel_id: "93edee85-4570-407c-ab7d-b70cfe353291"` e `priority: 10`;
- alternativamente, use o canal criado pelo aplicativo com `existing_android_channel_id: "alumia_alarms_v2"` e `priority: 10`.

Se a categoria for criada no próprio Dashboard do OneSignal, use importância **Urgent**. A opção **High** do OneSignal equivale a `IMPORTANCE_DEFAULT` no Android e normalmente apenas deixa a notificação na barra; **Urgent** equivale a `IMPORTANCE_HIGH` e permite o banner heads-up. Categorias já recebidas têm importância, som e vibração congelados pelo Android. Para mudar esses atributos em aparelhos existentes, crie uma categoria com outro ID (ou reinstale/limpe os dados somente durante testes).

No iOS, pushes realmente urgentes podem usar `ios_interruption_level: "time_sensitive"`, desde que o capability correspondente esteja habilitado no projeto Apple. Notificações comuns devem continuar com o nível padrão para não perder relevância perante o sistema.

O projeto iOS está preparado para notificações comuns. Imagens e alteração de conteúdo antes da entrega exigirão um `Notification Service Extension`, que pode ser incluído quando esse formato entrar no produto.
# Conversa ao vivo interna

Para incluir o modo de voz contínua no APK de teste, o build web precisa ter `VITE_ENABLE_ALUMIA_LIVE_VOICE=true` e `VITE_ALUMIA_AI_URL` apontando para a revisão do Cloud Run com `ALUMIA_LIVE_ENABLED=true`. A permissão de microfone já é compartilhada com a gravação de mensagens do chat.

O modo **Ao vivo** mantém uma conexão WebSocket durante a conversa. Antes de gerar o APK, confirme que o timeout do serviço Cloud Run é superior aos cinco minutos da sessão e teste em aparelho físico com Wi-Fi e rede móvel. O chat escrito e a gravação curta continuam disponíveis se o Live API estiver indisponível.
