import { describe, expect, it } from "vitest";
import { calculateHydrationEstimate } from "./hydration";

describe("calculateHydrationEstimate", () => {
  it("combina porte corporal, idade, clima e atividade e arredonda para 50 ml", () => {
    expect(calculateHydrationEstimate({ age: 28, heightCm: 175, weightKg: 70, climate: "hot", activityMinutes: 60 })).toMatchObject({
      totalMl: 3650,
      baseMl: 2450,
      climateMl: 500,
      activityMl: 700,
      weightWasAdjusted: false,
    });
  });

  it("usa a altura para limitar extrapolação em pesos elevados", () => {
    const estimate = calculateHydrationEstimate({ age: 40, heightCm: 160, weightKg: 140, climate: "cold", activityMinutes: 0 });
    expect(estimate.calculationWeightKg).toBe(76.8);
    expect(estimate.weightWasAdjusted).toBe(true);
    expect(estimate.totalMl).toBe(2450);
  });

  it("rejeita perfis fora do escopo adulto/adolescente da calculadora", () => {
    expect(() => calculateHydrationEstimate({ age: 12, heightCm: 150, weightKg: 45, climate: "mild", activityMinutes: 0 })).toThrow("Idade inválida");
  });
});

