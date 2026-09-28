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
    speechLocation: process.env.GOOGLE_CLOUD_SPEECH_LOCATION?.trim() || "global",
    ttsModel: process.env.ALUMIA_TTS_MODEL?.trim() || "gemini-2.5-flash-tts",
    ttsVoice: process.env.ALUMIA_TTS_VOICE?.trim() || "Aoede",
    ttsPrompt: process.env.ALUMIA_TTS_PROMPT?.trim() || "Directions only; speak only the text. Warm Brazilian woman, subtle Recife accent, natural brisk pace, short pauses, clear diction, never drawl.",
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
