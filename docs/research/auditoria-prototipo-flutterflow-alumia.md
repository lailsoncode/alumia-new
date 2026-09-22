# Auditoria do protótipo FlutterFlow da Alumia

**Data da inspeção:** 21 de setembro de 2026  
**Projeto:** `Alumia` (`alumia-t108bs`)  
**Ambientes observados:** editor visual, visualização do código gerado e versão executável autenticada  
**Método:** leitura e navegação; nenhum cadastro, conteúdo ou configuração foi alterado

## 1. Conclusão executiva

O protótipo contém uma **boa referência de produto B2C**, com linguagem de marca consistente, navegação móvel, dados persistidos e vários fluxos já demonstráveis. Ele deve ser usado para recuperar decisões de experiência, conteúdo, catálogo de módulos e regras de interação.

O código não deve ser adotado como fundação da nova Alumia. A implementação atual depende do código gerado pelo FlutterFlow, Flutter e Firebase, enquanto a arquitetura aprovada usa React, TypeScript e Supabase. A migração mais valiosa é de **produto, conteúdo, assets e dados**, seguida de uma reimplementação controlada das regras.

O protótipo **não possui uma solução B2B funcional**. Existe uma página chamada `teams`, mas sua interface reproduz a página de estudos. Não foram encontradas superfícies de empresa, colaboradores, convites, assentos, organização multi-tenant, painel master, papéis corporativos, indicadores agregados ou fluxo NR-1. A Alumia Empresas e o painel master são desenvolvimento novo.

## 2. Inventário encontrado

O projeto possui 20 páginas:

- `welcome`, `login`, `createaccount` e `resetpass`;
- `onboarding`, `complete_profile` e `edit_profile`;
- `home`, `modulos` e `settings`;
- `tasks`, `hydration`, `mindfulness`, `checkin` e `study`;
- `chatAI`, `comunidade`, `forumpost`, `insignias` e `teams`.

Também foram observados componentes reutilizáveis para:

- barra lateral e navegação;
- saudação;
- criação, visualização e confirmação de tarefas;
- seleção de módulos;
- criação de post e comentário;
- pop-up de insígnia;
- estado vazio do chat;
- seleção de data.

O projeto estava associado à branch `main`, com ambiente identificado como `Production`. O histórico visível mostrava uma publicação em 31 de outubro de 2025 e execuções do projeto em 28 de abril de 2025.

## 3. O que está implementado no produto

| Área | Estado observado | Leitura para o novo produto |
|---|---|---|
| Onboarding | Três passos com mensagens “Ilumine sua rotina”, “Escolha seus caminhos” e “Cresça com gentileza” | Preservar o tom e testar um fluxo mais curto com escolha de módulos |
| Autenticação | Cadastro e login por e-mail/senha, recuperação e Google | Reimplementar em Supabase Auth mantendo a jornada |
| Início | Saudação, humor, tarefa prioritária, cuidados pendentes, hidratação e módulos ativos | Boa referência para o painel B2C mobile-first |
| Tarefas | Separação entre “importa hoje”, itens com horário e itens que podem esperar; abas hoje/em breve | Preservar o modelo mental e reescrever recorrência, fuso e histórico |
| Check-in | Emoções positivas e negativas, necessidade atual e envio do check-in | Preservar como base editorial, após revisão metodológica e de linguagem |
| Mindfulness | Durações de 1 a 20 minutos e técnicas 4-4-4, 4-2-4, 4-7-8 e livre | Reaproveitar catálogo e experiência; validar instruções e acessibilidade |
| Hidratação | Sugestão diária, recálculo e registros de 200 ml, 500 ml ou outro valor | Reescrever a regra da sugestão e evitar linguagem de prescrição |
| Estudante | Trilhas, métodos, microcursos e benefícios estudantis | Está marcado como WIP; manter fora do MVP atual |
| Alum.IA | Conversa vazia, entrada de texto e indicação visual de Gemini; módulo marcado como PRO | Adiar até existir política de segurança, avaliação e custo por uso |
| Comunidade | Fórum, ideias, desabafos, recursos, posts, comentários e atalhos externos | Funciona como prova de conceito; exige moderação real antes de produção |
| Perfil | Perfil, preferências, tema, idioma, indicadores e logout | Reaproveitar o mapa de preferências, com controles de privacidade e dados |
| Insígnias | Coleção com 14 conquistas temáticas | Rever: pode conflitar com a regra de ausência de pressão e gamificação |
| Teams | Página existente, mas com o mesmo conteúdo da área de estudos | Não representa uma implementação B2B |

## 4. Sinais técnicos confirmados

O código gerado mostra dependências e integrações com:

- Firebase Authentication;
- backend do FlutterFlow/Firebase;
- Firebase Storage;
- chamadas de API;
- Firebase Analytics por eventos de visualização;
- FlutterFlow AI Agents;
- Provider;
- Google Fonts;
- widgets e componentes gerados pelo FlutterFlow.

A página da Alum.IA importa autenticação, backend, storage, estruturas de schema, chamadas de API e o módulo de AI Agents. A interface executável identifica o provedor como Gemini.

Esses sinais provam que o protótipo vai além de telas estáticas, mas não demonstram que regras de autorização, privacidade, exclusão, retenção ou isolamento foram implementadas de forma adequada. O schema do Firestore, suas regras de segurança e as funções externas precisam de uma exportação técnica separada antes de qualquer migração de dados.

## 5. Ativos que valem ser reaproveitados

### Reaproveitar diretamente como referência

- voz acolhedora e linguagem sem cobrança;
- estrutura do onboarding;
- hierarquia da tela inicial;
- modelo mental das tarefas;
- catálogo inicial de emoções, necessidades e técnicas de respiração;
- organização dos módulos opt-in;
- ilustrações, paleta e tipografia, depois de verificar licença e arquivos-fonte;
- nomes e conceitos das insígnias como material de pesquisa, não como feature aprovada;
- textos de estado vazio, orientação e feedback, após revisão editorial.

### Migrar de modo controlado

- contas, somente depois de mapear identidade e obter uma estratégia segura de transição;
- registros pessoais, somente com inventário de campos, base legal, consentimento e validação do usuário;
- tarefas, hidratação e check-ins que tenham valor real para usuários ativos;
- posts e comentários apenas se a comunidade voltar ao roadmap e houver política de moderação;
- catálogos editoriais como seeds versionados.

### Reescrever

- autenticação e autorização;
- navegação e roteamento;
- acesso ao banco e regras de domínio;
- integrações de IA;
- notificações;
- analytics;
- todos os módulos B2B;
- painel master;
- planos, cobrança, licenças e entitlements.

## 6. Lacunas e riscos observados

1. **B2B ainda não existe.** Não há multi-tenancy, estrutura organizacional, convites, licenças, papéis ou fluxos NR-1.
2. **O painel master ainda não existe.** A área de configurações é pessoal e não gerencia clientes ou empresas.
3. **A fronteira de privacidade não está demonstrada.** O protótipo mistura módulos pessoais, comunidade e IA sobre a mesma base, sem evidência visível de políticas por domínio.
4. **Alegações metodológicas precisam de revisão.** O check-in diz ser inspirado em BRUMS e PANAS. A formulação e o instrumento final precisam ser revisados por profissional qualificado e não podem sugerir validação clínica automática.
5. **A comunidade promete moderação.** Essa promessa exige processo, equipe, regras, denúncia, resposta a crise e auditoria antes do lançamento.
6. **A IA precisa de limites claros.** O chat não expõe na interface observada consentimento específico, limites de uso, resposta a crise, retenção ou explicação de tratamento de dados.
7. **Há problemas de acessibilidade.** A navegação inferior apresenta botões sem nome acessível; alguns cards não são expostos como controles; textos e estados têm contraste muito suave.
8. **O roteamento é inconsistente.** Após entrar no chat, a navegação inferior trocou para módulos, comunidade e configurações sem atualizar a rota `#/chatAI`, o que prejudica histórico, deep link e diagnóstico.
9. **Há inconsistências editoriais.** Foram observados “Adcionar”, “Modulos”, “crecer” e variações entre Alumia, Alumía, ALUM.iA e Alum.IA.
10. **A recomendação de hidratação é opaca.** A interface mostra um volume diário sugerido sem explicar a regra, suas limitações ou quando não deve ser usada.
11. **O módulo Estudante está incompleto.** As opções aparecem como cartões de navegação, mas o conteúdo observado funciona como vitrine.
12. **A gamificação merece reavaliação.** As insígnias e métricas acumuladas podem ser úteis como celebração, mas precisam ser testadas contra o princípio de cuidado sem pressão.

## 7. Impacto no plano B2C, B2B e master admin

### B2C

O protótipo reduz o trabalho de descoberta de interface. O novo desenvolvimento pode começar por quatro verticais bem definidas: check-in, tarefas, mindfulness e hidratação. A home, o onboarding e as preferências servem como wireflow de referência. Comunidade, estudante, insígnias e Alum.IA permanecem fora do MVP.

### B2B

A Alumia Empresas deve ser tratada como um produto novo sobre a mesma fundação de identidade, design e conteúdo. Nenhuma página observada implementa o processo de gestão de riscos psicossociais ou a separação entre dados pessoais e dados ocupacionais.

### Painel master

Também será novo. O perfil existente ajuda somente a entender preferências do usuário. O console operacional precisa nascer com papéis, auditoria, planos, assinaturas, licenças, empresas, suporte e privacidade.

## 8. Próximas ações recomendadas

1. exportar ou documentar o schema do Firestore, regras de segurança, índices, funções e integrações do projeto;
2. listar coleções e volume de dados por categoria, sem copiar conteúdo sensível para ambientes de desenvolvimento;
3. exportar assets e registrar licença, origem e arquivos-fonte;
4. transformar as telas B2C observadas em wireflows e critérios de aceitação;
5. revisar o catálogo de emoções, necessidades, técnicas e mensagens com produto e profissional qualificado;
6. decidir quais dados pessoais realmente precisam ser migrados;
7. criar o novo repositório e implementar a fundação React/Supabase antes de portar qualquer regra;
8. manter o FlutterFlow congelado como referência durante a reconstrução, evitando novas features paralelas.

## 9. Decisão de migração

O protótipo deve ser classificado como **referência funcional e fonte de conteúdo**, não como base de código da nova plataforma. A reconstrução preserva a experiência que já comunica bem a proposta da Alumia e substitui as partes que impedem segurança multi-tenant, evolução B2B, testes de regras e operação pelo painel master.
