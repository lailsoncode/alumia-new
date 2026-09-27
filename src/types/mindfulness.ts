export type MindfulnessCategory = "breathing" | "grounding" | "focus" | "calm" | "sleep";
export type MindfulnessFormat = "audio" | "text";
export type MindfulnessReflection = "same" | "present" | "another";
export type MindfulnessReminderChoice = "later" | "tomorrow";

export interface MindfulnessPractice {
  id: string;
  code: string;
  version: number;
  title: string;
  description: string;
  durationMinutes: number;
  category: MindfulnessCategory;
  formats: MindfulnessFormat[];
  instructions: string[];
  sortOrder: number;
}

export interface CompleteMindfulnessSessionInput {
  practiceId: string;
  format: MindfulnessFormat;
  startedAt: string;
  elapsedSeconds: number;
  reflection?: MindfulnessReflection;
  endedEarly: boolean;
}
