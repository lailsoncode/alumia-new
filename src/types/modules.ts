import type { IconSvgElement } from "@hugeicons/react";

/**
 * @file modules.ts
 * @description Definições de tipos e interfaces para os módulos de bem-estar.
 */

/**
 * Interface que representa um módulo ativo no painel do usuário.
 */
export interface ModuleCardData {
  id: string;
  name: string;
  description: string;
  icon: IconSvgElement;
  tone: string;
  pro?: boolean;
}

/**
 * Interface que representa um módulo disponível para ativação ou desativação.
 */
export interface AvailableModule {
  id: string;
  name: string;
  icon: IconSvgElement;
  tone: string;
  enabled: boolean;
  pro?: boolean;
}
