export type HydrationClimate = "cold" | "mild" | "hot";

export interface HydrationProfile {
  age: number;
  heightCm: number;
  weightKg: number;
  climate: HydrationClimate;
  activityMinutes: number;
}

export interface HydrationEstimate {
  totalMl: number;
  baseMl: number;
  climateMl: number;
  activityMl: number;
  calculationWeightKg: number;
  weightWasAdjusted: boolean;
}

const climateAdjustment: Record<HydrationClimate, number> = {
  cold: 0,
  mild: 250,
  hot: 500,
};

function rateForAge(age: number) {
  if (age <= 30) return 35;
  if (age <= 55) return 32;
  return 30;
}

export function calculateHydrationEstimate(profile: HydrationProfile): HydrationEstimate {
  const { age, heightCm, weightKg, climate, activityMinutes } = profile;
  if (!Number.isFinite(age) || age < 14 || age > 100) throw new Error("Idade inválida.");
  if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 230) throw new Error("Altura inválida.");
  if (!Number.isFinite(weightKg) || weightKg < 35 || weightKg > 300) throw new Error("Peso inválido.");
  if (!Number.isFinite(activityMinutes) || activityMinutes < 0 || activityMinutes > 240) throw new Error("Atividade inválida.");

  // Height is used as a guard against extrapolating the weight-based estimate
  // indefinitely. This is a wellness estimate, not a clinical prescription.
  const heightM = heightCm / 100;
  const maximumCalculationWeight = 30 * heightM * heightM;
  const calculationWeightKg = Math.min(weightKg, maximumCalculationWeight);
  const baseMl = calculationWeightKg * rateForAge(age);
  const climateMl = climateAdjustment[climate];
  const activityMl = (activityMinutes / 30) * 350;
  const totalMl = Math.min(5000, Math.max(1500, Math.round((baseMl + climateMl + activityMl) / 50) * 50));

  return {
    totalMl,
    baseMl: Math.round(baseMl),
    climateMl,
    activityMl: Math.round(activityMl),
    calculationWeightKg: Math.round(calculationWeightKg * 10) / 10,
    weightWasAdjusted: calculationWeightKg < weightKg,
  };
}

