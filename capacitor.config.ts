import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "br.com.oxentecode.alumia",
  appName: "Alumia",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
