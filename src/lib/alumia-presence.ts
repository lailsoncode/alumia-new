export const ALUMIA_PRESENCE_STORAGE_KEY = "alumia_floating_avatar";
export const ALUMIA_PRESENCE_CHANGE_EVENT = "alumia:presence-change";
export const ALUMIA_PENDING_MESSAGE_STORAGE_KEY = "alumia:pending-message";

interface PresenceAction {
  label: string;
  to: string;
}

export interface AlumiaPresenceContext {
  title: string;
  message: string;
  secondaryAction: PresenceAction;
}

const defaultContext: AlumiaPresenceContext = {
  title: "Estou por aqui.",
  message: "Podemos conversar ou escolher juntos um cuidado pequeno para este momento.",
  secondaryAction: { label: "Fazer um check-in", to: "/check-in" },
};

const contexts: Array<{ matches: (pathname: string) => boolean; content: AlumiaPresenceContext }> = [
  {
    matches: (pathname) => pathname === "/",
    content: {
      title: "Oi, eu sou a Alumia.",
      message: "Estou aqui para acompanhar seu dia com leveza, sem cobranças.",
      secondaryAction: { label: "Como estou agora?", to: "/check-in" },
    },
  },
  {
    matches: (pathname) => pathname.startsWith("/tarefas"),
    content: {
      title: "Um passo de cada vez.",
      message: "Se estiver difícil começar, podemos encontrar juntos o menor próximo passo.",
      secondaryAction: { label: "Cuidar de como me sinto", to: "/check-in" },
    },
  },
  {
    matches: (pathname) => pathname.startsWith("/check-in"),
    content: {
      title: "Pode sentir no seu tempo.",
      message: "Não existe resposta certa aqui. Eu acompanho você sem julgar.",
      secondaryAction: { label: "Fazer uma pausa", to: "/mindfulness" },
    },
  },
  {
    matches: (pathname) => pathname.startsWith("/hidratacao"),
    content: {
      title: "Um gole também é cuidado.",
      message: "A referência ajuda, mas seu corpo e seu ritmo vêm primeiro.",
      secondaryAction: { label: "Ver outros cuidados", to: "/modulos" },
    },
  },
  {
    matches: (pathname) => pathname.startsWith("/estudante"),
    content: {
      title: "Vamos começar pequeno?",
      message: "Escolha um tempo possível. Parar, ajustar ou tentar depois também faz parte.",
      secondaryAction: { label: "Fazer uma pausa", to: "/mindfulness" },
    },
  },
  {
    matches: (pathname) => pathname.startsWith("/mindfulness"),
    content: {
      title: "Eu respiro com você.",
      message: "Poucos segundos de presença já podem ser um gesto de cuidado.",
      secondaryAction: { label: "Registrar como estou", to: "/check-in" },
    },
  },
  {
    matches: (pathname) => pathname.startsWith("/financeiro"),
    content: {
      title: "Clareza sem culpa.",
      message: "Podemos olhar para os números como informação, nunca como julgamento.",
      secondaryAction: { label: "Organizar um próximo passo", to: "/tarefas" },
    },
  },
  {
    matches: (pathname) => pathname.startsWith("/perfil") || pathname.startsWith("/conquistas"),
    content: {
      title: "Sua jornada já tem valor.",
      message: "As conquistas reconhecem cuidado e presença, não perfeição.",
      secondaryAction: { label: "Ver minhas conquistas", to: "/conquistas" },
    },
  },
];

export function getAlumiaPresenceContext(pathname: string) {
  return contexts.find((context) => context.matches(pathname))?.content ?? defaultContext;
}

export function getAlumiaPresenceEnabled() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(ALUMIA_PRESENCE_STORAGE_KEY) !== "false";
}

export function setAlumiaPresenceEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ALUMIA_PRESENCE_STORAGE_KEY, String(enabled));
  window.dispatchEvent(new CustomEvent(ALUMIA_PRESENCE_CHANGE_EVENT, { detail: { enabled } }));
}

export function setAlumiaPendingMessage(message: string) {
  if (typeof window === "undefined") return;
  const normalizedMessage = message.trim().slice(0, 500);
  if (!normalizedMessage) return;
  window.sessionStorage.setItem(ALUMIA_PENDING_MESSAGE_STORAGE_KEY, normalizedMessage);
}

export function consumeAlumiaPendingMessage() {
  if (typeof window === "undefined") return null;
  const message = window.sessionStorage.getItem(ALUMIA_PENDING_MESSAGE_STORAGE_KEY);
  window.sessionStorage.removeItem(ALUMIA_PENDING_MESSAGE_STORAGE_KEY);
  return message;
}
