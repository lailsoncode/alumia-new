# Feature specification — Alum.IA

**ID:** `B2C-AI`

**Versão:** `0.2.0`

**Estado:** `implementing`

## 1. Resultado esperado

A pessoa conversa por texto com uma assistente de cuidado e organização que explica seus limites, usa somente o contexto autorizado e transforma pedidos em próximos passos possíveis. A Alum.IA pode consultar módulos privados e propor ações, mas nunca executa uma alteração relevante sem confirmação explícita.

A Alum.IA não é terapeuta, profissional de saúde, consultora financeira ou representante da empresa que oferece o benefício. Ela não diagnostica, não prescreve, não garante resultados e não transforma sinais pessoais em avaliação profissional.

## 2. Princípios de interação

- acolher sem criar dependência, exclusividade ou obrigação de retorno;
- oferecer escolhas curtas em vez de comandar;
- dizer com clareza quando uma resposta é editorial, determinística ou generativa;
- pedir somente os dados necessários para o pedido atual;
- separar consulta de execução;
- permitir desistir, corrigir e recomeçar sem punição;
- não inferir diagnóstico, risco clínico, capacidade profissional ou valor pessoal;
- nunca disponibilizar conversas ou contexto B2C à empresa, suporte ou painel master.

## 3. Incrementos ativos — prévia segura e conversa generativa controlada

Incluído:

- rota autenticada `/alumia`;
- conversa por texto mantida apenas na memória da tela;
- explicação visível de capacidades, limites e tratamento dos dados;
- respostas editoriais determinísticas para os primeiros fluxos;
- resumo de tarefas privadas da própria pessoa;
- sugestão de prática publicada de Mindfulness;
- proposta de criação de tarefa sem data;
- confirmação explícita antes de criar a tarefa;
- interrupção do fluxo de ferramentas quando houver linguagem de possível crise;
- opção de limpar a conversa;
- liberação por flag, ativa por padrão somente em desenvolvimento.
- serviço generativo isolado no Cloud Run, sem acesso a dados de módulos e sem `service_role`;
- validação de JWT pelo Supabase Auth antes de qualquer chamada ao modelo;
- conversa generativa opcional por uma segunda flag, desativada por padrão em todos os ambientes;
- envio ao modelo apenas da mensagem digitada e de respostas generativas anteriores; resultados editoriais de módulos não entram no histórico remoto.

Ficam fora deste incremento:

- armazenamento de conversas;
- memória entre sessões;
- áudio ou voz;
- leitura de check-ins emocionais, hidratação, estudante ou finanças;
- envio de conteúdo de Tarefas ou Mindfulness ao modelo;
- tool calling ou execução de módulos pelo modelo;
- ações destrutivas, conclusão, exclusão ou reagendamento automático;
- acesso a dados B2B, ocupacionais ou administrativos;
- recomendações clínicas, financeiras ou jurídicas;
- execução autônoma ou em segundo plano.

## 4. Requisitos funcionais

- `B2C-AI-001`: identificar a assistente como Alum.IA, distinguir respostas editoriais de respostas generativas e não se apresentar como pessoa humana.
- `B2C-AI-002`: manter o histórico somente no estado da tela e removê-lo ao limpar, sair ou recarregar a experiência.
- `B2C-AI-003`: consultar somente dados do usuário autenticado já protegidos por RLS.
- `B2C-AI-004`: responder a pedidos de organização mostrando no máximo três tarefas pendentes e sem enviar títulos para analytics ou logs.
- `B2C-AI-005`: sugerir somente práticas publicadas do catálogo editorial de Mindfulness.
- `B2C-AI-006`: representar qualquer escrita como proposta estruturada e exigir confirmação explícita imediatamente antes da execução.
- `B2C-AI-007`: criar tarefa confirmada com `module_key = alumia_ai`, sem inferir data, horário, prioridade ou lembrete que a pessoa não informou por meio de controles próprios.
- `B2C-AI-008`: desabilitar confirmações repetidas enquanto a ação estiver em andamento e apresentar resultado ou falha recuperável.
- `B2C-AI-009`: ao identificar linguagem de possível crise, não consultar módulos nem propor ações; oferecer orientação humana e contatos de ajuda sem afirmar diagnóstico.
- `B2C-AI-010`: nunca consultar ou expor dados B2B, respostas ocupacionais, organizações, relatórios ou metadados corporativos na conversa pessoal.
- `B2C-AI-011`: oferecer navegação e uso completos por teclado, foco visível, região de atualização acessível e alvos de toque de ao menos 44 px.
- `B2C-AI-012`: manter o provedor de conversa atrás de um contrato substituível; credenciais e chamadas futuras a modelos permanecem exclusivamente no servidor.
- `B2C-AI-013`: não registrar texto de mensagens, títulos de tarefas ou respostas do assistente em telemetria, exceções ou observabilidade.
- `B2C-AI-014`: manter a prévia fora da entrega pública quando a flag `VITE_ENABLE_ALUMIA_AI_PREVIEW` não estiver ativa.
- `B2C-AI-015`: ativar o provedor generativo somente quando `VITE_ENABLE_ALUMIA_AI_GENERATIVE=true` e `VITE_ALUMIA_AI_URL` estiver definido.
- `B2C-AI-016`: autenticar o endpoint generativo com o access token da sessão Supabase e nunca expor credenciais Google no cliente.
- `B2C-AI-017`: excluir respostas editoriais contendo dados de módulos do histórico enviado ao modelo.

## 5. Estados e transições

```text
entrada → conversa local → resposta editorial
                      ↘ pergunta aberta → JWT revalidado → Gemini → resposta generativa
                      ↘ consulta privada → resposta
                      ↘ proposta de ação → confirmar → executando → concluída | falhou
                                          ↘ agora não
                      ↘ possível crise → orientação humana, sem ferramenta

conversa → limpar → estado inicial
```

Recarregar ou sair da rota encerra a sessão local. O primeiro incremento não oferece recuperação de conversa.

## 6. Contratos iniciais

```ts
type AlumiaIntent = "tasks" | "mindfulness" | "create_task" | "crisis" | "capabilities";

type AlumiaProposedAction = {
  id: string;
  type: "create_task";
  title: string;
};

type AlumiaAssistantResult = {
  text: string;
  tone: "default" | "safety";
  source: "editorial" | "generative";
  proposedAction?: AlumiaProposedAction;
  navigation?: { label: string; to: "/tarefas" | "/mindfulness" };
};
```

O contrato futuro com o orquestrador generativo deve usar ações tipadas e allowlist. Texto produzido pelo modelo nunca é executado como comando, SQL ou chamada arbitrária.

## 7. Segurança, privacidade e retenção

### Prévia editorial

- nenhuma mensagem é persistida;
- nenhuma mensagem deixa o cliente para um provedor de IA;
- consultas usam a sessão Supabase existente e as políticas RLS;
- criação de tarefa reutiliza o serviço protegido do módulo Tarefas;
- não existe segredo de modelo no bundle;
- a interface informa essas limitações diretamente.

### Prévia generativa controlada

- o frontend envia a mensagem apenas ao serviço `alumia-ai` no Cloud Run;
- o serviço revalida o JWT no Supabase, aplica CORS, limites de payload e barreira determinística de crise;
- o Gemini usa ADC da conta `alumia-ai-runtime`, sem chave JSON;
- a chave pública do Supabase é lida do Secret Manager e a conta não recebe `service_role`;
- mensagens e respostas não são persistidas nem escritas em logs;
- o modelo não recebe resultados de módulos e não possui ferramentas nesta fase;
- a ativação depende de flag separada e continua desligada por padrão.

### Condições antes da liberação pública da IA generativa

O uso público de Gemini ou Vertex AI exige que a revisão desta especificação e o ADR-011 cubram:

1. finalidade e base de uso de cada categoria de dado;
2. consentimento e revogação;
3. política de memória e retenção;
4. região de processamento e fornecedores;
5. contrato entre Supabase Auth e o serviço no Google Cloud;
6. filtros, avaliações de segurança e resposta a crise;
7. logs sem conteúdo pessoal e rastreio de ferramentas;
8. limites de custo, quota, timeout e degradação;
9. exportação e exclusão;
10. testes contra prompt injection, vazamento entre usuários e ações indevidas.

## 8. Arquitetura de evolução

```text
Aplicação Alumia
  → contrato AlumiaAssistant
    → provedor editorial determinístico
    → orquestrador server-side no Google Cloud (prévia generativa sob flag)
       → Gemini/Vertex AI
       → ferramentas Alumia com allowlist
          → Supabase/Postgres + RLS/RPC
```

O Supabase permanece como fonte de verdade para identidade, dados e autorização. O serviço no Google Cloud, quando aprovado, recebe um token do usuário, valida identidade e escopo e executa apenas ferramentas server-side explícitas. Uma resposta do modelo não amplia permissões.

## 9. Resposta a possível crise

A Alum.IA não faz triagem clínica. No primeiro incremento, uma lista conservadora de expressões interrompe as ferramentas e apresenta uma orientação fixa:

- procurar alguém de confiança que possa permanecer presente;
- ligar para o CVV no `188` para apoio emocional no Brasil;
- em perigo imediato ou emergência, ligar para o SAMU no `192` ou procurar o serviço de emergência local.

Os textos e gatilhos precisam de revisão profissional antes da liberação pública. O mecanismo determinístico não deve ser descrito como capaz de detectar todas as situações de risco.

Referências operacionais verificadas: [CVV — Ligue 188](https://cvv.org.br/ligue-188-3/) e [Ministério da Saúde — SAMU 192](https://www.gov.br/saude/pt-br/composicao/saes/samu-192).

## 10. Critérios de aceitação

- `B2C-AI-AC-01`: abrir `/alumia` apresenta identidade, limites e ausência de persistência antes da primeira mensagem.
- `B2C-AI-AC-02`: recarregar a rota não restaura mensagens anteriores.
- `B2C-AI-AC-03`: pedir ajuda com tarefas mostra no máximo três tarefas pendentes da própria pessoa.
- `B2C-AI-AC-04`: pedir uma pausa apresenta uma prática publicada e um caminho para Mindfulness.
- `B2C-AI-AC-05`: “crie uma tarefa comprar pão” produz uma proposta; nenhuma tarefa é criada antes de selecionar “Criar tarefa”.
- `B2C-AI-AC-06`: confirmar uma vez cria somente uma tarefa identificada com `module_key = alumia_ai` durante a interação normal.
- `B2C-AI-AC-07`: cancelar a proposta não executa escrita e mantém a conversa utilizável.
- `B2C-AI-AC-08`: linguagem de possível crise mostra recursos humanos e não chama serviços de tarefas ou Mindfulness.
- `B2C-AI-AC-09`: limpar remove todas as mensagens da sessão visual e restaura a apresentação inicial.
- `B2C-AI-AC-10`: em produção, o catálogo mantém Alum.IA como indisponível quando a flag da prévia não estiver ativa.
- `B2C-AI-AC-11`: não há texto de conversa em banco, `localStorage`, analytics ou logs de aplicação.
- `B2C-AI-AC-12`: o fluxo funciona a partir de 360 px, com teclado e leitor de tela.
- `B2C-AI-AC-13`: sem a flag generativa, nenhuma mensagem é enviada ao Cloud Run ou ao Gemini.
- `B2C-AI-AC-14`: com a flag generativa, uma sessão ausente ou inválida é recusada e nenhuma resposta de módulo entra no histórico remoto.
- `B2C-AI-AC-15`: a interface identifica visualmente respostas produzidas com IA e mantém ações de escrita no fluxo editorial confirmável.

## 11. Evidência e pendências

Evidência prevista nesta entrega:

- domínio e testes de intenção em `src/lib/alumia-ai.ts`;
- serviço substituível em `src/services/alumiaAIService.ts`;
- rota `/alumia` e interface em `src/components/shared/alumia-ai`;
- integração controlada com Tarefas e Mindfulness;
- flags documentadas em `.env.example`;
- serviço `services/alumia-ai` implantado no Cloud Run com identidade dedicada e Secret Manager;
- teste sintético do modelo, health check e recusa de requisição sem JWT.

Permanecem pendentes para liberação pública: revisão profissional do texto de crise, teste autenticado ponta a ponta com usuário sintético, teste negativo de RLS com dois usuários, idempotência server-side das ações, auditoria manual de acessibilidade, telemetria técnica aprovada, consentimento e política de processamento.
