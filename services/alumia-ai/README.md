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
  ]
}
```

O histórico é opcional, limitado e usado somente durante a requisição. Não é salvo pelo serviço.

## Cloud Run

Configuração implantada em 27 de setembro de 2026:

- projeto `alumia-app`;
- serviço `alumia-ai`;
- região `southamerica-east1`;
- modelo em `global`;
- service account dedicada com `roles/aiplatform.user`;
- conta `alumia-ai-runtime@alumia-app.iam.gserviceaccount.com`, sem chave JSON;
- `SUPABASE_ANON_KEY` fornecida por Secret Manager;
- acesso HTTP público, mas toda chamada de chat exige JWT Supabase válido;
- mínimo de instâncias zero, timeout de 60 segundos e limite inicial de três instâncias;
- limite defensivo inicial de 12 gerações por minuto por usuário e por instância;
- revisão atual `alumia-ai-00002-6pn`, servindo 100% do tráfego;
- URL estável `https://alumia-ai-696823006824.southamerica-east1.run.app`.

O frontend possui integração autenticada, mas ela permanece desligada por padrão por `VITE_ENABLE_ALUMIA_AI_GENERATIVE=false`. A ativação pública depende dos gates restantes do [ADR-011](../../docs/sdd/adrs/011-alumia-ai-hybrid-cloud.md).
