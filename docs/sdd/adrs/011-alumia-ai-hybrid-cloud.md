# ADR-011 — Alum.IA em arquitetura híbrida Supabase e Google Cloud

**Estado:** accepted — infrastructure deployed, public activation gated

**Data:** 27 de setembro de 2026

## Contexto

A Alumia usa Supabase como fonte de verdade para autenticação, dados privados, RLS, RPCs e auditoria. O projeto Google Cloud `alumia-app` já possui faturamento Blaze, Agent Platform/Vertex AI, Cloud Run e Cloud Build ativos, além de serviços legados do Firebase na região `southamerica-east1`.

A Alum.IA precisa conversar por texto e, gradualmente, consultar e manipular módulos. Colocar credenciais ou execução de ferramentas no navegador permitiria contornar confirmações, exporia integrações e dificultaria impor limites de custo e segurança. Migrar todo o produto para o Google Cloud duplicaria identidade, autorização e persistência já implementadas no Supabase.

## Decisão

Adotar uma arquitetura híbrida:

- Supabase continua responsável por identidade, dados, RLS e operações de domínio;
- um serviço dedicado `alumia-ai` roda no Cloud Run em `southamerica-east1`;
- o serviço usa o Google Gen AI SDK e o modelo Gemini `gemini-3.5-flash` pela Agent Platform/Vertex AI na localização `global`;
- o aplicativo envia o JWT Supabase; o serviço revalida a sessão com o Supabase Auth antes de processar a mensagem;
- o serviço nunca recebe `service_role` e não possui permissão implícita para ignorar RLS;
- o runtime usa uma service account dedicada e Application Default Credentials, sem chave JSON;
- a API generativa não recebe conteúdo dos módulos nem executa ferramentas; o Gemini pode somente produzir uma proposta tipada pela função `propose_create_task`;
- ferramentas futuras serão server-side, tipadas, limitadas por allowlist e separadas entre leitura e proposta de escrita;
- toda escrita continuará dependendo de confirmação explícita da pessoa e de uma operação idempotente no domínio;
- texto de conversa não será enviado para Cloud Logging, analytics ou tracing;
- CORS usa allowlist de origens e o payload possui limites pequenos;
- a prévia editorial atual permanece como fallback e como caminho de degradação.

## Fluxo de confiança

```text
Aplicação autenticada
  → JWT Supabase + mensagem
  → Cloud Run /v1/chat
      → valida origem e formato
      → revalida JWT em Supabase Auth
      → aplica limite e barreira de crise
      → proposta tipada de ferramenta
      → confirmação na interface
      → RPC/serviço de domínio com JWT do usuário e RLS
      → resposta textual ou proposta sem persistência
```

## Configuração aprovada

| Item | Valor inicial |
|---|---|
| Projeto Google Cloud | `alumia-app` |
| Região Cloud Run | `southamerica-east1` |
| Localização do modelo | `global` |
| Modelo inicial | `gemini-3.5-flash` |
| Serviço | `alumia-ai` |
| Autenticação de usuário | JWT Supabase revalidado no Auth API |
| Autenticação Google | ADC da service account do Cloud Run |
| Retenção de conversa | nenhuma no primeiro incremento |
| Acesso público ao endpoint | rede pública, requisição negada sem JWT válido |

O ID do modelo é configurável por ambiente para permitir troca controlada por lifecycle sem alterar o contrato da aplicação.

## Consequências

### Positivas

- aproveita a infraestrutura e os créditos Google Cloud disponíveis;
- mantém uma única fonte de verdade para dados pessoais;
- evita chaves de modelo e `service_role` no navegador;
- permite limites, observabilidade técnica e avaliação centralizados;
- isola a IA dos serviços legados do Firebase.

### Custos e riscos

- há uma chamada adicional ao Supabase Auth por requisição;
- o serviço Cloud Run precisa de CORS, quotas e proteção contra abuso;
- `global` melhora disponibilidade do modelo, mas a política de processamento precisa ser refletida no consentimento;
- a service account e seus papéis precisam de revisão periódica;
- a ampliação do tool calling para leituras ou novas ações só poderá entrar depois de auditoria e testes contra prompt injection.

## Alternativas rejeitadas

### Chamar Gemini diretamente do navegador

Rejeitada por expor o provedor ao cliente e por não oferecer uma fronteira confiável para autorização, custo e ferramentas.

### Mover autenticação e banco para Firebase/Google Cloud

Rejeitada porque duplica o domínio já reconstruído no Supabase e aumenta o risco de divergência de identidade e privacidade.

### Usar somente Supabase Edge Functions para a IA

É tecnicamente possível, mas perde a autenticação nativa por workload identity e a proximidade operacional com Agent Platform/Vertex AI. Edge Functions continuam válidas para operações transacionais próximas do banco.

## Gates antes de ativar no frontend

1. service account dedicada com menor privilégio;
2. deploy do serviço e teste de saúde;
3. validação de JWT inválido, expirado e pertencente a outro usuário;
4. política de consentimento e processamento aprovada;
5. avaliação de segurança e linguagem com casos da Alumia;
6. limite de custo, timeout e quota;
7. revisão de logs para provar ausência de conteúdo;
8. smoke em staging com dados sintéticos.

## Estado da implementação em 27 de setembro de 2026

- gates 1 e 2 concluídos: identidade dedicada sem chave, Secret Manager, revisão Cloud Run e health check;
- JWT ausente é recusado com `401`; o teste autenticado ponta a ponta com usuário sintético continua pendente;
- chamada sintética direta ao `gemini-3.5-flash` concluída sem dados de usuário;
- custo inicial limitado por escala zero e máximo de três instâncias;
- integração do frontend implementada sob flag separada, desativada por padrão;
- proposta estruturada de criação de tarefa implantada na revisão `alumia-ai-00003-cs9`; o modelo apenas propõe e a interface exige confirmação;
- RPC `create_alumia_task_once` aplicada no Supabase com identificador único por usuário para garantir idempotência;
- validação unitária da allowlist, dos argumentos da proposta e do fluxo de confirmação concluída;
- gates de consentimento, avaliação, auditoria de logs e smoke autenticado ainda bloqueiam a liberação pública.
