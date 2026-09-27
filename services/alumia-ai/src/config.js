function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Configuração ausente: ${name}`);
  return value;
}

export function readConfig() {
  return {
    project: process.env.GOOGLE_CLOUD_PROJECT?.trim() || "alumia-app",
    location: process.env.GOOGLE_CLOUD_LOCATION?.trim() || "global",
    model: process.env.ALUMIA_AI_MODEL?.trim() || "gemini-3.5-flash",
    supabaseUrl: required("SUPABASE_URL").replace(/\/$/, ""),
    supabaseAnonKey: required("SUPABASE_ANON_KEY"),
    allowedOrigins: new Set(
      (process.env.ALLOWED_ORIGINS || "http://localhost:8080,capacitor://localhost")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    ),
    rateLimitRequests: Number.parseInt(process.env.RATE_LIMIT_REQUESTS || "12", 10),
    rateLimitWindowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10),
    port: Number.parseInt(process.env.PORT || "8080", 10),
  };
}
