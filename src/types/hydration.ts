/**
 * @file hydration.ts
 * @description Definições de tipos e interfaces para o módulo de hidratação.
 */

/**
 * Interface que representa um registro de consumo de água.
 */
export interface HydrationLog {
  id: string;
  user_id: string;
  amount_ml: number;
  date: string;
  created_at: string;
}
