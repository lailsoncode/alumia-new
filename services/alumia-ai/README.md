# Serviço Alum.IA

Orquestrador server-side da Alum.IA para Cloud Run. Este serviço usa Supabase somente para validar a sessão da pessoa e Agent Platform/Vertex AI para gerar a resposta. Ele não persiste conversas e não possui `service_role`.

## Executar localmente

1. copie `.env.example` para `.env` fora do controle de versão;
2. configure Application Default Credentials do Google Cloud;
3. execute `npm install` e `npm start`;
4. consulte `GET /health` ou envie `POST /v1/chat` com um JWT Supabase válido.

Payload inicial:

```json
{
  "message": "Quero organizar meu próximo passo",
  "history": [
    { "role": "user", "text": "Hoje está corrido" },
    { "role": "assistant", "text": "Podemos escolher uma coisa pequena." }
  ],
  "context": {
    "localDate": "2026-09-27",
    "timeZone": "America/Recife"
  }
}
```

O histórico é opcional, limitado e usado somente durante a requisição. O contexto de data local e fuso horário é obrigatório para interpretar expressões como “amanhã”. Nada é salvo pelo serviço.

## Voz

O serviço também expõe dois endpoints autenticados, sem persistência do áudio:

- `POST /v1/transcriptions`, com o áudio bruto no corpo e seu MIME type em `Content-Type`, transcreve até 2 MB em português brasileiro;
- `POST /v1/speech`, com `{ "text": "..." }`, devolve `audio/mpeg` usando Gemini TTS.

A voz padrão usa `gemini-2.5-flash-tts`, speaker feminina `Aoede`, velocidade `1.08` e uma direção compacta para preservar o sotaque nordestino leve inspirado em Recife. O Flash-Lite foi rejeitado por truncar respostas em testes, e o Chirp 3 HD fica como alternativa de menor latência quando a direção regional não for necessária. Modelo e speaker podem ser alterados por `ALUMIA_TTS_MODEL` e `ALUMIA_TTS_VOICE`; `ALUMIA_TTS_PROMPT` é usado apenas quando o modelo configurado começa com `gemini-`.

Para implantar a voz, habilite `speech.googleapis.com` e `texttospeech.googleapis.com`. Além de `roles/aiplatform.user`, usado pelo Gemini e pelo Gemini TTS, conceda `roles/speech.client` à service account do runtime para reconhecimento de fala.

O Gemini pode responder com texto ou chamar somente `propose_create_task`. Essa função gera uma proposta validada de título, descrição, data, horário, prioridade e lembrete; ela não escreve no banco. A confirmação e a criação idempotente acontecem no aplicativo, usando a sessão da pessoa e a RPC protegida pelo RLS.

## Cloud Run

Configuração implantada em 27 de setembro de 2026:

- projeto `alumia-app`;
- serviço `alumia-ai`;
- região `southamerica-east1`;
- modelo em `global`;
- service account dedicada com `roles/aiplatform.user` e `roles/speech.client`;
- conta `alumia-ai-runtime@alumia-app.iam.gserviceaccount.com`, sem chave JSON;
- `SUPABASE_ANON_KEY` fornecida por Secret Manager;
- acesso HTTP público, mas toda chamada de chat exige JWT Supabase válido;
- mínimo de instâncias zero, timeout de 60 segundos e limite inicial de três instâncias;
- limite defensivo inicial de 12 gerações por minuto por usuário e por instância;
- revisão atual `alumia-ai-00015-vk9`, servindo 100% do tráfego, com transcrição e síntese de voz habilitadas;
- URL estável `https://alumia-ai-696823006824.southamerica-east1.run.app`.

O frontend possui integração autenticada, mas ela permanece desligada por padrão por `VITE_ENABLE_ALUMIA_AI_GENERATIVE=false`. A ativação pública depende dos gates restantes do [ADR-011](../../docs/sdd/adrs/011-alumia-ai-hybrid-cloud.md).

O histórico só é utilizado quando `alumia_ai_preferences.conversation_context` está autorizado na versão 1. A preferência é consultada com o JWT da pessoa e RLS em cada solicitação. Ausência, revogação ou falha de leitura descarta o histórico antes de chamar o modelo. A aplicação também deixa de enviar histórico nessa situação. O limite atual é de oito mensagens.

A memória pessoal usa autorização independente (`memory_enabled`, `memory_consent_version=2`). A versão 2 representa a finalidade explícita de aprendizado pessoal; autorizações anteriores não são ampliadas automaticamente. Com autorização, o backend consulta até 50 fatos recentes de `alumia_memories` usando JWT e RLS. Hobbies, preferências e objetivos não sensíveis declarados na mensagem atual podem ser gravados automaticamente, sempre com evidência literal validada, RLS e indicação na resposta. O perfil inicial é revisado antes da gravação; a interface permite consultar, corrigir, exportar, revogar o uso e excluir lembranças. Conversas inteiras não são persistidas; a desativação preserva os fatos mas interrompe seu uso. Falha de leitura ou escrita interrompe a geração, evitando uma falsa indicação de aprendizado.

O aprendizado entre módulos é determinístico e acontece no Postgres, sem enviar conteúdo bruto ao modelo. Após três observações, podem ser formadas apenas estas preferências: faixa de horário em Tarefas, duração planejada no Estudante, tamanho de porção em Hidratação e formato de áudio/texto em Mindfulness. Títulos, descrições, totais, metas, reflexões, Financeiro e check-ins ficam fora. A origem é exibida à pessoa; exclusões e correções criam supressões para que um padrão rejeitado não reapareça.
