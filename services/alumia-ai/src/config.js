function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Configuração ausente: ${name}`);
  return value;
}

export function readConfig() {
  return {
    project: process.env.GOOGLE_CLOUD_PROJECT?.trim() || "alumia-app",
    location: process.env.GOOGLE_CLOUD_LOCATION?.trim() || "global",
    model: process.env.ALUMIA_AI_MODEL?.trim() || "gemini-3.5-flash-lite",
    liveEnabled: process.env.ALUMIA_LIVE_ENABLED === "true",
    liveLocation: process.env.GOOGLE_CLOUD_LIVE_LOCATION?.trim() || "us-central1",
    liveModel: process.env.ALUMIA_LIVE_MODEL?.trim() || "gemini-3.8-live",
    liveVoice: process.env.ALUMIA_LIVE_VOICE?.trim() || "Achernar",
    liveSessionMaxMs: Number.parseInt(process.env.ALUMIA_LIVE_SESSION_MAX_MS || "300000", 10),
    speechLocation: process.env.GOOGLE_CLOUD_SPEECH_LOCATION?.trim() || "global",
    ttsModel: process.env.ALUMIA_TTS_MODEL?.trim() || "gemini-2.5-flash-tts",
    ttsVoice: process.env.ALUMIA_TTS_VOICE?.trim() || "Achernar",
    ttsPrompt: process.env.ALUMIA_TTS_PROMPT?.trim() || "Directions only; speak only the text. Warm adult Brazilian woman from Picuí in the countryside of Paraíba. Use a clearly noticeable, moderate countryside Paraíba and Northeastern Brazilian accent, not a Recife accent or a neutral Brazilian accent: regional melodic intonation, naturally open vowels, and a lively cadence. Speak briskly with short pauses and crisp diction. Keep S and X clean, without hiss or breathiness. Sound authentic and contemporary, never theatrical, stereotyped, or drawn out.",
    supabaseUrl: required("SUPABASE_URL").replace(/\/$/, ""),
    supabaseAnonKey: required("SUPABASE_ANON_KEY"),
    allowedOrigins: new Set(
      (process.env.ALLOWED_ORIGINS || "http://localhost:8080,https://localhost,capacitor://localhost")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
    rateLimitRequests: Number.parseInt(process.env.RATE_LIMIT_REQUESTS || "12", 10),
    rateLimitVoiceRequests: Number.parseInt(process.env.RATE_LIMIT_VOICE_REQUESTS || "12", 10),
    rateLimitWindowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
    port: Number.parseInt(process.env.PORT || "8080", 10),
  };
}
