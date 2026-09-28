import type { Achievement, AchievementActivity, AchievementId } from "@/types/achievements";

const STORAGE_BASE = "https://firebasestorage.googleapis.com/v0/b/alumia-app.firebasestorage.app/o";

const assetUrl = (folder: "img_P" | "img_G", filename: string) =>
  `${STORAGE_BASE}/${folder}%2F${filename}?alt=media`;

const firstDate = (dates: Array<string | null | undefined>) =>
  dates.filter((date): date is string => Boolean(date)).sort()[0] ?? null;

const localDay = (date: string) => date.slice(0, 10);

interface AchievementDefinition {
  id: AchievementId;
  title: string;
  description: string;
  invitation: string;
  filename: string;
  earnedAt: (activity: AchievementActivity) => string | null;
}

const definitions: AchievementDefinition[] = [
  {
    id: "inicio",
    title: "Isso não é uma corrida",
    description: "Você chegou. Aqui não há pressa, placar ou caminho obrigatório.",
    invitation: "Ela floresce simplesmente por você chegar à Alumia.",
    filename: "badge-inicio.webp",
    earnedAt: ({ accountCreatedAt }) => accountCreatedAt,
  },
  {
    id: "beta",
    title: "Estúdio Beta",
    description: "Você faz parte de uma Alumia que ainda está crescendo. Obrigado pela companhia.",
    invitation: "Uma lembrança carinhosa para quem acompanha esta fase da Alumia.",
    filename: "badge-beta.jpg",
    earnedAt: ({ accountCreatedAt }) => accountCreatedAt,
  },
  {
    id: "primeiro-passo",
    title: "Primeiro Passo",
    description: "Um gesto possível já conta. Você escolheu cuidar de algo no seu ritmo.",
    invitation: "Ela pode florescer com qualquer gesto de cuidado dentro da Alumia.",
    filename: "badge-pp.webp",
    earnedAt: (activity) => firstDate([
      ...activity.completedTasks.map((item) => item.completedAt ?? item.createdAt),
      ...activity.checkins.map((item) => item.occurredAt),
      ...activity.hydration.map((item) => item.createdAt),
      ...activity.mindfulness.map((item) => item.startedAt),
      ...activity.study.map((item) => item.startedAt),
    ]),
  },
  {
    id: "me-escutei",
    title: "Me escutei hoje",
    description: "Você deu nome ao seu momento sem precisar julgá-lo ou consertá-lo.",
    invitation: "Ela pode florescer ao concluir um check-in emocional.",
    filename: "badge-meh.webp",
    earnedAt: ({ checkins }) => firstDate(checkins.map((item) => item.occurredAt)),
  },
  {
    id: "dia-interno",
    title: "Dia de Sol Interno",
    description: "Você percebeu um momento leve e abriu espaço para reconhecê-lo.",
    invitation: "Ela pode florescer quando um check-in registra um sentimento positivo.",
    filename: "badge-di.webp",
    earnedAt: ({ checkins }) => firstDate(checkins
      .filter((item) => item.moodCategory.includes("positive"))
      .map((item) => item.occurredAt)),
  },
  {
    id: "acolhi-alguem",
    title: "Acolhi Alguém",
    description: "Hoje você reconheceu que companhia e apoio também são formas de cuidado.",
    invitation: "Ela pode florescer quando você escolhe apoio em um check-in.",
    filename: "badge-aa.webp",
    earnedAt: ({ checkins }) => firstDate(checkins
      .filter((item) => item.needCode === "support")
      .map((item) => item.occurredAt)),
  },
  {
    id: "silencio-frutifero",
    title: "Silêncio Frutífero",
    description: "Seu silêncio fez nascer algo bonito. Obrigado por se escutar.",
    invitation: "Ela pode florescer ao viver uma prática de mindfulness até onde fizer sentido.",
    filename: "badge-sf.webp",
    earnedAt: ({ mindfulness }) => firstDate(mindfulness.map((item) => item.startedAt)),
  },
  {
    id: "lua-cuidando",
    title: "Lua Cuidando de Mim",
    description: "Você reservou um instante de presença para o fim do dia.",
    invitation: "Ela pode florescer com a prática Desacelerar à noite.",
    filename: "badge-cdm.webp",
    earnedAt: ({ mindfulness }) => firstDate(mindfulness
      .filter((item) => item.practiceCode === "slow_evening")
      .map((item) => item.startedAt)),
  },
  {
    id: "deitei-com-carinho",
    title: "Deitei com carinho",
    description: "Você tratou a noite como transição, não como mais uma tarefa a cumprir.",
    invitation: "Ela pode florescer com uma pausa feita à noite, mesmo que seja breve.",
    filename: "badge-dcc.webp",
    earnedAt: ({ mindfulness }) => firstDate(mindfulness
      .filter((item) => new Date(item.startedAt).getHours() >= 18)
      .map((item) => item.startedAt)),
  },
  {
    id: "gole-de-vida",
    title: "Gole de Vida",
    description: "Um gole também é um jeito simples de dizer: eu me cuido.",
    invitation: "Ela pode florescer ao registrar água, em qualquer quantidade.",
    filename: "badge-gole.webp",
    earnedAt: ({ hydration }) => firstDate(hydration.map((item) => item.createdAt)),
  },
  {
    id: "colheita-do-dia",
    title: "Colheita do Dia",
    description: "Você concluiu o que foi possível hoje. Isso já merece ser reconhecido.",
    invitation: "Ela pode florescer ao concluir uma tarefa — sem prazo e sem sequência.",
    filename: "badge-cd.webp",
    earnedAt: ({ completedTasks }) => firstDate(completedTasks.map((item) => item.completedAt ?? item.createdAt)),
  },
  {
    id: "pagina-virada",
    title: "Página Virada",
    description: "Algumas coisas terminaram, outras mudaram de forma. Você pode seguir leve.",
    invitation: "Ela pode florescer depois de cinco tarefas concluídas, no tempo que levar.",
    filename: "badge-pv.webp",
    earnedAt: ({ completedTasks }) => completedTasks.length >= 5
      ? firstDate(completedTasks.map((item) => item.completedAt ?? item.createdAt).sort().slice(4, 5))
      : null,
  },
  {
    id: "passinho-sertanejo",
    title: "Passinho Sertanejo",
    description: "Você avançou nos estudos do seu jeito: um passinho possível de cada vez.",
    invitation: "Ela pode florescer ao concluir uma sessão de estudo.",
    filename: "badge-ps.webp",
    earnedAt: ({ study }) => firstDate(study.map((item) => item.startedAt)),
  },
  {
    id: "se-achegue",
    title: "Se achegue",
    description: "Você voltou porque fez sentido, não porque devia. Seu espaço continuou aqui.",
    invitation: "Ela pode florescer ao cuidar de si em dois dias diferentes, sem sequência obrigatória.",
    filename: "badge-neuc.webp",
    earnedAt: (activity) => {
      const activityDates = [
        ...activity.completedTasks.map((item) => item.completedAt ?? item.createdAt),
        ...activity.checkins.map((item) => item.occurredAt),
        ...activity.hydration.map((item) => item.date),
        ...activity.mindfulness.map((item) => item.startedAt),
        ...activity.study.map((item) => item.startedAt),
      ].filter((date): date is string => Boolean(date));
      const distinctDays = [...new Set(activityDates.map(localDay))].sort();
      return distinctDays.length >= 2
        ? firstDate(activityDates.filter((date) => localDay(date) === distinctDays[1]))
        : null;
    },
  },
];

export function evaluateAchievements(activity: AchievementActivity): Achievement[] {
  return definitions.map((definition) => {
    const earnedAt = definition.earnedAt(activity);
    const largeFilename = definition.filename === "badge-beta.jpg"
      ? definition.filename
      : definition.filename.replace(".webp", ".png");
    return {
      id: definition.id,
      title: definition.title,
      description: definition.description,
      invitation: definition.invitation,
      imageUrl: assetUrl("img_P", definition.filename),
      wallpaperUrl: assetUrl("img_G", largeFilename),
      earned: Boolean(earnedAt),
      earnedAt,
    };
  });
}

export function filterAchievementActivity(activity: AchievementActivity, startsAt: string): AchievementActivity {
  return {
    ...activity,
    accountCreatedAt: activity.accountCreatedAt >= startsAt ? activity.accountCreatedAt : startsAt,
    completedTasks: activity.completedTasks.filter((item) => (item.completedAt ?? item.createdAt) >= startsAt),
    checkins: activity.checkins.filter((item) => item.occurredAt >= startsAt),
    hydration: activity.hydration.filter((item) => item.createdAt >= startsAt),
    mindfulness: activity.mindfulness.filter((item) => item.startedAt >= startsAt),
    study: activity.study.filter((item) => item.startedAt >= startsAt),
  };
}
