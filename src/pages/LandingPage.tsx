import { Link } from "@tanstack/react-router";
import {
  ArrowRight01Icon,
  BookOpen01Icon,
  Clock01Icon,
  FlowerIcon,
  HeartAddIcon,
  Leaf01Icon,
  LockIcon,
  Shield01Icon,
  SparklesIcon,
  Task01Icon,
  Tick02Icon,
  WaterEnergyIcon,
} from "@hugeicons/core-free-icons";
import type { SyntheticEvent } from "react";
import { AlumiaIcon } from "@/components/ui/alumia-icon";
import { Button } from "@/components/ui/button";
import { ALUMIA_AVATAR_IMAGES } from "@/lib/alumia-avatar";
import alumiaChibi from "@/assets/alumia/alumia-chibi-idle-v1.png";
import hydrationImage from "@/assets/hidratacao.webp";
import mindfulnessImage from "@/assets/meditacao.webp";
import tasksImage from "@/assets/tasks.webp";

const careOptions = [
  {
    eyebrow: "Organização gentil",
    title: "Tarefas que cabem no seu dia",
    description: "Organize o que importa sem transformar a rotina em uma corrida.",
    image: tasksImage,
    fallback: tasksImage,
    alt: "Alumia organizando pequenas tarefas com tranquilidade",
    icon: Task01Icon,
    tone: "tone-sky",
    layout: "lg:col-span-7",
  },
  {
    eyebrow: "Pausa consciente",
    title: "Um respiro quando fizer sentido",
    description: "Práticas breves para você voltar ao momento presente.",
    image: ALUMIA_AVATAR_IMAGES.mindfulness,
    fallback: mindfulnessImage,
    alt: "Alumia sentada em uma pausa de atenção plena",
    icon: Leaf01Icon,
    tone: "tone-mint",
    layout: "lg:col-span-5",
  },
  {
    eyebrow: "Cuidado diário",
    title: "Água também é carinho",
    description: "Lembretes leves para apoiar seu ritmo de hidratação.",
    image: hydrationImage,
    fallback: hydrationImage,
    alt: "Alumia bebendo água em um ambiente acolhedor",
    icon: WaterEnergyIcon,
    tone: "tone-aqua",
    layout: "lg:col-span-5",
  },
  {
    eyebrow: "Foco possível",
    title: "Estudo com começo, meio e pausa",
    description: "Escolha um próximo passo e preserve energia para continuar depois.",
    image: ALUMIA_AVATAR_IMAGES.student,
    fallback: tasksImage,
    alt: "Alumia planejando uma atividade de estudo",
    icon: BookOpen01Icon,
    tone: "tone-sun",
    layout: "lg:col-span-7",
  },
] as const;

const steps = [
  {
    number: "01",
    title: "Escolha o que cuidar",
    description: "Ative apenas os módulos que combinam com o seu momento.",
    icon: HeartAddIcon,
    tone: "tone-peach",
  },
  {
    number: "02",
    title: "Dê um passo possível",
    description: "Faça um check-in, beba água, organize uma tarefa ou apenas respire.",
    icon: SparklesIcon,
    tone: "tone-aqua",
  },
  {
    number: "03",
    title: "Volte quando quiser",
    description: "Sem sequência obrigatória e sem culpa pelos dias em que não der.",
    icon: Clock01Icon,
    tone: "tone-mint",
  },
] as const;

function applyFallbackImage(event: SyntheticEvent<HTMLImageElement>, fallback: string) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied) return;
  image.dataset.fallbackApplied = "true";
  image.src = fallback;
}

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-background text-foreground">
      <a
        href="#conteudo"
        className="sr-only z-[100] rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Pular para o conteúdo
      </a>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a href="#inicio" className="flex items-center gap-2.5 rounded-xl" aria-label="Alumia — voltar ao início">
            <img
              src="/icons/alumia-icon-192.png"
              alt=""
              aria-hidden="true"
              className="h-10 w-10 rounded-xl object-cover shadow-sm"
            />
            <span className="font-display text-xl font-bold tracking-tight">Alumia</span>
          </a>

          <nav aria-label="Navegação da página" className="hidden items-center gap-7 md:flex">
            <a href="#como-funciona" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
              Como funciona
            </a>
            <a href="#cuidados" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
              Cuidados
            </a>
            <a href="#seu-espaco" className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground">
              Seu espaço
            </a>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button asChild variant="ghost" size="sm" className="px-2.5 sm:px-3.5">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild size="sm" className="px-3.5 sm:px-5">
              <Link to="/registro">
                <span className="sm:hidden">Criar conta</span>
                <span className="hidden sm:inline">Criar meu espaço</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main id="conteudo">
        <section id="inicio" className="relative scroll-mt-20 px-4 pb-20 pt-30 sm:px-6 sm:pb-24 sm:pt-36 lg:px-8 lg:pb-30 lg:pt-40">
          <div aria-hidden="true" className="absolute -left-40 top-12 h-96 w-96 rounded-full bg-tone-aqua/55 blur-3xl" />
          <div aria-hidden="true" className="absolute -right-40 top-56 h-112 w-112 rounded-full bg-tone-lavender/45 blur-3xl" />

          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-[minmax(0,1.03fr)_minmax(28rem,0.97fr)] lg:gap-10">
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.13em] text-primary sm:text-sm">
                <AlumiaIcon icon={FlowerIcon} size="sm" />
                Cuidado que cabe na vida real
              </div>

              <h1 className="mt-6 max-w-3xl text-[clamp(2.75rem,7vw,5.7rem)] font-bold leading-[0.98] tracking-[-0.055em] text-foreground">
                Seu dia não precisa ser perfeito para ter <span className="text-primary">um pouco de cuidado.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base font-medium leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">
                A Alumia reúne organização, bem-estar e pequenas pausas em um espaço acolhedor, privado e feito para acompanhar o seu ritmo.
              </p>

              <div className="mt-8 flex flex-col gap-3 min-[430px]:flex-row">
                <Button asChild size="lg" className="group min-[430px]:min-w-52">
                  <Link to="/registro">
                    Começar com leveza
                    <AlumiaIcon icon={ArrowRight01Icon} size="sm" className="transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="min-[430px]:min-w-42">
                  <a href="#como-funciona">Conhecer a Alumia</a>
                </Button>
              </div>

              <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-muted-foreground" aria-label="Princípios da Alumia">
                {[
                  "Sem metas impossíveis",
                  "Sem culpa",
                  "No seu tempo",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-foreground">
                      <AlumiaIcon icon={Tick02Icon} size="xs" strokeWidth={2.2} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mx-auto min-h-[31rem] w-full max-w-[37rem] sm:min-h-[37rem] lg:min-h-[41rem]">
              <div aria-hidden="true" className="absolute inset-x-[8%] bottom-[4%] top-[9%] rotate-3 rounded-[3.5rem] bg-tone-sky shadow-[var(--shadow-elevated)]" />
              <div aria-hidden="true" className="absolute inset-x-[14%] bottom-[9%] top-[15%] -rotate-3 rounded-[3rem] border border-white/45 bg-tone-sun/80" />
              <span aria-hidden="true" className="absolute left-[4%] top-[19%] h-16 w-16 rounded-full border-[12px] border-tone-peach/80" />
              <span aria-hidden="true" className="absolute right-[6%] top-[8%] h-11 w-11 rotate-12 rounded-xl bg-tone-mint" />

              <div className="alumia-floating absolute left-0 top-[5%] z-20 max-w-[12.5rem] rounded-[1.25rem] px-4 py-3 sm:left-[2%] sm:max-w-[14rem]">
                <p className="font-display text-sm font-bold sm:text-base">Oi, eu sou a Alumia.</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">Posso caminhar pertinho, sem apressar você.</p>
              </div>

              <div className="absolute bottom-[4%] left-1/2 z-10 h-[82%] w-[75%] -translate-x-1/2">
                <img
                  src={alumiaChibi}
                  alt="Alumia acenando com uma flor luminosa nas mãos"
                  className="alumia-presence-idle h-full w-full object-contain object-bottom drop-shadow-[0_24px_24px_rgba(43,52,75,0.2)]"
                />
              </div>

              <div className="alumia-floating absolute bottom-[6%] right-0 z-20 flex items-center gap-3 rounded-[1.25rem] p-3 pr-4 sm:right-[2%]">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tone-peach text-tone-peach-fg">
                  <AlumiaIcon icon={HeartAddIcon} size="md" />
                </span>
                <span>
                  <strong className="block font-display text-sm">Só por hoje</strong>
                  <span className="block text-xs text-muted-foreground">um passo possível</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="scroll-mt-24 border-y border-border/70 bg-surface-subtle/55 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto w-full max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.15em] text-primary">Do seu jeito</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">Cuidar de você pode ser simples.</h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                A Alumia ajuda a transformar intenção em gestos pequenos, respeitando os dias cheios e também os dias quietos.
              </p>
            </div>

            <ol className="mt-12 grid gap-4 lg:grid-cols-3">
              {steps.map((step) => (
                <li key={step.number} className="alumia-card group relative overflow-hidden p-6 sm:p-7">
                  <span className="absolute right-5 top-3 font-display text-6xl font-bold text-foreground/[0.045] transition-transform group-hover:-translate-y-1">
                    {step.number}
                  </span>
                  <span className={`flex h-13 w-13 items-center justify-center rounded-2xl ${step.tone}`}>
                    <AlumiaIcon icon={step.icon} size="lg" />
                  </span>
                  <h3 className="mt-8 text-xl font-bold">{step.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="cuidados" className="scroll-mt-24 px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-30">
          <div className="mx-auto w-full max-w-7xl">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-primary">Um cuidado por vez</p>
                <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">Uma companhia para vários momentos.</h2>
              </div>
              <p className="max-w-md text-base leading-relaxed text-muted-foreground md:text-right">
                Você escolhe o que faz sentido agora. O restante pode esperar, sem problema.
              </p>
            </div>

            <div className="mt-12 grid gap-4 lg:grid-cols-12">
              {careOptions.map((care) => (
                <article
                  key={care.title}
                  className={`group grid min-h-[32rem] overflow-hidden rounded-[2rem] border border-border bg-surface shadow-[var(--shadow-card)] sm:grid-cols-[minmax(0,0.82fr)_minmax(16rem,1.18fr)] ${care.layout}`}
                >
                  <div className="flex flex-col justify-between p-6 sm:p-7">
                    <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${care.tone}`}>
                      <AlumiaIcon icon={care.icon} size="lg" />
                    </span>
                    <div className="mt-12 sm:mt-8">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">{care.eyebrow}</p>
                      <h3 className="mt-2 text-2xl font-bold leading-tight">{care.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{care.description}</p>
                    </div>
                  </div>
                  <div className="relative min-h-72 overflow-hidden bg-muted sm:min-h-full">
                    <img
                      src={care.image}
                      alt={care.alt}
                      loading="lazy"
                      decoding="async"
                      onError={(event) => applyFallbackImage(event, care.fallback)}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                    />
                    <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-foreground/10 via-transparent to-white/5" />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="seu-espaco" className="scroll-mt-24 px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8 lg:pb-30">
          <div className="relative mx-auto grid w-full max-w-7xl overflow-hidden rounded-[2.5rem] bg-foreground text-background lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-[27rem] overflow-hidden bg-tone-peach lg:min-h-[36rem]">
              <div aria-hidden="true" className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-tone-sun/80 blur-2xl" />
              <div aria-hidden="true" className="absolute -bottom-24 -right-12 h-72 w-72 rounded-full bg-tone-aqua/70 blur-3xl" />
              <img
                src={alumiaChibi}
                alt="Alumia segurando uma flor, pronta para acompanhar você"
                loading="lazy"
                className="absolute inset-x-0 bottom-0 mx-auto h-[90%] w-[80%] object-contain object-bottom drop-shadow-[0_24px_22px_rgba(42,35,31,0.18)]"
              />
              <div className="absolute bottom-5 left-5 rounded-2xl bg-background/90 px-4 py-3 text-foreground shadow-lg backdrop-blur sm:bottom-7 sm:left-7">
                <p className="font-display text-sm font-bold">A casa é sua.</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Eu só ajudo a deixar tudo mais leve.</p>
              </div>
            </div>

            <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
              <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-background/12 text-background">
                <AlumiaIcon icon={Shield01Icon} size="lg" />
              </span>
              <p className="mt-8 text-sm font-bold uppercase tracking-[0.15em] text-background/65">Seu espaço, suas escolhas</p>
              <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">O cuidado é pessoal. A privacidade também.</h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-background/72 sm:text-lg">
                Suas emoções, anotações e conversas pertencem a você. A Alumia foi pensada para acolher informações sensíveis com discrição e dar controle sobre o que fica guardado.
              </p>

              <ul className="mt-8 grid gap-3 text-sm font-semibold text-background/88 sm:grid-cols-2">
                <li className="flex items-center gap-2.5">
                  <AlumiaIcon icon={LockIcon} size="sm" />
                  Espaço pessoal protegido
                </li>
                <li className="flex items-center gap-2.5">
                  <AlumiaIcon icon={Tick02Icon} size="sm" />
                  Você escolhe o que usar
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8 lg:pb-30">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-primary/20 bg-primary/9 px-6 py-14 text-center sm:px-10 sm:py-18 lg:px-20">
            <span aria-hidden="true" className="absolute -left-9 -top-9 h-32 w-32 rounded-full bg-tone-sun/65 blur-2xl" />
            <span aria-hidden="true" className="absolute -bottom-14 -right-10 h-44 w-44 rounded-full bg-tone-aqua/75 blur-3xl" />
            <div className="relative">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-tone-sun text-tone-sun-fg">
                <AlumiaIcon icon={FlowerIcon} size="xl" />
              </span>
              <h2 className="mx-auto mt-6 max-w-3xl text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">Tem espaço para você por aqui.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Comece pequeno. Escolha um cuidado. E deixe que o seu ritmo mostre o próximo passo.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 min-[430px]:flex-row">
                <Button asChild size="lg">
                  <Link to="/registro">
                    Criar meu espaço grátis
                    <AlumiaIcon icon={ArrowRight01Icon} size="sm" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/login">Já tenho uma conta</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/70 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-2.5">
            <img src="/icons/alumia-icon-192.png" alt="" aria-hidden="true" className="h-9 w-9 rounded-xl object-cover" />
            <div>
              <p className="font-display font-bold">Alumia</p>
              <p className="text-xs text-muted-foreground">Cuidado no seu ritmo.</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            A Alumia apoia o autocuidado e não substitui acompanhamento profissional.
          </p>
          <a href="#inicio" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary underline-offset-4 hover:underline">
            Voltar ao início
          </a>
        </div>
      </footer>
    </div>
  );
}
