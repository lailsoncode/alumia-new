# Alumia 🌱

A **Alumia** é um aplicativo modular voltado para o bem-estar e a organização da rotina. Desenhada como uma resposta empática ao aumento de casos de ansiedade e burnout, ela oferece um espaço digital acolhedor e totalmente livre de cobranças ou metas tóxicas.

## 🧠 Proposta de Valor

> "Você no controle da sua rotina, do seu jeito."

- **UX Neuroinclusiva:** Interface sensorialmente amigável e adaptada para ritmos reais de vida.
- **Sem Gamificação Punitiva:** Sem alarmes invasivos, cobranças de _streaks_ (dias consecutivos) ou sensação de fracasso.
- **Celebração do Micro:** Cada pequeno gesto e recomeço é celebrado como uma vitória íntima.
- **Modularidade Real:** O usuário escolhe o seu próprio caminho, ativando ou desativando os recursos conforme seu momento, sem perda de progresso.

## 📜 Módulos do Ecossistema

O aplicativo foi estruturado como um jardim digital onde cada funcionalidade atua de forma integrada:

- **Tarefas 🌿:** Organização afetiva do dia a dia com reagendamento suave e sem punições.
- **Check-in Emocional 🧠:** Registro e nomeação das emoções com geração de sugestões acolhedoras.
- **Mindfulness 🧘:** Pausas curtas, áudios de respiração e textos afetivos integrados ao cotidiano.
- **Hidratação 💧:** Lembretes gentis e calculadora de consumo de água sem metas rígidas obrigatórias.
- **Alum.IA 🤖:** Inteligência Artificial que detecta padrões e adapta trilhas ou tarefas ao perfil emocional do usuário.
- **Equipes 👥:** Espaço colaborativo para grupos de estudo, trabalho e suporte mútuo.
- **Fitness 🏃‍♂️:** Incentivo a movimentos leves e alongamentos com reforço positivo.
- **Estudante 🎓:** Ferramentas de foco e revisões inteligentes adaptadas para perfis neurodivergentes e TDAH.

## 🛠️ Infraestrutura Técnica

A arquitetura foi planejada seguindo a metodologia **Oxente Code** para ser leve, de rápido desenvolvimento e altamente modular:

- **Frontend:** **React** + **Vite** com **TypeScript**, utilizando **TanStack Router / TanStack Start** para gerenciamento de rotas e orquestração de fluxo.
- **UI System & Styling:** **Tailwind CSS** e **shadcn/ui** (componentes baseados em Radix UI) para um design system consistente e responsivo, e ícones da biblioteca **Hugeicons**.
- **Backend & Banco de Dados:** Estruturado sobre o **Supabase** (BaaS):
  - **PostgreSQL:** Banco de dados relacional robusto.
  - **Supabase Auth:** Autenticação segura e com total respeito à privacidade.
- **Mobile Bridge:** **Capacitor**, empacotando e exportando a aplicação web como aplicativos híbridos nativos para **Android** e **iOS**.

## 🌍 Impacto e Sustentabilidade (ODS)

A Alumia opera de forma alinhada aos Objetivos de Desenvolvimento Sustentável da ONU:

- **ODS 3 (Saúde e Bem-Estar):** Promoção de saúde emocional preventiva e resiliência.
- **ODS 4 (Educação de Qualidade):** Fomento à alfabetização emocional.
- **ODS 10 (Redução das Desigualdades):** Inclusão ativa de neurodivergentes e disponibilização de uma base gratuita.
- **ODS 12 (Consumo e Produção Responsáveis):** Relação sustentável com a tecnologia, sem retenção compulsiva ou monetização de dados.
