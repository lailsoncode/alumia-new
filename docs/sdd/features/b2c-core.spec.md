# Feature specification — Alumia B2C

**ID:** `B2C`

**Versão:** 0.2.1

**Estado:** proposed

## 1. Resultado esperado

Uma pessoa consegue configurar sua experiência, realizar gestos de cuidado e consultar seu próprio histórico. Nenhuma ação cria punição por ausência e nenhum dado fica visível para empresa, suporte ou outro usuário.

## 2. Onboarding e módulos

### Requisitos

- `B2C-ONB-001`: após o primeiro login, apresentar a proposta da Alumia em no máximo três telas.
- `B2C-ONB-002`: permitir escolher check-in, tarefas, mindfulness e hidratação.
- `B2C-ONB-003`: permitir pular escolhas e alterar módulos depois.
- `B2C-ONB-004`: registrar preferências de acessibilidade e fuso.
- `B2C-ONB-005`: conclusão deve ser idempotente.

### Critérios

- `B2C-ONB-AC-01`: dado um usuário novo, ao concluir o fluxo, seu workspace e preferências existem uma única vez.
- `B2C-ONB-AC-02`: dado um módulo desativado, ele não aparece na home, mas continua disponível nas preferências.
- `B2C-ONB-AC-03`: pular não ativa notificações.
- `B2C-ONB-AC-04`: o fluxo funciona com teclado, leitor de tela e largura de 360 px.

## 3. Home pessoal

### Requisitos

- `B2C-HOME-001`: exibir saudação, módulos ativos e ações rápidas.
- `B2C-HOME-002`: priorizar no máximo uma tarefa importante, resumo do dia e hidratação quando os módulos estiverem ativos.
- `B2C-HOME-003`: mostrar estados vazios acolhedores.
- `B2C-HOME-004`: não exibir streak, ranking, atraso punitivo ou pontuação.

### Critérios

- `B2C-HOME-AC-01`: usuário sem dados encontra ao menos um próximo gesto claro.
- `B2C-HOME-AC-02`: módulo desativado não dispara consulta nem aparece na home.
- `B2C-HOME-AC-03`: falha de um módulo não impede carregar os demais.

## 4. Check-in emocional

### Escopo MVP

O primeiro incremento usa uma emoção principal, uma necessidade opcional e uma sugestão editorial. O modelo permite evoluir para seleção múltipla depois da revisão de conteúdo.

### Requisitos

- `B2C-CHK-001`: listar apenas emoções e necessidades publicadas.
- `B2C-CHK-002`: permitir selecionar uma emoção principal.
- `B2C-CHK-003`: permitir selecionar uma necessidade ou “só queria registrar”.
- `B2C-CHK-004`: criar check-in em uma operação idempotente por envio.
- `B2C-CHK-005`: selecionar sugestão por regra editorial determinística.
- `B2C-CHK-006`: salvar snapshot da sugestão apresentada.
- `B2C-CHK-007`: permitir consultar histórico paginado e excluir um registro.
- `B2C-CHK-008`: não incluir texto livre no incremento 001.
- `B2C-CHK-009`: não afirmar diagnóstico ou validação clínica.

### Estados

```text
idle → selecting → submitting → success
                   ↘ error → selecting
```

### Critérios

- `B2C-CHK-AC-01`: sem emoção, o formulário explica o campo necessário e não envia.
- `B2C-CHK-AC-02`: com entrada válida, exatamente um check-in é criado para a chave idempotente.
- `B2C-CHK-AC-03`: a resposta apresenta a sugestão e opção de voltar à home.
- `B2C-CHK-AC-04`: repetir a requisição não duplica o registro.
- `B2C-CHK-AC-05`: outro usuário, organização ou suporte não consegue selecionar o registro.
- `B2C-CHK-AC-06`: analytics recebe apenas `checkin_completed`, duração e resultado técnico.
- `B2C-CHK-AC-07`: exclusão remove o item da experiência e entra no fluxo de eliminação definido.

## 5. Tarefas gentis

### Requisitos

Os requisitos normativos `B2C-TSK-001` a `B2C-TSK-014` estão em [`task-creation.spec.md`](task-creation.spec.md). Eles cobrem criação e organização, recorrência diária ou semanal com múltiplos dias, séries sem término predefinido, materialização limitada, notificação padrão, alarme opcional, origem Estudante e telemetria privada.

A origem `student` fica reservada enquanto o módulo Estudante estiver fora do primeiro MVP.

### Critérios

Os critérios `B2C-TSK-AC-01` a `B2C-TSK-AC-14` estão na especificação detalhada. Eles verificam, entre outros casos, terça e quinta como duas ocorrências semanais, ausência de duplicidade, mudança de fuso, série ativa até desativação, lembrete sempre vinculado a uma data, avisos e isolamento dos dados.

## 6. Mindfulness

### Requisitos

- `B2C-MND-001`: listar práticas publicadas por duração e técnica.
- `B2C-MND-002`: oferecer alternativa textual para todo áudio.
- `B2C-MND-003`: permitir interromper sem marcar falha.
- `B2C-MND-004`: técnicas respiratórias devem ter revisão editorial e responsável.
- `B2C-MND-005`: animação respeita redução de movimento.

### Critérios

- `B2C-MND-AC-01`: usuário inicia e encerra prática usando apenas teclado.
- `B2C-MND-AC-02`: interrupção não gera mensagem negativa.
- `B2C-MND-AC-03`: mídia indisponível apresenta transcrição e erro recuperável.

## 7. Hidratação

### Requisitos

- `B2C-HYD-001`: registrar quantidade predefinida ou personalizada.
- `B2C-HYD-002`: permitir configurar recipiente padrão e unidade.
- `B2C-HYD-003`: exibir total diário no fuso do usuário.
- `B2C-HYD-004`: referência diária é opcional, explicável e não prescritiva.
- `B2C-HYD-005`: entrada incorreta pode ser removida.

### Critérios

- `B2C-HYD-AC-01`: quantidade zero, negativa ou acima do limite defensivo é rejeitada.
- `B2C-HYD-AC-02`: retry com mesma chave não duplica entrada.
- `B2C-HYD-AC-03`: total diário respeita mudança de data no fuso configurado.
- `B2C-HYD-AC-04`: empresa e platform admin não acessam os registros.

## 8. Preferências e privacidade

- `B2C-PRF-001`: ativar e desativar módulos.
- `B2C-PRF-002`: alterar tema, idioma, fuso e redução de movimento.
- `B2C-PRF-003`: configurar notificações por módulo e horário de silêncio.
- `B2C-PRF-004`: solicitar exportação e exclusão.
- `B2C-PRF-005`: editar perfil sem expor dados sensíveis.

## 9. Telemetria permitida

- onboarding iniciado/concluído;
- módulo ativado/desativado;
- fluxo iniciado/concluído/falhou;
- duração técnica e código de erro sanitizado.

Proibido enviar emoção, necessidade, título, nota, quantidade de água individual ou conteúdo da prática.

## 10. Dependências

- autenticação e workspace;
- catálogos editoriais publicados;
- RLS pessoal;
- design system;
- consentimentos e política de privacidade.
