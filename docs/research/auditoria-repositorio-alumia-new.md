# Auditoria técnica do repositório Alumia

**Repositório:** Alumia — este repositório  
**Branch examinada:** `main`  
**Commit:** `c15dd77`  
**Data da análise:** 21 de setembro de 2026  
**Método:** leitura do código e do histórico, instalação reproduzível pelo lockfile, lint, TypeScript, build, auditoria de dependências e smoke test local. Nenhum arquivo rastreado do repositório foi alterado.

## Parecer

O repositório deve ser preservado e usado como ponto de partida visual e funcional da Alumia B2C. Ele já contém identidade de produto, componentes mobile-first, autenticação Supabase, tarefas, hidratação, perfil, Hugeicons, Tailwind, shadcn e projetos Capacitor. Descartá-lo eliminaria trabalho aproveitável.

Ele ainda não é uma fundação segura para acrescentar B2B, painel master, NR-1 ou dados sensíveis de bem-estar. O estado atual é o de um protótipo B2C funcional: compila e passa nos gates estáticos, mas não possui testes, CI, modelo multi-tenant, perfis de acesso, trilha de auditoria ou separação entre contexto pessoal e corporativo. Há também uma falha de privacidade na política de perfis e dependências com vulnerabilidades críticas conhecidas.

A direção recomendada é fazer uma **recuperação controlada no mesmo repositório**, por incrementos do SDD. A interface, os assets e parte dos componentes podem ser mantidos; identidade, banco, autorização, contratos de dados, qualidade e observabilidade precisam de uma nova base antes de ampliar o produto.

## Estado verificado

| Verificação | Resultado | Leitura prática |
|---|---:|---|
| `npm ci` | passou | o lockfile reproduz a instalação |
| `npx tsc --noEmit` | passou | não há erros de TypeScript no estado atual |
| `npm run lint` | passou com 7 avisos | os avisos são de Fast Refresh; a regra de variáveis não usadas está desativada |
| `npm run build` | passou | cliente e SSR são gerados |
| Smoke local sem `.env` | falhou no SSR | todas as páginas retornam o shell, mas o servidor cai em renderização cliente por `supabaseUrl is required` |
| Testes automatizados | inexistentes | não há runner, suítes ou cobertura |
| CI | inexistente | não há workflow versionado |
| `npm audit` | 19 ocorrências | 2 baixas, 7 moderadas, 8 altas e 2 críticas; 18 permanecem com `--omit=dev` |
| Git após a análise | limpo | nenhum arquivo rastreado foi modificado |

O build bem-sucedido não representa uma instalação pronta para execução. O cliente Supabase usa strings vazias quando as variáveis não existem (`src/lib/supabaseClient.ts:6-11`), e não há validação antecipada nem guia operacional suficiente. Em desenvolvimento, a falha SSR também expõe stack traces e caminhos locais no HTML entregue.

## O que já existe

### Stack

- React 19, TypeScript 5.8 e Vite 7.
- TanStack Start e TanStack Router com rotas por arquivo.
- Supabase para autenticação e PostgreSQL/RLS.
- Tailwind CSS 4, Radix e componentes shadcn.
- Hugeicons instalado e usado na navegação e em componentes do produto.
- React Hook Form, Zod e TanStack Query instalados, mas ainda não adotados no fluxo funcional.
- Capacitor 8 com projetos Android e iOS já criados.

### Produto B2C

- Login, cadastro, redefinição de senha e conclusão de perfil.
- Home autenticada com saudação, tarefas e hidratação.
- Criação, edição e conclusão de tarefas.
- Registro, histórico, meta e reversão do último lançamento de hidratação.
- Tela de módulos, ajustes e perfil.
- Assets, tokens visuais e boa parte da linguagem do produto.

### O que não existe

- Organização, workspace, empresa, funcionário, convite e vínculo empregatício.
- Contexto pessoal separado do contexto corporativo.
- Papéis de master admin, admin da empresa, gestor e usuário final.
- Assinatura, entitlement, limites de plano ou cobrança.
- Painel master e painel da empresa.
- Instrumentos, campanhas, check-ins reais, relatórios agregados ou exportações.
- Consentimento versionado, retenção, anonimização e trilha de auditoria.
- Testes, CI, observabilidade e processo de migração/seed local completo.

## Achados prioritários

### P0 — bloquear evolução funcional até corrigir

1. **Leitura indevida de todos os perfis.** A policy `Allow authenticated select` usa `using (true)` em `supabase/migrations/20260608183600_create_profiles.sql:16-19`. Qualquer usuário autenticado pode ler todos os registros de `profiles`, inclusive `bio` e `goals`. Deve ser corrigida por uma migration aditiva, com seleção restrita ao próprio usuário e regras explícitas para papéis administrativos.

2. **Função privilegiada sem endurecimento.** `handle_new_user()` é `security definer` e não fixa `search_path` (`create_profiles.sql:33-45`). A migration corretiva deve definir o schema usado, revisar owner/grants e qualificar os objetos.

3. **Dependências vulneráveis.** A auditoria encontrou vulnerabilidades críticas em cadeias que incluem `seroval`/TanStack Start e `tar`/Capacitor CLI. O dry run indica atualizações compatíveis disponíveis. A correção deve atualizar o lockfile, mover `@capacitor/cli` para `devDependencies` e repetir build, smoke e testes.

4. **Ambiente e SSR não estão protegidos.** Sem as variáveis do Supabase, a aplicação falha durante SSR. Além disso, `HydrationPage` lê `localStorage` na inicialização do estado e quebra quando a rota é renderizada no servidor. É necessário um schema de ambiente, mensagem de erro curta, documentação de bootstrap e separação segura entre código de browser e servidor.

5. **Decisão pendente sobre SSR.** O código foi escrito como aplicação cliente, mas roda sobre TanStack Start. Isso adiciona uma superfície de servidor que hoje não é usada de forma coerente. Antes do primeiro incremento, registrar um ADR escolhendo entre:
   - manter TanStack Start e desenhar corretamente autenticação, variáveis e carregamento no servidor; ou
   - manter Vite e TanStack Router como SPA/PWA e retirar a camada Start/SSR.

   Para o MVP atual, a segunda opção é a mais simples e coerente com o SDD; páginas institucionais podem ser tratadas separadamente se SEO se tornar requisito.

### P1 — corrigir na fundação

1. **Ausência de modelo multi-tenant.** `tasks` e `hydration_logs` pertencem diretamente a `user_id`. Não há `workspace_id`, membership ou entidade corporativa. O B2B não deve ser encaixado nesse modelo por condicionais na interface; precisa das tabelas e políticas definidas no SDD.

2. **Autenticação duplicada.** Cada uso de `useAuth()` executa sua própria consulta de sessão e cria uma assinatura de mudança. Um `AuthProvider` único deve controlar sessão, carregamento e perfil. A autorização precisa continuar no banco; guards de rota são somente uma camada de UX.

3. **Bibliotecas instaladas sem integração.** React Query não tem provider, query ou mutation no app. React Hook Form e Zod não são usados nos formulários principais. A fundação deve adotá-los nos fluxos novos ou removê-los para evitar uma stack apenas nominal.

4. **Tipos do banco não são gerados.** Serviços usam tipos manuais e respostas frouxas. Deve haver geração versionada de tipos Supabase e contratos explícitos para leitura e escrita.

5. **Artefatos locais do Supabase estão no Git.** `supabase/.temp` está rastreado e contém metadados do projeto vinculado. Esses arquivos devem sair do índice e entrar no `.gitignore`; o histórico deve ser examinado antes de decidir se algum dado precisa ser rotacionado.

6. **Sem testes nem CI.** O repositório precisa de gates mínimos para migrations/RLS, serviços, fluxos críticos e build. A ausência de testes é especialmente grave porque a próxima etapa altera identidade e isolamento de dados.

### P2 — corrigir ao migrar as funcionalidades

- **Recorrência aparente, mas não implementada.** A tela permite escolher repetição, porém o valor não chega ao `onSave`, ao serviço ou ao banco. O changelog apresenta a função como pronta.
- **Datas podem mudar por fuso horário.** Vários fluxos derivam a data civil de `toISOString()`, que usa UTC. Tarefas podem cair no dia anterior ou seguinte conforme horário e fuso. Datas civis precisam ser tratadas como `YYYY-MM-DD` local; instantes, como UTC.
- **Upload de avatar no banco.** A imagem é convertida em data URL/base64 e gravada em `profiles.avatar_url`. Deve ir para Supabase Storage, com limite de tamanho, tipo e política de acesso.
- **Hidratação contém orientação não validada.** A interface atribui à OMS a fórmula de 35 ml/kg e a apresenta como recomendação diária. Essa afirmação precisa de revisão de produto/clínica; o SDD já orienta usar uma referência configurável e não prescritiva.
- **Preferências não persistem.** Notificações, idioma e parte das metas vivem somente no estado local ou `localStorage`. O toggle de notificações começa ativo sem registro de consentimento.
- **Métricas e recompensas fictícias.** Ajustes mostra “5 check-ins emocionais feitos” e badges estáticos, embora não exista a funcionalidade de check-in. Módulos futuros também usam mocks e switches locais.
- **Acessibilidade incompleta.** Inputs de autenticação dependem de placeholder; erros não são associados/anunciados; o toggle de notificações não expõe nome, `role="switch"` e `aria-checked`; o item Comunidade usa link com `aria-disabled`, sem desabilitação semântica completa.
- **Duas bibliotecas de ícones.** Hugeicons e Lucide coexistem; `components.json` e a documentação ainda apontam para Lucide. Hugeicons deve ser o padrão de produto, com exceções documentadas apenas quando inevitáveis.
- **Idioma do documento incorreto.** O shell usa `<html lang="en">` e páginas de erro em inglês, enquanto a aplicação é em português.
- **Dados e operações sem escala defensiva.** Tarefas e hidratação são carregadas em bloco, sem paginação. Hidratação aceita qualquer valor positivo e não tem chave de idempotência contra envio duplicado.

## Compatibilidade com o SDD da Alumia

Estimativa de maturidade, usada apenas para orientar o plano:

| Área | Estado aproximado | Diagnóstico |
|---|---:|---|
| Identidade visual e componentes B2C | 65% | bom material reaproveitável |
| Fluxos B2C atuais | 45% | tarefas e hidratação funcionam parcialmente |
| Fundação de frontend | 40% | stack boa, integração incompleta e SSR indefinido |
| Fundação de dados e segurança | 25% | RLS básica, com falha grave e sem tipos/tenancy |
| Qualidade operacional | 10% | build existe; faltam testes, CI e observabilidade |
| B2B e NR-1 | 0% | ainda não modelado |
| Painel master | 0% | ainda não modelado |

O código atual corresponde principalmente ao protótipo visual B2C. O SDD deve passar a ser a fonte normativa. README, changelog e `docs/metodologia.md` estão defasados: descrevem inteligência adaptativa, times, fitness, estudante, badges, Lucide e Capacitor precoce, enquanto o novo escopo prioriza bem-estar seguro, PWA, isolamento de dados, B2C/B2B e administração.

## Estratégia de reaproveitamento

### Manter

- Assets de marca, tipografia, tokens visuais e direção mobile-first.
- React, Vite, TypeScript, Tailwind, Radix/shadcn, Supabase e Hugeicons.
- Estrutura visual das telas de autenticação, home, tarefas e hidratação.
- Componentes de navegação e feedback que passarem pela revisão de acessibilidade.
- Conceitos de serviço que já dependem de RLS, após tipagem e adoção de React Query.

### Refatorar

- Sessão e perfil em providers centrais.
- Rotas em grupos públicos, pessoais, corporativos e administrativos.
- Banco para `workspaces`, `memberships`, papéis, entitlements e domínios separados.
- Serviços com tipos gerados, paginação, idempotência e erros de domínio.
- Formulários com React Hook Form e Zod.
- Datas, recorrência, preferências, notificações e upload de avatar.
- Hidratação como recurso configurável, sem alegação clínica não validada.

### Remover ou adiar

- Métricas, badges e check-ins simulados.
- Módulos Alum.IA, Comunidade, Estudante e demais experiências baseadas em mocks.
- Ativação de Capacitor até a PWA e os fluxos centrais estarem estáveis. Os projetos nativos podem permanecer arquivados, sem dirigir a arquitetura agora.
- Claims de adaptação emocional por IA enquanto não houver especificação de segurança, consentimento, avaliação e governança.

## Ordem recomendada de execução

1. **Congelar o baseline:** tag do estado atual e branch de recuperação; copiar o pacote SDD para `docs/specs` e declarar sua precedência sobre a documentação antiga.
2. **INC-000 — segurança e reprodutibilidade:** corrigir RLS de perfis e a função privilegiada, retirar `.temp`, validar ambiente, atualizar dependências e revisar o histórico por segredos.
3. **ADR-001 — runtime web:** decidir Start/SSR versus SPA/PWA e ajustar o projeto para uma única arquitetura.
4. **INC-001 — fundação:** scripts `typecheck`, `test` e `check`; CI; QueryClient; AuthProvider; tratamento de erro; logger; tipos gerados; tokens e Hugeicons padronizados.
5. **INC-002 — identidade e tenancy:** workspaces pessoais e corporativos, memberships, papéis, convites e RLS com testes negativos de isolamento.
6. **INC-003 — reconstrução B2C:** onboarding, consentimento, check-in, tarefas corrigidas e hidratação revisada, migrando os componentes visuais existentes.
7. **INC-004 — B2B seguro:** empresa, campanhas/instrumentos, agregação com limiar mínimo e ausência de exposição individual.
8. **INC-005 — painel master:** organizações, planos, entitlements, suporte auditado e indicadores operacionais sem acesso livre ao conteúdo sensível.

Cada incremento deve deixar o produto publicável, com critérios de aceite do SDD, migrations reversíveis ou corretivas, teste de RLS e uma demonstração funcional. B2B e painel master só devem começar depois que o isolamento entre usuários e workspaces estiver coberto por testes automatizados.

## Próximo movimento concreto

O primeiro trabalho de código deve ser o **INC-000**, não uma nova tela. Ele elimina a exposição de perfis, torna o ambiente executável, reduz vulnerabilidades e fixa a escolha de runtime. Com essa base, o primeiro incremento funcional pode reutilizar a interface existente sem carregar as limitações de segurança e arquitetura do protótipo.
