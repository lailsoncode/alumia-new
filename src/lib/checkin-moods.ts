import difficultImage from "@/assets/checkin/difficult.webp";
import mixedImage from "@/assets/checkin/mixed.webp";
import positiveImage from "@/assets/checkin/positive.webp";
import slightlyDifficultImage from "@/assets/checkin/slightly-difficult.webp";
import slightlyPositiveImage from "@/assets/checkin/slightly-positive.webp";
import veryDifficultImage from "@/assets/checkin/very-difficult.webp";
import veryPositiveImage from "@/assets/checkin/very-positive.webp";
import type { MoodCategory } from "@/types";

export interface MoodPresentation {
  label: string;
  shortLabel: string;
  image: string;
}

export const MOOD_PRESENTATIONS: Record<MoodCategory, MoodPresentation> = {
  very_difficult: { label: "Tempestade", shortLabel: "Tempestade", image: veryDifficultImage },
  difficult: { label: "Nublado com trovoadas", shortLabel: "Trovoadas", image: difficultImage },
  slightly_difficult: { label: "Céu nublado", shortLabel: "Nublado", image: slightlyDifficultImage },
  mixed: { label: "Céu misturado", shortLabel: "Misto", image: mixedImage },
  slightly_positive: { label: "Céu claro com nuvens", shortLabel: "Céu claro", image: slightlyPositiveImage },
  positive: { label: "Ensolarado", shortLabel: "Ensolarado", image: positiveImage },
  very_positive: { label: "Dia iluminado", shortLabel: "Iluminado", image: veryPositiveImage },
};
