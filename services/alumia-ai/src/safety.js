const crisisSignals = [
  "quero morrer",
  "queria morrer",
  "nao quero viver",
  "tirar minha vida",
  "acabar com minha vida",
  "me matar",
  "me machucar",
  "suicidio",
  "suicida",
];

export const CRISIS_RESPONSE =
  "Sinto muito que este momento esteja tão difícil. Eu não consigo oferecer o apoio humano que uma situação assim merece. Se puder, procure agora alguém de confiança para ficar com você. No Brasil, o CVV atende gratuitamente pelo 188. Se houver perigo imediato ou uma emergência, ligue para o SAMU no 192 ou procure o serviço de emergência da sua região.";

export function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasPossibleCrisisSignal(value) {
  const normalized = normalizeText(value);
  return crisisSignals.some((signal) => normalized.includes(signal));
}
