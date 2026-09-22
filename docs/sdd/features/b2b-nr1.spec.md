# Feature specification — Alumia Empresas e NR-1

**ID:** `B2B`  
**Versão:** 0.1.0  
**Estado:** proposed; instrumentos dependem de revisão técnica especializada

## 1. Resultado esperado

Uma organização consegue documentar um ciclo de gestão de fatores de risco psicossociais relacionados ao trabalho, da preparação ao acompanhamento das medidas, preservando participação, confidencialidade, competência técnica e rastreabilidade.

## 2. Limites

A plataforma:

- apoia AEP, inventário, plano de ação e acompanhamento;
- organiza metodologia, evidências, participação e comunicação;
- não diagnostica saúde mental;
- não substitui profissional competente;
- não transforma questionário em laudo automático;
- não garante conformidade;
- não usa dados B2C em análise ocupacional.

## 3. Organização e estabelecimentos

- `B2B-ORG-001`: organization admin configura dados básicos e estabelecimentos.
- `B2B-ORG-002`: setores, funções e unidades de avaliação pertencem a um estabelecimento.
- `B2B-ORG-003`: membros podem receber papel e escopo por estabelecimento.
- `B2B-ORG-004`: usuário pode alternar organizações sem misturar caches.
- `B2B-ORG-005`: toda alteração relevante entra em auditoria.

Critérios:

- `B2B-ORG-AC-01`: membro da organização A não lê dados da B.
- `B2B-ORG-AC-02`: membro limitado ao estabelecimento X não lê Y.
- `B2B-ORG-AC-03`: slug é único, mas autorização usa ID verificado.

## 4. Benefício para funcionários

- `B2B-BEN-001`: organization admin convida beneficiário dentro do limite de assentos.
- `B2B-BEN-002`: convite pode vincular conta existente sem criar outro workspace.
- `B2B-BEN-003`: aceite concede entitlement sem conceder papel administrativo.
- `B2B-BEN-004`: revogação remove o benefício e preserva conta e dados pessoais.
- `B2B-BEN-005`: empresa vê estado da licença, nunca uso pessoal.

Critérios:

- `B2B-BEN-AC-01`: convite repetido não consome assento duplicado.
- `B2B-BEN-AC-02`: limite contratado é aplicado no servidor.
- `B2B-BEN-AC-03`: painel empresarial não possui consulta de check-ins ou tarefas.
- `B2B-BEN-AC-04`: usuário desligado continua acessando seu plano pessoal efetivo.

## 5. Ciclo de avaliação

- `B2B-CYC-001`: SST cria ciclo em rascunho com estabelecimento, período e responsável.
- `B2B-CYC-002`: ciclo referencia uma versão de metodologia.
- `B2B-CYC-003`: critérios e escopo viram snapshot antes da coleta.
- `B2B-CYC-004`: ciclo possui transições controladas.
- `B2B-CYC-005`: encerramento exige inventário publicado ou justificativa documentada.

Transições:

```text
draft → prepared → collecting → analysis → action_planning
      → monitoring → closed
qualquer estado ativo → cancelled, com motivo e permissão
```

Critérios:

- `B2B-CYC-AC-01`: usuário não autorizado não muda estado.
- `B2B-CYC-AC-02`: transição inválida é rejeitada no servidor.
- `B2B-CYC-AC-03`: alteração de metodologia após coleta cria nova versão ou ciclo.

## 6. Unidades, métodos e evidências

- `B2B-MTH-001`: definir unidades por estabelecimento, setor, função, atividade ou grupo similar de exposição.
- `B2B-MTH-002`: registrar observação, entrevista, reunião, análise documental e questionário como métodos possíveis.
- `B2B-MTH-003`: justificar os métodos adotados.
- `B2B-MTH-004`: anexos usam Storage privado e classificação.
- `B2B-MTH-005`: evidência registra autoria, data e hash quando aplicável.

## 7. Participação e campanhas

- `B2B-PAR-001`: campanha usa template e versão publicados.
- `B2B-PAR-002`: participante recebe finalidade, privacidade, prazo e canal de suporte.
- `B2B-PAR-003`: token é expiráveis, revogável e limitado ao fluxo.
- `B2B-PAR-004`: resposta não cria acesso à organização.
- `B2B-PAR-005`: relatório aplica limiar mínimo e supressão contra reidentificação.
- `B2B-PAR-006`: questionário permanece um método complementar.

Critérios:

- `B2B-PAR-AC-01`: grupo abaixo do limiar mostra somente estado suprimido.
- `B2B-PAR-AC-02`: combinações de filtros que reduzam abaixo do limiar também são suprimidas.
- `B2B-PAR-AC-03`: gestor não seleciona resposta individual.
- `B2B-PAR-AC-04`: token expirado, revogado ou fora do período é rejeitado.
- `B2B-PAR-AC-05`: submissão repetida respeita política declarada e não duplica indevidamente.

## 8. Achados e inventário

- `B2B-RSK-001`: SST consolida achados por unidade e fator.
- `B2B-RSK-002`: achado referencia evidências e responsável.
- `B2B-RSK-003`: item do inventário registra perigo, exposição, agravos possíveis, controles e critérios.
- `B2B-RSK-004`: probabilidade, severidade e nível seguem matriz versionada.
- `B2B-RSK-005`: publicação cria snapshot imutável e hash.
- `B2B-RSK-006`: revisão não altera versão publicada.

Critérios:

- `B2B-RSK-AC-01`: item incompleto não é publicado.
- `B2B-RSK-AC-02`: nível calculado é reproduzível a partir da versão da matriz.
- `B2B-RSK-AC-03`: exportação antiga continua ligada ao snapshot original.

## 9. Plano de ação

- `B2B-ACT-001`: ação possui medida, hierarquia de prevenção, responsável, prazo, prioridade e estado.
- `B2B-ACT-002`: action owner altera somente ações atribuídas e campos permitidos.
- `B2B-ACT-003`: implementação aceita evidências privadas.
- `B2B-ACT-004`: eficácia registra método, conclusão, responsável e próxima revisão.
- `B2B-ACT-005`: ação ineficaz pode originar nova medida sem apagar a anterior.

Critérios:

- `B2B-ACT-AC-01`: marcar como implementada exige data e, quando configurado, evidência.
- `B2B-ACT-AC-02`: marcar como efetiva exige revisão registrada.
- `B2B-ACT-AC-03`: mudança de prazo, responsável ou status entra no audit log.

## 10. Comunicação e exportação

- `B2B-EXP-001`: registrar comunicação de riscos e medidas aos trabalhadores.
- `B2B-EXP-002`: exportar dossiê com escopo, metodologia, unidades, evidências, inventário, ações e histórico.
- `B2B-EXP-003`: export contém versão, autor, data e hash.
- `B2B-EXP-004`: export não inclui respostas individuais ou dados B2C.
- `B2B-EXP-005`: geração é assíncrona, observável e retomável.

## 11. Dashboard permitido

- andamento do ciclo;
- cobertura por unidade;
- participação quando acima do limiar;
- fatores e riscos consolidados;
- ações por estado, prioridade e prazo;
- eficácia revisada;
- documentos e comunicações pendentes.

Proibido:

- score individual;
- ranking de “saúde mental” de equipes;
- emoção B2C;
- tentativa de identificar respondentes;
- afirmação automática de conformidade.

## 12. Dependências de publicação

- metodologia revisada por profissional competente;
- instrumento e conteúdo versionados;
- política de privacidade e retenção da implantação;
- limiar de anonimato aprovado;
- testes RLS e de supressão;
- empresa piloto e responsável técnico identificados.

