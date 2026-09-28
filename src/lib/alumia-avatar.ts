const STORAGE_BASE = "https://firebasestorage.googleapis.com/v0/b/alumia-app.firebasestorage.app/o/alumia_pics%2F";

function firebaseImage(filename: string) {
  return `${STORAGE_BASE}${encodeURIComponent(filename)}?alt=media`;
}

export const ALUMIA_AVATAR_IMAGES = {
  welcome: firebaseImage("welcome.webp"),
  companion: firebaseImage("welcome (3).webp"),
  icon: firebaseImage("icon alumia.png"),
  tasks: firebaseImage("tasks.webp"),
  hydration: firebaseImage("hidratacao.webp"),
  checkin: firebaseImage("welcome (3).webp"),
  student: firebaseImage("ChatGPT Image 18 de set. de 2025, 20_55_17.png"),
  mindfulness: firebaseImage("ChatGPT Image 7 de set. de 2025, 12_26_12.png"),
  finance: firebaseImage("ChatGPT Image 26 de abr. de 2025, 14_51_23.png"),
  assistant: firebaseImage("icon alumia.png"),
} as const;
