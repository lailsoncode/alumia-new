# Constituição de desenvolvimento da Alumia

**ID:** `CONST`  
**Versão:** 1.0.0  
**Estado:** proposed

Estes princípios são requisitos. Uma feature que os viole não está pronta, mesmo que funcione tecnicamente.

## CONST-01 — Cuidado sem coerção

A Alumia deve apoiar escolhas voluntárias. O produto não usa perda de sequência, ranking de bem-estar, punição por ausência, contagem regressiva ameaçadora ou mensagens de culpa.

Critérios:

- ausência não produz estado de fracasso;
- tarefas vencidas podem ser reagendadas ou arquivadas sem linguagem punitiva;
- qualquer celebração pode ser ignorada e não altera acesso a recursos essenciais;
- métricas de uso não viram avaliação de valor pessoal ou profissional.

## CONST-02 — Privacidade por propriedade

Registros pessoais pertencem à pessoa usuária. Vínculo com uma empresa pode conceder benefícios, mas não transfere propriedade do workspace nem autoriza leitura de check-ins, tarefas, hidratação, sessões, notas ou conversas pessoais.

Critérios:

- toda tabela pessoal possui proprietário verificável por RLS;
- papéis corporativos não recebem política de leitura sobre tabelas pessoais;
- saída da empresa remove o benefício e preserva a conta pessoal;
- suporte privilegiado exige escopo mínimo, motivo, prazo e auditoria.

## CONST-03 — Separação entre autocuidado e trabalho

O domínio B2C e o domínio de riscos ocupacionais compartilham identidade e infraestrutura, mas não compartilham registros sensíveis. Indicadores B2C não alimentam relatórios corporativos.

Critérios:

- nenhum relatório B2B consulta tabelas de autocuidado;
- respostas ocupacionais não aparecem na experiência pessoal como diagnóstico;
- o modelo de dados identifica claramente `workspace_id` ou `organization_id`;
- não existe chave implícita que permita cruzamento individual entre os domínios.

## CONST-04 — Apoio técnico, sem diagnóstico ou garantia legal

A Alumia Empresas organiza o processo de identificação, avaliação e gestão de fatores de risco psicossociais relacionados ao trabalho. Ela não diagnostica pessoas, não substitui profissional competente, não assina laudos e não garante conformidade com a NR-1.

Critérios:

- textos e relatórios usam linguagem de apoio e rastreabilidade;
- classificações de risco exigem critérios e responsável identificados;
- questionários são insumos complementares;
- exportações registram método, versão, autoria e limitações.

## CONST-05 — Segurança no servidor e no banco

A interface nunca é a fronteira final de autorização. Toda operação relevante é protegida por sessão, papel, escopo, entitlement, RLS, constraint ou função server-side.

Critérios:

- tabelas sensíveis têm RLS habilitada antes de receber dados;
- operações críticas são transacionais e idempotentes quando necessário;
- `service_role` e segredos nunca entram no bundle;
- testes provam isolamento entre usuários e organizações.

## CONST-06 — Especificação verificável

Toda feature começa por comportamento observável e critérios de aceitação. A especificação descreve o que deve ser verdadeiro; o plano técnico descreve como entregar.

Critérios:

- requisitos possuem IDs estáveis;
- estados, transições, papéis e falhas esperadas estão definidos;
- testes relevantes citam os critérios que verificam;
- alteração de contrato atualiza a especificação antes do merge.

## CONST-07 — Acessibilidade como requisito

Fluxos essenciais devem funcionar com teclado, leitor de tela, zoom, redução de movimento e toque. Cor e ícone não podem ser o único meio de comunicar estado.

Critérios:

- controles possuem nome acessível;
- foco é visível e segue ordem lógica;
- alvos de toque têm ao menos 44 por 44 CSS pixels;
- contraste atende WCAG 2.2 AA;
- animações respeitam `prefers-reduced-motion`.

## CONST-08 — Linguagem e conteúdo controlados

Conteúdo de cuidado, instrumentos, notificações e recomendações são versionados. Publicação exige autoria, revisão e estado editorial.

Critérios:

- conteúdo publicado não é alterado retroativamente sem nova versão;
- check-ins guardam snapshot da sugestão apresentada;
- alegações metodológicas passam por revisão adequada;
- variações de nome e erros editoriais são bloqueados pelo glossário oficial.

## CONST-09 — IA não é dependência do MVP

A primeira versão usa conteúdo editorial determinístico. IA generativa só entra com finalidade, consentimento, retenção, avaliação de segurança, limites de crise, custo e observabilidade definidos.

## CONST-10 — Migração seletiva do FlutterFlow

O protótipo é referência de produto, conteúdo e identidade visual. Código gerado, autenticação, navegação, regras e integrações são reimplementados. Dados pessoais só migram após inventário, necessidade, base legal e plano de validação.

## Processo de exceção

Uma exceção exige:

1. ADR com contexto, alternativas e prazo de revisão;
2. análise de impacto em privacidade e segurança;
3. aprovação explícita do responsável pelo produto;
4. plano de remoção quando for temporária.

