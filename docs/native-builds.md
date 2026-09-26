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

## Configuração externa necessária

1. No Supabase, em **Authentication → URL Configuration**, incluir `alumia://auth/**` na lista de URLs permitidas.
2. No aplicativo da Alumia no OneSignal, adicionar a plataforma Android e fornecer a credencial Firebase/FCM.
3. No mesmo aplicativo do OneSignal, adicionar a plataforma iOS e fornecer a chave APNs `.p8`, Key ID e Team ID.
4. No Xcode, selecionar a equipe Apple do projeto antes de gerar um archive para dispositivo ou App Store.
5. Na Play Console, criar ou selecionar a chave usada para assinar o AAB de produção.

O App ID pode ser compartilhado entre Web, Android e iOS. Se for necessário usar aplicativos separados no OneSignal, definir `VITE_ONESIGNAL_NATIVE_APP_ID` no ambiente de build.

## Comandos

```bash
# Compila a aplicação Web e sincroniza Android/iOS
npm run native:sync

# Abre o Android Studio
npm run native:android

# Gera um APK de depuração
npm run native:android:debug

# Abre o Xcode
npm run native:ios

# Confere o ambiente Capacitor
npm run native:doctor
```

O APK de depuração é criado em `android/app/build/outputs/apk/debug/app-debug.apk`.

## Comportamento dos lembretes

Toda tarefa com data e horário recebe uma notificação local no momento marcado quando a permissão já está ativa. Se o usuário escolher um lembrete, o aplicativo pede a permissão do sistema e cria também um aviso antecipado de 5, 15 ou 30 minutos; a opção **Na hora** reaproveita a notificação do próprio horário. Concluir, editar ou excluir a tarefa atualiza ou remove os avisos correspondentes. Ao tocar na notificação, o aplicativo abre a página de tarefas.

No Android 12 ou superior, o sistema pode pedir também a permissão de alarmes exatos. Se ela não for concedida, o Capacitor agenda o lembrete de forma aproximada. No iOS, a entrega depende da permissão de notificações concedida ao aplicativo.

## Push remoto

O switch em **Ajustes → Notificações** usa o SDK adequado para cada ambiente. Na Web ele controla o OneSignal Web Push; nos aplicativos instalados controla a inscrição nativa vinculada ao mesmo usuário do Supabase.

O projeto iOS está preparado para notificações comuns. Imagens e alteração de conteúdo antes da entrega exigirão um `Notification Service Extension`, que pode ser incluído quando esse formato entrar no produto.
