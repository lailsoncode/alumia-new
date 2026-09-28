# Feature specification — Mindfulness

**ID:** `B2C-MND`

**Versão:** 0.1.0

**Estado:** implemented, verification pending

## 1. Resultado esperado

A pessoa escolhe uma prática curta em áudio ou texto, pode pausar ou encerrar quando quiser e registra uma reflexão opcional sem receber avaliação, diagnóstico ou mensagem de falha.

## 2. Escopo desta entrega

- catálogo editorial publicado e versionado;
- busca por título e descrição;
- filtros por duração, formato e categoria;
- prática guiada com contador baseado em instante-alvo;
- transcrição sempre disponível;
- narração opcional pela mesma voz configurada do módulo Alumia AI, com texto como fallback;
- alternativa sensorial quando observar a respiração não for confortável;
- reflexão opcional após a prática;
- lembrete opcional integrado ao módulo Tarefas;
- sessões privadas protegidas por RLS.

Ficam fora desta entrega: streaming de mídia, download offline de áudio gravado, trilhas clínicas, prescrição, metas diárias, streak, pontuação e recomendação generativa.

## 3. Requisitos

- `B2C-MND-001`: listar somente versões publicadas do catálogo, ordenadas editorialmente.
- `B2C-MND-002`: oferecer transcrição textual completa para toda prática com formato de áudio.
- `B2C-MND-003`: permitir pausar, continuar e encerrar antecipadamente sem marcar falha.
- `B2C-MND-004`: identificar responsável pela revisão editorial de técnicas respiratórias.
- `B2C-MND-005`: respeitar redução de movimento e manter a orientação compreensível sem animação.
- `B2C-MND-006`: permitir buscar e filtrar por duração, formato e categoria.
- `B2C-MND-007`: oferecer uma alternativa não respiratória dentro de práticas de respiração.
- `B2C-MND-008`: registrar apenas snapshot da prática, formato, duração, encerramento antecipado e reflexão opcional.
- `B2C-MND-009`: criar lembrete somente após escolha explícita e identificá-lo com `module_key = mindfulness`.
- `B2C-MND-010`: impedir que outro usuário, organização, suporte ou platform admin leia sessões individuais.

## 4. Estados

```text
início → biblioteca → prática ↔ pausa → reflexão → início
            ↘ prática alternativa            ↘ nova prática
                                         ↘ lembrete em tarefas
```

## 5. Critérios de aceitação

- `B2C-MND-AC-01`: todo card informa duração e formatos antes de iniciar.
- `B2C-MND-AC-02`: narração indisponível mantém a transcrição e apresenta erro recuperável.
- `B2C-MND-AC-03`: encerrar antes do contador registra `ended_early`, nunca falha.
- `B2C-MND-AC-04`: uma prática respiratória não orienta prender ou aprofundar a respiração e expõe alternativa sensorial.
- `B2C-MND-AC-05`: reflexão vazia é aceita.
- `B2C-MND-AC-06`: escolher “mais tarde” ou “amanhã” cria tarefa com rota de retorno `/mindfulness`.
- `B2C-MND-AC-07`: o contador compensa throttling do navegador e pausa sem perder o tempo restante.
- `B2C-MND-AC-08`: todos os fluxos principais funcionam com teclado, leitor de tela e controles de ao menos 44 px.

## 6. Evidências atuais

- migration `20260927010000_create_mindfulness_module.sql` com catálogo, snapshots, RLS e RPC;
- domínio e testes em `src/lib/mindfulness.ts`;
- serviço em `src/services/mindfulnessService.ts`;
- rota `/mindfulness` e componentes em `src/components/shared/mindfulness`;
- mockups em `docs/mockups/mindfulness`;
- rota de notificações acadêmicas e de Mindfulness coberta por teste.

Permanecem pendentes: teste negativo de RLS com dois usuários, smoke conectado ao Supabase, revisão editorial externa do catálogo e auditoria manual com leitor de tela.
