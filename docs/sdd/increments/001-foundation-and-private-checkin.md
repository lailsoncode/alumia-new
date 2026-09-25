# Incremento 001 — Fundação e check-in privado

**ID:** `INC-001`  
**Estado:** ready  
**Objetivo:** entregar a primeira vertical real, da migration à interface, provando autenticação, workspace pessoal, conteúdo editorial, RLS e check-in privado.

## 1. Resultado demonstrável

Ao final do incremento:

1. uma pessoa cria conta por e-mail e senha;
2. confirma a sessão e recebe um workspace pessoal idempotente;
3. aceita as versões atuais dos documentos obrigatórios;
4. escolhe o módulo de check-in no onboarding;
5. seleciona até três emoções agradáveis, até três difíceis e uma necessidade;
6. envia o check-in;
7. recebe uma sugestão editorial determinística;
8. vê seu histórico paginado;
9. não consegue acessar registros de outro usuário;
10. lint, typecheck, testes, testes RLS e build passam.

## 2. Requisitos cobertos

- `CONST-01`, `CONST-02`, `CONST-05`, `CONST-06`, `CONST-07`, `CONST-08`;
- `IDN-001`, `IDN-002`, `IDN-004`, `IDN-006`;
- `PRV-001`, `PRV-004`;
- `B2C-ONB-001` a `B2C-ONB-005`;
- `B2C-CHK-001` a `B2C-CHK-009`;
- `SEC-RLS-001` e `SEC-RLS-002`;
- `DS-AC-001` a `DS-AC-006`.

## 3. Fora deste incremento

- login com Google;
- texto livre no check-in;
- mindfulness e notificações;
- organizações e papéis B2B;
- painel master;
- migração de dados do Firebase;
- PWA, Capacitor, IA e comunidade.

## 4. Contratos funcionais

### Cadastro

- e-mail válido e senha conforme política do Auth;
- criação de usuário não aceita papel, plano ou workspace enviado pelo cliente;
- trigger ou RPC provisiona profile e workspace uma única vez;
- falha parcial é recuperável no próximo login.

### Onboarding

- três passos no máximo;
- check-in pode ser ativado ou desativado;
- pular é permitido;
- conclusão grava `onboarding_completed_at` em preferências;
- notificações continuam desligadas.

### Check-in

Entrada:

```ts
type CreateCareCheckinInput = {
  emotionCodes: string[];
  needCode: string;
  idempotencyKey: string;
};
```

Saída:

```ts
type CreateCareCheckinResult = {
  checkinId: string;
  occurredAt: string;
  moodCategory: "very_difficult" | "difficult" | "slightly_difficult" | "mixed" | "slightly_positive" | "positive" | "very_positive";
  suggestion: {
    code: string;
    version: number;
    title: string;
    body: string;
    actionText: string;
    actionCategory: string;
  };
};
```

Erros:

- `EMOTION_NOT_AVAILABLE`;
- `NEED_NOT_AVAILABLE`;
- `WORKSPACE_NOT_FOUND`;
- `VALIDATION_ERROR`;
- `UNAUTHENTICATED`;
- `INTERNAL_ERROR`.

Retry com a mesma chave retorna o mesmo `checkinId` e não cria nova linha.

## 5. Banco e migrations

Criar migrations pequenas e ordenadas:

1. `create_common_types_and_updated_at`;
2. `create_profiles_and_workspaces`;
3. `create_user_preferences_modules_consents`;
4. `create_editorial_catalogs`;
5. `create_care_checkins_and_suggestion_snapshots`;
6. `create_personal_access_helpers_and_rls`;
7. `create_provision_workspace_rpc`;
8. `create_care_checkin_rpc`;
9. `seed_initial_care_content`.

Constraints essenciais:

- um workspace por owner;
- um member owner por workspace e usuário;
- `idempotency_key` único por workspace;
- catálogo referenciado deve estar publicado na RPC;
- `intensity` entre 1 e 5 quando existir;
- snapshots não ficam nulos.

## 6. RPCs

### `provision_personal_workspace()`

- usa `auth.uid()`;
- não aceita user ID;
- cria profile mínimo, workspace, membership, preferences e módulos padrão;
- é idempotente;
- retorna `workspace_id`.

### `create_care_checkin(emotion_codes, need_code, idempotency_key)`

- resolve workspace do usuário;
- valida catálogos publicados;
- valida ao menos uma emoção e o limite de três opções por grupo;
- calcula internamente a faixa emocional sem expor score ao cliente;
- escolhe regra editorial ativa com fallback publicado;
- cria check-in e snapshot em uma transação;
- retorna o contrato definido;
- não registra emoção ou necessidade em log.

## 7. Interface

Rotas:

- `/criar-conta`;
- `/entrar`;
- `/recuperar-senha`;
- `/app/onboarding`;
- `/app`;
- `/app/check-in`;
- `/app/check-in/historico`;
- `/app/preferencias`.

Componentes:

- `AuthForm`;
- `OnboardingStepper`;
- `ModuleChoiceCard`;
- `EmotionPicker`;
- `NeedPicker`;
- `CheckinForm`;
- `CareSuggestionCard`;
- `MoodSummaryCard`;
- `MoodCalendar`;
- `CheckinHistoryList`;
- `AlumiaIcon`;
- layouts público e B2C.

Estados obrigatórios:

- loading de sessão e dados;
- catálogo vazio;
- erro recuperável;
- envio em progresso com prevenção de duplo clique;
- sucesso;
- histórico vazio;
- sessão expirada.

## 8. Conteúdo seed inicial

O seed deve usar conteúdo revisável e não afirmar validação clínica. Categorias mínimas:

- emoções agradáveis: motivado, grato, calmo, esperançoso, feliz, animado, orgulhoso e aliviado;
- emoções difíceis: ansioso, sobrecarregado, irritado, sozinho, estressado, triste, cansado e confuso;
- necessidades: foco, calma, energia, apoio, somente registrar;
- ao menos uma sugestão publicada por combinação entre necessidade e grupo de faixa emocional;
- uma sugestão fallback publicada.

Textos finais devem passar por revisão editorial antes do staging público. A menção a BRUMS ou PANAS não entra neste incremento.

## 9. Telemetria

Eventos:

- `signup_completed`;
- `onboarding_completed`;
- `checkin_started`;
- `checkin_completed`;
- `checkin_failed`.

Propriedades permitidas:

- versão do fluxo;
- duração;
- resultado técnico;
- plataforma e rota;
- request ID sanitizado.

Não enviar seleção ou conteúdo do check-in.

## 10. Testes

### Domínio

- regra editorial encontra correspondência e fallback;
- catálogo não publicado é rejeitado;
- payload inválido retorna código estável.

### Banco/RLS

- provisionamento repetido retorna mesmo workspace;
- usuário A não seleciona, altera ou exclui check-in de B;
- role empresarial fictícia não acessa check-in;
- retry da RPC não duplica;
- catálogo draft não pode ser usado.

### Componentes

- navegação por teclado;
- erro de campo conectado ao controle;
- envio desabilitado durante mutation;
- sucesso anunciado por `aria-live`;
- histórico vazio e paginado.

### E2E smoke

```text
cadastro → onboarding → check-in → sugestão → histórico → logout
```

## 11. Plano de tarefas

### Fundação

- [ ] criar Vite React TypeScript com SWC;
- [ ] ativar strict, aliases e lint;
- [ ] instalar Router, React Query, Supabase, Tailwind, shadcn, Radix, Hugeicons, RHF, Zod e testes;
- [ ] criar providers, error boundary e layouts;
- [ ] criar `.env.example`;
- [ ] configurar CI e scripts `check`, `test:db` e `test:e2e`.

### Supabase

- [ ] iniciar Supabase local;
- [ ] criar migrations na ordem definida;
- [ ] escrever helpers e policies;
- [ ] implementar RPCs;
- [ ] criar seed editorial;
- [ ] gerar tipos;
- [ ] escrever testes RLS.

### Frontend

- [ ] implementar autenticação e guards;
- [ ] implementar onboarding;
- [ ] implementar design tokens e `AlumiaIcon`;
- [ ] implementar check-in e sugestão;
- [ ] implementar histórico;
- [ ] implementar preferências mínimas;
- [ ] limpar cache privado no logout.

### Verificação

- [ ] validar acessibilidade automatizada e manual;
- [ ] executar smoke E2E;
- [ ] executar lint, typecheck, testes e build;
- [ ] publicar em staging;
- [ ] registrar evidência dos critérios de aceitação.

## 12. Definition of Done

O incremento só é concluído quando:

- todos os requisitos cobertos estão rastreados por teste ou revisão;
- RLS negativa passa com dois usuários distintos;
- nenhum segredo está no bundle;
- nenhuma seleção emocional aparece em analytics ou logs;
- o fluxo funciona em 360 px, teclado e leitor de tela;
- migrations sobem do zero em ambiente limpo;
- staging reproduz o smoke completo;
- não há bug P0 ou P1 aberto na jornada.
