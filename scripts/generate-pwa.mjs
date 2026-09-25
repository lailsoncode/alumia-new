import { generateSW } from "workbox-build";

const { count, size, warnings } = await generateSW({
  globDirectory: "dist/client",
  globPatterns: ["**/*.{js,css,html,ico,png,svg,webp,woff2,json}"],
  globIgnores: ["push/onesignal/**"],
  swDest: "dist/client/sw.js",
  navigateFallback: "/index.html",
  navigateFallbackDenylist: [/^\/api\//, /^\/push\/onesignal\//],
  cleanupOutdatedCaches: true,
  clientsClaim: true,
  skipWaiting: true,
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
});

for (const warning of warnings) console.warn(`[PWA] ${warning}`);
if (count === 0) throw new Error("A PWA não encontrou arquivos para adicionar ao precache.");

console.log(`[PWA] ${count} arquivos preparados para uso offline (${size} bytes).`);
