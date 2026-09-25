export type EmotionValence = "positive" | "difficult";
export type MoodCategory =
  | "very_difficult"
  | "difficult"
  | "slightly_difficult"
  | "mixed"
  | "slightly_positive"
  | "positive"
  | "very_positive";

export interface CheckinEmotion {
  code: string;
  label: string;
  emoji: string;
  valence: EmotionValence;
  sortOrder: number;
}

export interface CheckinNeed {
  code: string;
  label: string;
  emoji: string;
  sortOrder: number;
}

export interface CareSuggestion {
  code: string;
  version: number;
  title: string;
  body: string;
  actionText: string;
  actionCategory: string;
}

export interface CreateCareCheckinInput {
  emotionCodes: string[];
  needCode: string;
  idempotencyKey: string;
}

export interface CreateCareCheckinResult {
  checkinId: string;
  occurredAt: string;
  moodCategory: MoodCategory;
  suggestion: CareSuggestion;
}

export interface CareCheckinHistoryItem {
  id: string;
  occurredAt: string;
  moodCategory: MoodCategory;
  emotions: Array<Pick<CheckinEmotion, "code" | "label" | "emoji">>;
  need: Pick<CheckinNeed, "code" | "label"> | null;
  suggestion: CareSuggestion | null;
}
