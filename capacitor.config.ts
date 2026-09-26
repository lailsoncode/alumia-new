import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.oxentecode.alumia",
  appName: "Alumia",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
