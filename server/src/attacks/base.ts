import type {
  AttackPlugin,
  AttackCase,
  AttackCategory,
  AttackContext,
  GradingCriteria,
  Severity,
} from './types.js';

export interface PluginDef {
  id: string;
  category: AttackCategory;
  name: string;
  description: string;
  severity: Severity;
  owasp?: string;
  prompts: string[];
  indicators: string[];
  gradingCriteria: GradingCriteria;
  compatibleMutations?: string[];
  excludedMutations?: string[];
}

export function createPlugin(def: PluginDef): AttackPlugin {
  return {
    ...def,
    async generatePrompts(_ctx: AttackContext): Promise<AttackCase[]> {
      return def.prompts.map(prompt => ({
        prompt,
        indicators: def.indicators,
      }));
    },
    getGradingCriteria(): GradingCriteria {
      return def.gradingCriteria;
    },
    getIndicators(): string[] {
      return def.indicators;
    },
  };
}
