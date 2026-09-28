import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "br.com.oxentecode.alumia",
  appName: "Alumia",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
  plugins: {
    LocalNotifications: {
      sound: "alumia_alarm.wav",
      presentationOptions: ["badge", "sound", "banner", "list"],
    },
  },
};

export default config;
